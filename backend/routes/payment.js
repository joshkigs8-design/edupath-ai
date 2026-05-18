// backend/routes/payment.js
const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Helper: mark email as paid in both PaidUser and User tables ──────────────
async function markEmailPaid(email, reference, amount, currency, sessionId) {
  // Save to PaidUser (idempotent — email is unique)
  try {
    await prisma.paidUser.create({
      data: { email, reference, amount: amount || 5000, currency: currency || 'KES', sessionId: sessionId || null },
    });
  } catch (e) {
    if (e.code === 'P2002') {
      // Unique constraint — already saved, that's fine
    } else {
      throw e;
    }
  }

  // Also mark User.hasPaid so OTP login works immediately
  await prisma.user.upsert({
    where:  { email },
    update: { hasPaid: true },
    create: { email, hasPaid: true },
  }).catch(e => console.warn('User.hasPaid upsert warning:', e.message));

  // Link session if provided
  if (sessionId) {
    await prisma.session.updateMany({
      where: { sessionId },
      data:  { email },
    }).catch(() => {});
  }
}

// ── POST /api/payment/verify ─────────────────────────────────────────────────
router.post('/verify', async function(req, res) {
  var reference = (req.body.reference || '').trim();
  var email     = (req.body.email    || '').toLowerCase().trim();
  var sessionId = req.body.sessionId || null;

  console.log('[payment/verify] ref:', reference, 'email:', email);

  if (!reference || !email) {
    return res.status(400).json({ success: false, error: 'reference and email are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address' });
  }

  // Idempotency: already verified with this exact reference?
  try {
    var alreadyPaid = await prisma.paidUser.findUnique({ where: { reference } });
    if (alreadyPaid) {
      console.log('[payment/verify] Already verified:', reference);
      return res.json({ success: true, message: 'Payment already verified', alreadyPaid: true });
    }
  } catch(dbErr) {
    console.error('[payment/verify] DB lookup error:', dbErr.message);
    return res.status(500).json({ success: false, error: 'Database error. Please try again.' });
  }

  var SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!SECRET) {
    console.warn('[payment/verify] PAYSTACK_SECRET_KEY not set');
    // Test mode: allow TEST_ references
    if (reference.startsWith('TEST_')) {
      await markEmailPaid(email, reference, 5000, 'KES', sessionId);
      return res.json({ success: true, message: 'Test payment verified' });
    }
    return res.status(500).json({
      success: false,
      error: 'Payment service not configured on server. Contact support.',
    });
  }

  try {
    // Call Paystack API to verify the transaction
    var paystackRes = await fetch(
      'https://api.paystack.co/transaction/verify/' + encodeURIComponent(reference),
      { headers: { Authorization: 'Bearer ' + SECRET } }
    );

    if (!paystackRes.ok) {
      console.error('[payment/verify] Paystack API HTTP error:', paystackRes.status);
      return res.status(502).json({ success: false, error: 'Could not reach Paystack. Try again.' });
    }

    var data = await paystackRes.json();
    console.log('[payment/verify] Paystack response status:', data?.data?.status, 'amount:', data?.data?.amount);

    // Log the attempt
    await prisma.paymentAttempt.upsert({
      where:  { reference },
      update: { status: data?.data?.status || 'failed' },
      create: {
        reference,
        email,
        status: data?.data?.status || 'failed',
        amount: data?.data?.amount || 0,
      },
    }).catch(() => {});

    // Check payment status
    if (!data?.data || data.data.status !== 'success') {
      console.warn('[payment/verify] Not successful:', data?.data?.status);
      return res.json({
        success: false,
        error: 'Payment status: ' + (data?.data?.status || 'unknown') + '. Please complete payment.',
      });
    }

    // Payment is confirmed — save and unlock
    var amount   = data.data.amount   || 5000;
    var currency = data.data.currency || 'KES';
    await markEmailPaid(email, reference, amount, currency, sessionId);

    console.log('[payment/verify] SUCCESS:', email, reference, amount, currency);
    return res.json({ success: true, message: 'Payment verified. Full access unlocked!' });

  } catch (err) {
    console.error('[payment/verify] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Payment verification error. Please contact support with your reference: ' + reference,
    });
  }
});

// ── GET /api/payment/check-access?email=... ──────────────────────────────────
router.get('/check-access', async function(req, res) {
  var email = (req.query.email || '').toLowerCase().trim();
  if (!email) return res.json({ paid: false });
  try {
    var paid = await prisma.paidUser.findUnique({
      where:  { email },
      select: { paidAt: true },
    });
    return res.json({ paid: !!paid, paidAt: paid ? paid.paidAt : null });
  } catch (err) {
    console.error('[check-access] Error:', err.message);
    return res.json({ paid: false });
  }
});

// ── GET /api/payment/stats ────────────────────────────────────────────────────
router.get('/stats', async function(req, res) {
  try {
    var [total, today] = await Promise.all([
      prisma.paidUser.count(),
      prisma.paidUser.count({
        where: { paidAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
    ]);
    return res.json({ totalPaid: total, paidToday: today });
  } catch (err) {
    return res.json({ totalPaid: 0, paidToday: 0 });
  }
});

// ── POST /api/payment/webhook ─────────────────────────────────────────────────
// Paystack server-side webhook — belt-and-suspenders
// Set in Paystack dashboard → Settings → Webhooks
// URL: https://your-site.netlify.app/.netlify/functions/api/payment/webhook
router.post('/webhook', async function(req, res) {
  var SECRET = process.env.PAYSTACK_SECRET_KEY;
  // Always return 200 first so Paystack doesn't retry
  res.status(200).json({ received: true });

  if (!SECRET) return;

  try {
    var crypto = require('crypto');
    var rawBody = JSON.stringify(req.body);
    var hash    = crypto.createHmac('sha512', SECRET).update(rawBody).digest('hex');
    var sig     = req.headers['x-paystack-signature'] || '';

    if (hash !== sig) {
      console.warn('[webhook] Signature mismatch');
      return;
    }

    var event = req.body;
    if (event.event === 'charge.success') {
      var d     = event.data;
      var email = d?.customer?.email ? d.customer.email.toLowerCase().trim() : null;
      var ref   = d?.reference;
      if (email && ref) {
        await markEmailPaid(email, ref, d.amount, d.currency, null);
        console.log('[webhook] Payment recorded:', email, ref);
      }
    }
  } catch (e) {
    console.error('[webhook] Error:', e.message);
  }
});

module.exports = router;

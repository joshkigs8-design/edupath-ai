// EduPath AI - Netlify Serverless Function
// Handles all API routes: /courses, /students, /payment, /stats

const { PrismaClient } = require('@prisma/client');

let prisma;
function db() {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

function respond(status, body) {
  return {
    statusCode: status,
    headers: {
      'Content-Type':                'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':'Content-Type, Authorization',
      'Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

function body(event) {
  try { return JSON.parse(event.body || '{}'); } catch(e) { return {}; }
}
function qs(event) { return event.queryStringParameters || {}; }

// COURSES
async function courses(method, path, event) {
  var code = path.split('/')[2] || null;
  if (method === 'GET' && !code) {
    var q = qs(event);
    var where = {};
    if (q.field)   where.field   = q.field;
    if (q.demand)  where.demand  = q.demand;
    if (q.cluster) where.cluster = q.cluster;
    if (q.uni)     where.uni     = q.uni;
    if (q.q) where.OR = [
      { name: { contains: q.q, mode: 'insensitive' } },
      { uni:  { contains: q.q, mode: 'insensitive' } },
      { code: { contains: q.q, mode: 'insensitive' } },
    ];
    var list = await db().course.findMany({ where: where, orderBy: { cutoff2024: 'desc' } });
    return respond(200, { courses: list, total: list.length });
  }
  if (method === 'GET' && code) {
    var course = await db().course.findUnique({ where: { code: code } });
    if (!course) return respond(404, { error: 'Not found' });
    return respond(200, { course: course });
  }
  return respond(404, { error: 'Not found' });
}

// STUDENTS
async function students(method, path, event) {
  var sub = path.split('/')[2];
  var b   = body(event);
  if (method === 'POST' && sub === 'session') {
    if (b.sessionId) {
      var s = await db().session.upsert({
        where:  { sessionId: b.sessionId },
        update: {
          ...(b.firstName   && { firstName: b.firstName }),
          ...(b.email       && { email: b.email.toLowerCase().trim() }),
          ...(b.gradesJson  && { gradesJson: b.gradesJson }),
          ...(b.resultsJson && { resultsJson: b.resultsJson }),
          lastSeen: new Date(),
        },
        create: { sessionId: b.sessionId, firstName: b.firstName||null, email: b.email||null, gradesJson: b.gradesJson||null, resultsJson: b.resultsJson||null },
      });
      return respond(200, { session: { sessionId: s.sessionId } });
    }
    var s = await db().session.create({ data: { firstName: b.firstName||null, email: b.email||null, gradesJson: b.gradesJson||null, resultsJson: b.resultsJson||null } });
    return respond(201, { session: { sessionId: s.sessionId } });
  }
  if (method === 'POST' && sub === 'ai-query') {
    if (!b.sessionId || !b.role || !b.content) return respond(400, { error: 'sessionId, role and content required' });
    await db().aiMessage.create({ data: { sessionId: b.sessionId, role: b.role, content: b.content } });
    await db().session.updateMany({ where: { sessionId: b.sessionId }, data: { aiQueries: { increment: 1 } } });
    return respond(200, { logged: true });
  }
  if (method === 'POST' && sub === 'ai-chat') {
    if (!b.messages || !Array.isArray(b.messages)) return respond(400, { error: 'messages array required' });
    var NVIDIA_KEY = process.env.NVIDIA_API_KEY;
    if (!NVIDIA_KEY) return respond(500, { error: 'NVIDIA API key not configured' });
    try {
      var headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + NVIDIA_KEY
      };
      var r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          max_tokens: b.max_tokens || 1024,
          temperature: b.temperature || 0.7,
          messages: b.messages
        })
      });
      if (!r.ok) {
        var errText = await r.text();
        return respond(500, { error: 'NVIDIA API error: ' + errText });
      }
      var data = await r.json();
      var reply = data.choices?.[0]?.message?.content || '';
      if (b.sessionId && reply) {
        await db().aiMessage.create({ data: { sessionId: b.sessionId, role: 'assistant', content: reply } });
        await db().session.updateMany({ where: { sessionId: b.sessionId }, data: { aiQueries: { increment: 1 } } });
      }
      return respond(200, { reply });
    } catch(e) {
      console.error('AI chat error:', e);
      return respond(500, { error: 'AI chat failed' });
    }
  }
  return respond(404, { error: 'Not found' });
}

// PAYMENT
async function payment(method, path, event) {
  var sub = path.split('/')[2];
  var b   = body(event);
  var q   = qs(event);

  // POST /payment/verify
  if (method === 'POST' && sub === 'verify') {
    if (!b.reference || !b.email) return respond(400, { success: false, error: 'reference and email required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) return respond(400, { success: false, error: 'Invalid email' });

    var email = b.email.toLowerCase().trim();
    var ref   = b.reference;
    var sid   = b.sessionId || null;

    var already = await db().paidUser.findUnique({ where: { reference: ref } });
    if (already) return respond(200, { success: true, message: 'Already verified', alreadyPaid: true });

    var SECRET = process.env.PAYSTACK_SECRET_KEY;

    // Test mode
    if (!SECRET) {
      if (ref.startsWith('TEST_')) {
        await db().paidUser.create({ data: { email: email, reference: ref, amount: 5000, sessionId: sid } });
        if (sid) await db().session.updateMany({ where: { sessionId: sid }, data: { email: email } });
        return respond(200, { success: true, message: 'Test payment verified' });
      }
      return respond(500, { success: false, error: 'Payment service not configured. Set PAYSTACK_SECRET_KEY.' });
    }

    try {
      var r = await fetch('https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref), {
        headers: { Authorization: 'Bearer ' + SECRET },
      });
      var data = await r.json();

      await db().paymentAttempt.upsert({
        where:  { reference: ref },
        update: { status: (data.data && data.data.status) || 'failed' },
        create: { reference: ref, email: email, status: (data.data && data.data.status) || 'failed', amount: (data.data && data.data.amount) || 0 },
      });

      if (!data.data || data.data.status !== 'success') {
        return respond(200, { success: false, error: 'Payment was not successful. Status: ' + (data.data && data.data.status) });
      }

      var expected = parseInt(process.env.PAYSTACK_AMOUNT_KOBO || '5000');
      if (data.data.amount < expected) {
        return respond(200, { success: false, error: 'Payment amount does not match.' });
      }

      await db().paidUser.create({ data: { email: email, reference: ref, amount: data.data.amount, currency: data.data.currency || 'KES', sessionId: sid } });
      if (sid) await db().session.updateMany({ where: { sessionId: sid }, data: { email: email } });

      return respond(200, { success: true, message: 'Payment verified! Full access unlocked.' });

    } catch(err) {
      console.error('Paystack error:', err);
      return respond(500, { success: false, error: 'Could not verify payment. Please try again.' });
    }
  }

  // GET /payment/check-access?email=...
  if (method === 'GET' && sub === 'check-access') {
    if (!q.email) return respond(200, { paid: false });
    try {
      var paid = await db().paidUser.findUnique({ where: { email: q.email.toLowerCase().trim() }, select: { paidAt: true } });
      return respond(200, { paid: !!paid, paidAt: paid ? paid.paidAt : null });
    } catch(e) { return respond(200, { paid: false }); }
  }

  // GET /payment/stats
  if (method === 'GET' && sub === 'stats') {
    try {
      var total = await db().paidUser.count();
      var today = await db().paidUser.count({ where: { paidAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } });
      return respond(200, { totalPaid: total, paidToday: today });
    } catch(e) { return respond(200, { totalPaid: 0, paidToday: 0 }); }
  }

  // POST /payment/webhook — Paystack server-side webhook
  if (method === 'POST' && sub === 'webhook') {
    var SECRET = process.env.PAYSTACK_SECRET_KEY;
    if (!SECRET) return respond(200, { received: true });
    // Validate Paystack HMAC signature
    var rawBody = event.body || '';
    var sig     = (event.headers && (event.headers['x-paystack-signature'] || event.headers['X-Paystack-Signature'])) || '';
    var crypto  = require('crypto');
    var hash    = crypto.createHmac('sha512', SECRET).update(rawBody).digest('hex');
    if (hash !== sig) {
      console.warn('Webhook: signature mismatch');
      return respond(400, { error: 'Invalid signature' });
    }
    try {
      var evt   = JSON.parse(rawBody);
      if (evt.event === 'charge.success') {
        var d     = evt.data;
        var email = (d.customer && d.customer.email) ? d.customer.email.toLowerCase().trim() : null;
        var ref   = d.reference;
        if (email && ref) {
          var already = await db().paidUser.findUnique({ where: { reference: ref } });
          if (!already) {
            await db().paidUser.create({ data: { email: email, reference: ref, amount: d.amount||5000, currency: d.currency||'KES' } });
            console.log('Webhook: recorded', email, ref);
          }
        }
      }
    } catch(e) { console.warn('Webhook parse error:', e.message); }
    return respond(200, { received: true });
  }

  return respond(404, { error: 'Not found' });
}

// STATS
async function stats(method, path, event) {
  try {
    var r = await Promise.all([
      db().course.count(), db().university.count(), db().session.count(),
      db().aiMessage.count({ where: { role: 'user' } }),
      db().course.count({ where: { demand: 'high' } }),
      db().paidUser.count(),
    ]);
    return respond(200, { courses: r[0], universities: r[1], sessions: r[2], aiQueries: r[3], highDemand: r[4], paidUsers: r[5] });
  } catch(e) { return respond(500, { error: 'Failed to fetch stats' }); }
}


// ── AUTH ──────────────────────────────────────────────────────────────────────
async function handleAuth(method, path, event) {
  var sub = path.split('/')[2];
  var b   = body(event);
  var crypto = require('crypto');
  var jwt    = require('jsonwebtoken');

  var JWT_SECRET   = process.env.JWT_SECRET   || 'edupath-dev-secret';
  var OTP_SALT     = process.env.OTP_SALT     || 'edupath-otp';
  var SESSION_TTL  = 24 * 60 * 60;
  var OTP_TTL_MS   = 5  * 60 * 1000;
  var MAX_ATTEMPTS = 3;

  function sanitize(e) {
    if (!e || typeof e !== 'string') return null;
    var c = e.toLowerCase().trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c) ? c : null;
  }
  function hashOTP(otp) {
    return crypto.createHash('sha256').update(otp + OTP_SALT).digest('hex');
  }
  function makeToken(userId, email) {
    return jwt.sign({ userId, email, type:'session' }, JWT_SECRET, { expiresIn: SESSION_TTL });
  }
  function genOTP() { return String(Math.floor(100000 + Math.random() * 900000)); }

  async function sendOTPViaAPI(email, otp, isReturning) {
    // If GMAIL not configured, log OTP to console (dev mode)
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log('DEV OTP for', email, ':', otp);
      return;
    }
    var nodemailer = require('nodemailer');
    var mailer = nodemailer.createTransport({ service:'gmail', auth:{ user:process.env.GMAIL_USER, pass:process.env.GMAIL_APP_PASSWORD } });
    await mailer.sendMail({
      from: '"EduPath AI" <' + process.env.GMAIL_USER + '>',
      to:   email,
      subject: isReturning ? 'Your EduPath AI login code' : 'Verify your EduPath AI access',
      html: '<div style="font-family:Arial;max-width:480px;margin:auto;padding:24px">' +
            '<h2 style="color:#7c3aed">EduPath AI</h2>' +
            '<p>' + (isReturning ? 'Welcome back! Your login code:' : 'Your verification code:') + '</p>' +
            '<div style="font-size:2rem;font-weight:900;letter-spacing:.2em;color:#7c3aed;padding:16px;background:#f5f0ff;border-radius:10px;text-align:center">' + otp + '</div>' +
            '<p style="color:#888;font-size:.8rem">Valid for 5 minutes. Do not share this code.</p></div>',
    });
  }

  // POST /auth/request-otp
  if (method === 'POST' && sub === 'request-otp') {
    var email = sanitize(b.email);
    if (!email) return respond(400, { error: 'Valid email required' });

    var user = await db().user.findUnique({ where:{ email } });
    if (!user) user = await db().user.create({ data:{ email } });

    if (!user.hasPaid) {
      var paid = await db().paidUser.findUnique({ where:{ email } });
      if (paid) user = await db().user.update({ where:{ email }, data:{ hasPaid: true } });
    }

    if (!user.hasPaid) return respond(200, { status:'payment_required', email });

    var otp      = genOTP();
    var hashed   = hashOTP(otp);
    var expires  = new Date(Date.now() + OTP_TTL_MS);

    await db().otpCode.deleteMany({ where:{ userId: user.id, used: false } });
    await db().otpCode.create({ data:{ userId: user.id, code: hashed, expiresAt: expires } });

    await sendOTPViaAPI(email, otp, user.verified).catch(e => console.error('OTP email error:', e.message));

    return respond(200, { status:'otp_sent', email, isReturning: user.verified, message:'OTP sent to ' + email });
  }

  // POST /auth/verify-otp
  if (method === 'POST' && sub === 'verify-otp') {
    var email = sanitize(b.email);
    var otp   = String(b.otp || '').trim();
    if (!email || otp.length !== 6 || !/^\d{6}$/.test(otp)) return respond(400, { error:'Email and 6-digit OTP required' });

    var user = await db().user.findUnique({ where:{ email } });
    if (!user)         return respond(404, { error:'No account for this email' });
    if (!user.hasPaid) return respond(403, { error:'Payment required' });

    var rec = await db().otpCode.findFirst({ where:{ userId: user.id, used: false, expiresAt:{ gt: new Date() } }, orderBy:{ createdAt:'desc' } });
    if (!rec) return respond(400, { error:'OTP expired or not found. Request a new one.' });
    if (rec.attempts >= MAX_ATTEMPTS) {
      await db().otpCode.update({ where:{ id: rec.id }, data:{ used: true } });
      return respond(429, { error:'Too many incorrect attempts. Request a new OTP.' });
    }

    var hashed = hashOTP(otp);
    if (hashed !== rec.code) {
      await db().otpCode.update({ where:{ id: rec.id }, data:{ attempts:{ increment:1 } } });
      var left = MAX_ATTEMPTS - rec.attempts - 1;
      return respond(400, { error:'Incorrect OTP. ' + left + ' attempt' + (left===1?'':'s') + ' remaining.' });
    }

    await db().otpCode.update({ where:{ id: rec.id }, data:{ used: true } });
    var token = makeToken(user.id, email);
    await db().user.update({ where:{ email }, data:{ verified: true, lastLogin: new Date(), sessionToken: token } });

    return respond(200, { status:'verified', token, email, message:'Access granted' });
  }

  // GET /auth/check-session
  if (method === 'GET' && sub === 'check-session') {
    var authH  = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
    var token  = authH.startsWith('Bearer ') ? authH.slice(7) : null;
    if (!token) return respond(200, { valid: false });
    try {
      var payload = jwt.verify(token, JWT_SECRET);
      if (payload.type !== 'session') return respond(200, { valid: false });
      var user = await db().user.findFirst({ where:{ email: payload.email, sessionToken: token }, select:{ email:true, hasPaid:true, verified:true } });
      if (!user) return respond(200, { valid: false, reason:'session_revoked' });
      return respond(200, { valid: true, email: user.email, hasPaid: user.hasPaid });
    } catch(e) {
      return respond(200, { valid: false, reason:'token_expired' });
    }
  }

  // POST /auth/mark-paid
  if (method === 'POST' && sub === 'mark-paid') {
    var email = sanitize(b.email);
    if (!email) return respond(400, { error:'email required' });
    await db().user.upsert({ where:{ email }, update:{ hasPaid: true }, create:{ email, hasPaid: true } }).catch(()=>{});
    return respond(200, { success: true });
  }

  // POST /auth/admin-login
  if (method === 'POST' && sub === 'admin-login') {
    var pin = b.pin;
    var adminPin = process.env.ADMIN_PIN;
    var adminPassword = process.env.ADMIN_PASSWORD;
    if (!pin) return respond(400, { error: 'PIN required' });
    var valid = (adminPin && pin === adminPin) || (adminPassword && pin === adminPassword);
    if (!valid) return respond(401, { error: 'Invalid PIN' });
    var token = jwt.sign({ type: 'admin', email: process.env.ADMIN_EMAIL || 'admin@edupath.ai' }, JWT_SECRET, { expiresIn: '8h' });
    return respond(200, { status: 'authenticated', token: token, email: process.env.ADMIN_EMAIL || 'admin@edupath.ai' });
  }

  // POST /auth/logout
  if (method === 'POST' && sub === 'logout') {
    var email = sanitize(b.email);
    if (email) await db().user.updateMany({ where:{ email }, data:{ sessionToken: null } }).catch(()=>{});
    return respond(200, { success: true });
  }

  return respond(404, { error: 'Auth route not found' });
}

// MAIN HANDLER
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' }, body: '' };
  }

  var rawPath = event.path || '';
  var apiPath = rawPath.replace('/.netlify/functions/api', '') || '/';
  var method  = event.httpMethod;

  try {
    if (apiPath === '/health' || apiPath === '/') return respond(200, { status: 'ok', service: 'EduPath AI', runtime: 'Netlify Functions' });
    if (apiPath.startsWith('/auth'))     return await handleAuth(method, apiPath, event);
    if (apiPath.startsWith('/courses'))  return await courses(method, apiPath, event);
    if (apiPath.startsWith('/students')) return await students(method, apiPath, event);
    if (apiPath.startsWith('/payment'))  return await payment(method, apiPath, event);
    if (apiPath.startsWith('/stats'))    return await stats(method, apiPath, event);
    return respond(404, { error: 'Not found: ' + method + ' ' + apiPath });
  } catch(err) {
    console.error('Function error:', err.message);
    return respond(err.status || 500, { error: err.message || 'Internal server error' });
  } finally {
    if (prisma) { await prisma.$disconnect().catch(function(){}); prisma = null; }
  }
};

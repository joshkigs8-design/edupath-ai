// backend/routes/auth.js
// EduPath AI — Email OTP Authentication
// No passwords. Email is identity. OTP proves email ownership.
// Flow: request-otp → verify-otp → session token → check-session

const router  = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const crypto  = require('crypto');
const jwt     = require('jsonwebtoken');

const prisma  = new PrismaClient();

// ── Config ──────────────────────────────────────────────────────────────────
const JWT_SECRET    = process.env.JWT_SECRET || 'edupath-dev-secret-change-in-prod';
const SESSION_TTL   = 24 * 60 * 60;        // 24 hours in seconds
const OTP_TTL_MS    = 5  * 60 * 1000;      // 5 minutes
const MAX_ATTEMPTS  = 3;

// ── Email transporter (Gmail SMTP) ──────────────────────────────────────────
function getMailer() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not account password)
    },
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp + process.env.OTP_SALT || 'edupath-otp').digest('hex');
}

function generateSessionToken(userId, email) {
  return jwt.sign(
    { userId, email, type: 'session' },
    JWT_SECRET,
    { expiresIn: SESSION_TTL }
  );
}

function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const clean = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return null;
  return clean;
}

async function sendOTPEmail(email, otp, isReturning) {
  const mailer = getMailer();
  const subject = isReturning
    ? 'Your EduPath AI login code'
    : 'Verify your EduPath AI access';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0f0a1a;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:480px;margin:32px auto;background:#1c1230;border-radius:16px;overflow:hidden;border:1px solid #3d2d6b">
    <div style="background:linear-gradient(135deg,#7c3aed,#f97316);padding:24px 28px">
      <div style="font-size:1.4rem;font-weight:900;color:#fff;letter-spacing:-.01em">EduPath <em style="font-style:normal;color:#fbbf24">AI</em></div>
      <div style="color:rgba(255,255,255,.8);font-size:.82rem;margin-top:4px">Kenya's #1 KCSE University Course Finder</div>
    </div>
    <div style="padding:28px">
      <div style="font-size:1rem;font-weight:700;color:#f0ebff;margin-bottom:10px">
        ${isReturning ? 'Welcome back! 👋' : 'Almost there! 🎓'}
      </div>
      <div style="font-size:.85rem;color:#c4b8e8;margin-bottom:22px;line-height:1.6">
        ${isReturning
          ? 'Use this code to log in to your EduPath AI account and access all your matched courses:'
          : 'Use this code to verify your email and unlock full access to your matched courses:'}
      </div>
      <div style="background:#0f0a1a;border:2px solid #7c3aed;border-radius:12px;padding:20px;text-align:center;margin-bottom:22px">
        <div style="font-size:2.4rem;font-weight:900;letter-spacing:.25em;color:#a78bfa;font-family:'Courier New',monospace">${otp}</div>
        <div style="font-size:.72rem;color:#7a6b9e;margin-top:6px">Valid for 5 minutes · Do not share this code</div>
      </div>
      <div style="font-size:.75rem;color:#7a6b9e;line-height:1.7;border-top:1px solid #2e1f55;padding-top:16px">
        If you did not request this code, you can safely ignore this email.<br/>
        Need help? WhatsApp us: <a href="https://wa.me/254742868209" style="color:#f97316">0742 868 209</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  await mailer.sendMail({
    from:    `"EduPath AI" <${process.env.GMAIL_USER}>`,
    to:      email,
    subject,
    html,
  });
}

// ── Rate limiter (simple in-memory, resets on server restart) ────────────────
const otpRequestCounts = new Map(); // email → { count, windowStart }
function isRateLimited(email) {
  const now  = Date.now();
  const WINDOW = 15 * 60 * 1000; // 15 minutes
  const MAX    = 5;               // max 5 OTP requests per 15 min per email
  const entry  = otpRequestCounts.get(email) || { count: 0, windowStart: now };
  if (now - entry.windowStart > WINDOW) {
    otpRequestCounts.set(email, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= MAX) return true;
  otpRequestCounts.set(email, { count: entry.count + 1, windowStart: entry.windowStart });
  return false;
}

// ── POST /api/auth/request-otp ───────────────────────────────────────────────
// Input:  { email }
// Logic:  find or create user → if not paid → return payment_required
//         if paid → generate OTP → email it → return { sent: true }
router.post('/request-otp', async (req, res) => {
  const email = sanitizeEmail(req.body.email);
  if (!email) return res.status(400).json({ error: 'Valid email required' });

  if (isRateLimited(email)) {
    return res.status(429).json({ error: 'Too many OTP requests. Please wait 15 minutes.' });
  }

  try {
    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email } });
    }

    // Check payment — also look in PaidUser table (existing payment records)
    if (!user.hasPaid) {
      const paid = await prisma.paidUser.findUnique({ where: { email } });
      if (paid) {
        // Back-fill hasPaid from PaidUser table
        user = await prisma.user.update({ where: { email }, data: { hasPaid: true } });
      }
    }

    if (!user.hasPaid) {
      return res.json({ status: 'payment_required', email });
    }

    // Generate and store OTP (invalidate previous ones)
    const otp     = generateOTP();
    const hashed  = hashOTP(otp);
    const expires = new Date(Date.now() + OTP_TTL_MS);

    // Delete old unused OTPs for this user
    await prisma.otpCode.deleteMany({ where: { userId: user.id, used: false } });

    await prisma.otpCode.create({
      data: { userId: user.id, code: hashed, expiresAt: expires },
    });

    // Send email
    await sendOTPEmail(email, otp, user.verified);

    return res.json({
      status:     'otp_sent',
      email,
      isReturning: user.verified,
      message:    'OTP sent to ' + email,
    });

  } catch (err) {
    console.error('request-otp error:', err);
    return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// ── POST /api/auth/verify-otp ────────────────────────────────────────────────
// Input:  { email, otp }
// Logic:  validate OTP → mark verified → generate session token → return token
router.post('/verify-otp', async (req, res) => {
  const email = sanitizeEmail(req.body.email);
  const otp   = String(req.body.otp || '').trim();

  if (!email || !otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'Email and 6-digit OTP required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'No account found for this email' });
    if (!user.hasPaid) return res.status(403).json({ error: 'Payment required' });

    // Find latest valid OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId:    user.id,
        used:      false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP expired or not found. Request a new one.' });
    }

    // Check max attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { used: true } });
      return res.status(429).json({ error: 'Too many incorrect attempts. Request a new OTP.' });
    }

    // Verify hash
    const hashed = hashOTP(otp);
    if (hashed !== otpRecord.code) {
      await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { attempts: { increment: 1 } } });
      const remaining = MAX_ATTEMPTS - otpRecord.attempts - 1;
      return res.status(400).json({
        error: `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      });
    }

    // OTP correct — mark used, generate session token
    await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { used: true } });

    const token = generateSessionToken(user.id, email);

    await prisma.user.update({
      where: { email },
      data:  { verified: true, lastLogin: new Date(), sessionToken: token },
    });

    return res.json({
      status:  'verified',
      token,
      email,
      message: 'Access granted',
    });

  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// ── GET /api/auth/check-session ──────────────────────────────────────────────
// Header: Authorization: Bearer <token>
// Returns: { valid, email, hasPaid }
router.get('/check-session', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.json({ valid: false });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.type !== 'session') return res.json({ valid: false });

    // Confirm token is still the active one in DB (prevents old token reuse)
    const user = await prisma.user.findFirst({
      where:  { email: payload.email, sessionToken: token },
      select: { email: true, hasPaid: true, verified: true, lastLogin: true },
    });

    if (!user) return res.json({ valid: false, reason: 'session_revoked' });

    return res.json({
      valid:   true,
      email:   user.email,
      hasPaid: user.hasPaid,
      verified: user.verified,
    });
  } catch (err) {
    // JWT expired or malformed
    return res.json({ valid: false, reason: 'token_expired' });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  const email = sanitizeEmail(req.body.email);
  if (email) {
    await prisma.user.updateMany({ where: { email }, data: { sessionToken: null } })
      .catch(() => {});
  }
  return res.json({ success: true });
});

// ── POST /api/auth/admin-login ──────────────────────────────────────────────────
// Admin PIN authentication using ADMIN_PIN or ADMIN_PASSWORD env var
router.post('/admin-login', async (req, res) => {
  const pin = req.body.pin;
  const adminPin = process.env.ADMIN_PIN;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!pin) return res.status(400).json({ error: 'PIN required' });

  const valid = (adminPin && pin === adminPin) ||
                (adminPassword && pin === adminPassword);

  if (!valid) {
    return res.status(401).json({ error: 'Invalid PIN' });
  }

  const token = jwt.sign(
    { type: 'admin', email: process.env.ADMIN_EMAIL || 'admin@edupath.ai' },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({
    status: 'authenticated',
    token,
    email: process.env.ADMIN_EMAIL || 'admin@edupath.ai'
  });
});

module.exports = router;

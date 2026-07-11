const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isFeatureEnabled } = require('../middleware/featureFlagGuard');
const { User, Wallet } = require('../models');
const otpService = require('../services/otpService');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
}

async function register(req, res, next) {
  try {
    const registrationsEnabled = await isFeatureEnabled('orders.new_registrations');
    if (!registrationsEnabled) {
      return res.status(423).json({ error: 'التسجيل الجديد معطّل حاليًا من قبل الإدارة' });
    }

    const { full_name, phone, password, role, otp_code } = req.body;
    if (!full_name || !phone || !password) {
      return res.status(400).json({ error: 'الاسم ورقم الهاتف وكلمة المرور مطلوبة' });
    }

    // إلزامي: التحقق من رمز OTP المرسل عبر SMS/واتساب قبل إنشاء الحساب
    // (يمنع التسجيل الآلي الجماعي لحسابات وهمية)
    if (!otp_code) {
      return res.status(400).json({ error: 'رمز التحقق (OTP) مطلوب لإكمال التسجيل' });
    }
    await otpService.verifyOtp({ phone, purpose: 'register', code: otp_code });

    const existing = await User.findOne({ where: { phone } });
    if (existing) return res.status(409).json({ error: 'تعذّر إتمام التسجيل بهذه البيانات' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      full_name,
      phone,
      password_hash,
      role: ['customer', 'driver', 'restaurant_owner'].includes(role) ? role : 'customer',
      last_login_ip: req.clientIp,
    });

    await Wallet.create({ user_id: user.id, balance: 0 });

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, full_name: user.full_name, role: user.role } });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ where: { phone } });
    if (!user) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    if (!user.is_active) return res.status(403).json({ error: 'هذا الحساب معطّل' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

    await user.update({ last_login_ip: req.clientIp });

    const token = signToken(user);
    res.json({ token, user: { id: user.id, full_name: user.full_name, role: user.role } });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };

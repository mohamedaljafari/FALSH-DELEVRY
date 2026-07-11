const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// رموز التحقق (OTP) عبر SMS أو واتساب — تُستخدم للتسجيل، تسجيل دخول من جهاز جديد،
// وللعمليات المالية الحساسة (تحويل/إيداع) فوق سقف معيّن
const Otp = sequelize.define('Otp', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  code_hash: { type: DataTypes.STRING, allowNull: false }, // لا نخزّن الكود كنص صريح أبدًا
  purpose: {
    type: DataTypes.ENUM('register', 'login', 'wallet_transfer', 'wallet_topup', 'reset_password'),
    allowNull: false,
  },
  channel: { type: DataTypes.ENUM('sms', 'whatsapp'), allowNull: false, defaultValue: 'sms' },
  attempts: { type: DataTypes.INTEGER, defaultValue: 0 }, // عدد محاولات التحقق الخاطئة
  is_used: { type: DataTypes.BOOLEAN, defaultValue: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  ip_requested_from: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'otps',
  indexes: [{ fields: ['phone', 'purpose'] }],
});

module.exports = Otp;

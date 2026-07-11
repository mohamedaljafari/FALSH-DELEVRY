const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { Otp } = require('../models');

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

class OtpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function generateNumericCode() {
  // نستخدم crypto وليس Math.random لتوليد رقم آمن غير قابل للتنبؤ
  const max = 10 ** OTP_LENGTH;
  const code = crypto.randomInt(0, max);
  return String(code).padStart(OTP_LENGTH, '0');
}

/** بوابة إرسال SMS — استبدل هذا بتكامل حقيقي (مثال: مزوّد محلي ليبي أو Twilio) */
async function sendSms(phone, message) {
  if (process.env.SMS_PROVIDER && process.env.SMS_PROVIDER !== 'none') {
    // TODO: نداء API مزوّد SMS الفعلي هنا باستخدام SMS_API_KEY
    // مثال عام:
    // await axios.post(SMS_GATEWAY_URL, { to: phone, message, apiKey: process.env.SMS_API_KEY });
  } else {
    console.log(`[SMS محاكاة] إلى ${phone}: ${message}`);
  }
}

/** بوابة إرسال واتساب عبر WhatsApp Business Cloud API (Meta) */
async function sendWhatsapp(phone, message) {
  if (process.env.WHATSAPP_PROVIDER && process.env.WHATSAPP_PROVIDER !== 'none') {
    // TODO: نداء WhatsApp Business Cloud API الفعلي هنا
    // مثال:
    // await axios.post(
    //   `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    //   {
    //     messaging_product: 'whatsapp',
    //     to: phone,
    //     type: 'template',
    //     template: { name: 'otp_verification', language: { code: 'ar' }, components: [...] },
    //   },
    //   { headers: { Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}` } }
    // );
  } else {
    console.log(`[واتساب محاكاة] إلى ${phone}: ${message}`);
  }
}

/**
 * طلب رمز تحقق جديد. channel: 'sms' | 'whatsapp'
 * يُطبَّق: منع الطلب المتكرر خلال فترة تهدئة قصيرة، وانتهاء صلاحية قصير (5 دقائق) لتقليل نافذة الهجوم.
 */
async function requestOtp({ phone, purpose, channel = 'sms', ip }) {
  if (!phone) throw new OtpError('رقم الهاتف مطلوب');

  const recentOtp = await Otp.findOne({
    where: { phone, purpose, is_used: false, createdAt: { [Op.gt]: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) } },
    order: [['createdAt', 'DESC']],
  });
  if (recentOtp) {
    throw new OtpError(`يرجى الانتظار قبل طلب رمز جديد (${RESEND_COOLDOWN_SECONDS} ثانية بين كل طلب)`, 429);
  }

  const code = generateNumericCode();
  const code_hash = await bcrypt.hash(code, 10);
  const expires_at = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await Otp.create({ phone, code_hash, purpose, channel, expires_at, ip_requested_from: ip });

  const message = `رمز التحقق الخاص بك في فلاش: ${code} (صالح لمدة ${OTP_TTL_MINUTES} دقائق. لا تشاركه مع أحد)`;

  if (channel === 'whatsapp') {
    await sendWhatsapp(phone, message);
  } else {
    await sendSms(phone, message);
  }

  return { sent: true, channel, expiresInMinutes: OTP_TTL_MINUTES };
}

/**
 * التحقق من رمز OTP. يحظر بعد MAX_VERIFY_ATTEMPTS محاولة خاطئة لمنع هجوم التخمين (Brute Force).
 */
async function verifyOtp({ phone, purpose, code }) {
  if (!code) throw new OtpError('رمز التحقق مطلوب');

  const otp = await Otp.findOne({
    where: { phone, purpose, is_used: false, expires_at: { [Op.gt]: new Date() } },
    order: [['createdAt', 'DESC']],
  });

  if (!otp) throw new OtpError('لا يوجد رمز تحقق صالح، يرجى طلب رمز جديد', 404);

  if (otp.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new OtpError('تم تجاوز عدد المحاولات المسموحة، يرجى طلب رمز جديد', 429);
  }

  const valid = await bcrypt.compare(code, otp.code_hash);
  if (!valid) {
    await otp.update({ attempts: otp.attempts + 1 });
    throw new OtpError('رمز التحقق غير صحيح', 401);
  }

  await otp.update({ is_used: true });
  return true;
}

module.exports = { requestOtp, verifyOtp, OtpError };

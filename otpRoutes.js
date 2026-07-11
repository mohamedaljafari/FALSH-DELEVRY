const router = require('express').Router();
const checkBan = require('../middleware/checkBan');
const rateLimit = require('express-rate-limit');
const { validateBody } = require('../middleware/validate');
const { otpRequestSchema, otpVerifySchema } = require('../validation/schemas');
const ctrl = require('../controllers/otpController');

// حماية إضافية: حد صارم لطلبات إرسال الرموز لمنع استنزاف رصيد بوابة SMS/WhatsApp (DoS مالي)
const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  keyGenerator: (req) => req.body?.phone || req.ip,
  message: { error: 'محاولات كثيرة لطلب رمز التحقق، حاول لاحقًا' },
});

router.post('/request', otpRequestLimiter, validateBody(otpRequestSchema), checkBan, ctrl.requestOtp);
router.post('/verify', validateBody(otpVerifySchema), ctrl.verifyOtp);

module.exports = router;

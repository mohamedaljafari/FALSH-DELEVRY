const rateLimit = require('express-rate-limit');

/**
 * حدّ معدل مخصص لكل مستخدم (وليس فقط لكل IP) للعمليات المالية الحساسة،
 * لمنع إساءة استخدام حساب واحد لإطلاق مئات عمليات التحويل/الشحن في ثوانٍ.
 */
function perUserRateLimit({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: { error: message || 'عمليات كثيرة جدًا خلال فترة قصيرة، يرجى المحاولة لاحقًا' },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

module.exports = { perUserRateLimit };

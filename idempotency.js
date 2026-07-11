const { IdempotencyKey } = require('../models');

/**
 * يمنع تكرار تنفيذ عملية مالية حساسة (شحن/تحويل) إن أعاد التطبيق نفس الطلب
 * بسبب انقطاع شبكة أو إعادة محاولة تلقائية. يتطلب من التطبيق إرسال ترويسة:
 * Idempotency-Key: <uuid فريد لكل عملية>
 */
function requireIdempotencyKey(endpointName) {
  return async (req, res, next) => {
    const key = req.headers['idempotency-key'];
    if (!key) {
      return res.status(400).json({ error: 'الترويسة Idempotency-Key مطلوبة لهذه العملية' });
    }

    try {
      const [record, created] = await IdempotencyKey.findOrCreate({
        where: { key },
        defaults: { user_id: req.user.id, endpoint: endpointName, status: 'processing' },
      });

      if (!created) {
        if (record.status === 'completed') {
          // نفّذت هذه العملية من قبل فعلًا — نُعيد نفس النتيجة المخزّنة بدل تنفيذها مجددًا
          return res.status(record.response_status || 200).json(record.response_body);
        }
        // العملية لا تزال قيد التنفيذ (طلب مكرر وصل بينما الأول لم يكتمل بعد)
        return res.status(409).json({ error: 'العملية قيد المعالجة بالفعل، يرجى الانتظار' });
      }

      // نلتقط استجابة res.json الأصلية لتخزينها بعد اكتمال العملية بنجاح
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        try {
          await record.update({ status: 'completed', response_status: res.statusCode, response_body: body });
        } catch (e) {
          console.error('فشل تحديث سجل Idempotency:', e);
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireIdempotencyKey };

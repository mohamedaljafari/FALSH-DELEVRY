/**
 * middleware تحقق صارم من المدخلات (OWASP API3: Broken Object Property Level Authorization
 * وAPI8: Security Misconfiguration). يرفض أي طلب لا يطابق المخطط المتوقع تمامًا
 * بدل تمرير حقول غير متوقعة (مثل محاولة تمرير is_admin أو balance مباشرة من العميل).
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'بيانات الطلب غير صالحة',
        details: result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    req.body = result.data; // نستبدل body بالنسخة المُنقّاة (تُسقط أي حقول غير معرّفة في المخطط)
    next();
  };
}

module.exports = { validateBody };

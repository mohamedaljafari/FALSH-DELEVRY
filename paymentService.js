const { isFeatureEnabled } = require('../middleware/featureFlagGuard');
const walletService = require('./walletService');

/**
 * نقطة دخول موحّدة لدفع أي طلب، بغض النظر عن الوسيلة.
 * يفحص أولاً: هل الوسيلة مفعّلة عمومًا (feature flag)، ثم هل هي محظورة لهذا الحساب تحديدًا.
 */
async function processOrderPayment({ userId, method, amount, orderId }) {
  const globalFlagKey = method === 'cash' ? 'payment.cash' : method === 'electronic' ? 'payment.electronic' : null;

  if (globalFlagKey) {
    const enabled = await isFeatureEnabled(globalFlagKey);
    if (!enabled) {
      const err = new Error(`الدفع عبر (${method}) معطّل حاليًا من قبل إدارة المنصة`);
      err.status = 423;
      throw err;
    }
  }

  await walletService.assertPaymentMethodAllowed(userId, method);

  if (method === 'wallet') {
    return walletService.payOrderFromWallet(userId, amount, orderId);
  }

  if (method === 'cash') {
    // الدفع نقدًا عند الاستلام: لا حركة مالية إلكترونية، يُسجَّل فقط في الطلب
    return { status: 'confirmed_cash_on_delivery' };
  }

  if (method === 'electronic') {
    // TODO: التكامل مع بوابة دفع محلية ليبية (مثل سداد/إدفعلي/موبي كاش) عبر PAYMENT_GATEWAY_PROVIDER
    return { status: 'redirect_to_gateway', provider: process.env.PAYMENT_GATEWAY_PROVIDER || 'none' };
  }

  const err = new Error('وسيلة دفع غير مدعومة');
  err.status = 400;
  throw err;
}

module.exports = { processOrderPayment };

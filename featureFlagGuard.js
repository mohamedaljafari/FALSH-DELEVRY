const { FeatureFlag } = require('../models');

// كاش بسيط في الذاكرة لتقليل الاستعلامات (يُنعش كل 30 ثانية)
let cache = {};
let lastFetch = 0;
const CACHE_TTL_MS = 30 * 1000;

async function refreshCache() {
  const flags = await FeatureFlag.findAll();
  cache = Object.fromEntries(flags.map((f) => [f.key, f.is_enabled]));
  lastFetch = Date.now();
}

async function isFeatureEnabled(key) {
  if (Date.now() - lastFetch > CACHE_TTL_MS) {
    await refreshCache();
  }
  // إن لم يكن المفتاح موجودًا إطلاقًا، نعتبره مُفعّلاً افتراضيًا كي لا نكسر أي مسار غير معرّف بعد
  return cache[key] !== undefined ? cache[key] : true;
}

/**
 * middleware يستخدم داخل أي route:
 * router.post('/wallet/transfer', featureFlagGuard('wallet.p2p_transfer'), controller.transfer)
 * إن كانت الميزة معطّلة من لوحة التحكم، يرفض الطلب فورًا برسالة واضحة.
 */
function featureFlagGuard(key) {
  return async (req, res, next) => {
    try {
      const enabled = await isFeatureEnabled(key);
      if (!enabled) {
        return res.status(423).json({
          error: 'هذه الميزة معطّلة حاليًا من قبل إدارة المنصة',
          feature: key,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { featureFlagGuard, isFeatureEnabled, refreshCache };

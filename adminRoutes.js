const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const admin = require('../controllers/adminController');
const bannerCtrl = require('../controllers/bannerController');
const offerCtrl = require('../controllers/offerController');
const { AuditLog } = require('../models');

router.use(authenticate, requireRole('admin'));

// سجل التدقيق — لمراجعة كل عملية إدارية حساسة (من فعلها، متى، من أي IP)
router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = await AuditLog.findAll({ order: [['created_at', 'DESC']], limit: 200 });
    res.json(logs);
  } catch (err) { next(err); }
});

// مفاتيح الميزات — تفعيل/تعطيل أي شيء يدويًا
router.get('/feature-flags', admin.listFeatureFlags);
router.post('/feature-flags/:key/toggle', admin.toggleFeatureFlag);
router.put('/feature-flags/:key', admin.setFeatureFlag);

// الحظر (هاتف / IP / حساب)
router.get('/bans', admin.listBans);
router.post('/bans', admin.createBan);
router.post('/bans/:id/lift', admin.liftBan);

// حظر وسيلة دفع لحساب معيّن
router.get('/payment-blocks', admin.listPaymentBlocks);
router.post('/payment-blocks', admin.createPaymentBlock);
router.post('/payment-blocks/:id/remove', admin.removePaymentBlock);

// إدارة الحسابات
router.get('/users', admin.listUsers);
router.post('/users/:id/toggle-active', admin.toggleUserActive);
router.post('/users/:userId/wallet/adjust', admin.adjustWallet);

// المطاعم
router.post('/restaurants/:id/approve', admin.approveRestaurant);

// البانرات والعروض (إدارة كاملة)
router.get('/banners', bannerCtrl.listAll);
router.post('/banners', bannerCtrl.create);
router.put('/banners/:id', bannerCtrl.update);
router.post('/banners/:id/toggle', bannerCtrl.toggle);
router.delete('/banners/:id', bannerCtrl.remove);

router.get('/offers', offerCtrl.listAll);
router.post('/offers', offerCtrl.create);
router.put('/offers/:id', offerCtrl.update);
router.post('/offers/:id/toggle', offerCtrl.toggle);
router.delete('/offers/:id', offerCtrl.remove);

module.exports = router;

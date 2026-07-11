const router = require('express').Router();
const { featureFlagGuard } = require('../middleware/featureFlagGuard');
const bannerCtrl = require('../controllers/bannerController');
const offerCtrl = require('../controllers/offerController');

// بانر الصفحة الرئيسية
router.get('/banners', featureFlagGuard('marketing.home_banner'), bannerCtrl.listActiveBanners);

// صفحة العروض والإعلانات
router.get('/offers', featureFlagGuard('marketing.offers_page'), offerCtrl.listActiveOffers);

module.exports = router;

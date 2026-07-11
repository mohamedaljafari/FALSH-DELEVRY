const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { featureFlagGuard } = require('../middleware/featureFlagGuard');
const ctrl = require('../controllers/driverController');
const heatmapCtrl = require('../controllers/heatmapController');

router.use(authenticate, requireRole('driver'));
router.post('/location', ctrl.updateLocation);
router.post('/online', ctrl.goOnline);
router.post('/offline', ctrl.goOffline);
router.post('/orders/:orderId/accept', ctrl.acceptOrder);
router.get('/earnings', ctrl.myEarnings);
router.get('/heatmap', featureFlagGuard('driver.heatmap'), heatmapCtrl.getHeatmap);

module.exports = router;

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { featureFlagGuard } = require('../middleware/featureFlagGuard');
const { requireIdempotencyKey } = require('../middleware/idempotency');
const { perUserRateLimit } = require('../middleware/perUserRateLimit');
const { validateBody } = require('../middleware/validate');
const { walletTopupSchema, walletTransferSchema } = require('../validation/schemas');
const ctrl = require('../controllers/walletController');

router.use(authenticate);
router.get('/me', ctrl.getMyWallet);
router.get('/me/transactions', ctrl.getMyTransactions);

router.post(
  '/topup',
  perUserRateLimit({ windowMs: 60 * 1000, max: 10, message: 'عمليات شحن كثيرة جدًا، حاول بعد قليل' }),
  featureFlagGuard('wallet.topup'),
  validateBody(walletTopupSchema),
  requireIdempotencyKey('wallet.topup'),
  ctrl.topup
);

router.post(
  '/transfer',
  perUserRateLimit({ windowMs: 60 * 1000, max: 10, message: 'عمليات تحويل كثيرة جدًا، حاول بعد قليل' }),
  featureFlagGuard('wallet.p2p_transfer'),
  validateBody(walletTransferSchema),
  requireIdempotencyKey('wallet.transfer'),
  ctrl.transfer
);

module.exports = router;

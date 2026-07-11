const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { requireIdempotencyKey } = require('../middleware/idempotency');
const { perUserRateLimit } = require('../middleware/perUserRateLimit');
const { validateBody } = require('../middleware/validate');
const { createOrderSchema } = require('../validation/schemas');
const ctrl = require('../controllers/orderController');

router.use(authenticate);
router.post(
  '/',
  requireRole('customer'),
  perUserRateLimit({ windowMs: 60 * 1000, max: 15, message: 'عدد كبير من الطلبات خلال دقيقة واحدة' }),
  validateBody(createOrderSchema),
  requireIdempotencyKey('order.create'), // يمنع إنشاء طلب مكرر عند إعادة محاولة الشبكة تلقائيًا
  ctrl.createOrder
);
router.get('/mine', ctrl.getMyOrders);
router.patch('/:id/status', requireRole('driver', 'restaurant_owner', 'admin'), ctrl.updateOrderStatus);

module.exports = router;

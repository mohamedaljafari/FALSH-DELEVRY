const { Order, Restaurant, MenuItem, OrderItem, sequelize } = require('../models');
const paymentService = require('../services/paymentService');

// رسوم توصيل أساسية ثابتة إن لم يُفعَّل حساب ديناميكي (orders.dynamic_delivery_fee)
const BASE_DELIVERY_FEE = 5.0;

/**
 * إصلاح ثغرة حرجة: لم يعد السيرفر يثق بـ items_total/delivery_fee القادمَين من التطبيق.
 * السعر الآن يُحسب حصريًا من MenuItem المخزّنة في قاعدة البيانات (مصدر الحقيقة الوحيد).
 */
async function createOrder(req, res, next) {
  try {
    const {
      restaurant_id, items, payment_method,
      drop_latitude, drop_longitude, scheduled_at, promo_code,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'يجب أن يحتوي الطلب على عنصر واحد على الأقل' });
    }

    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant || !restaurant.is_approved) {
      return res.status(404).json({ error: 'المطعم غير متاح حاليًا' });
    }
    if (!restaurant.is_open) {
      return res.status(423).json({ error: 'المطعم مغلق حاليًا' });
    }

    // جلب الأصناف الفعلية من قاعدة البيانات والتحقق أنها تتبع نفس المطعم ومتاحة
    const menuItemIds = items.map((i) => i.menu_item_id);
    const menuItems = await MenuItem.findAll({
      where: { id: menuItemIds, restaurant_id, is_available: true },
    });
    const menuItemsById = Object.fromEntries(menuItems.map((m) => [m.id, m]));

    let itemsTotal = 0;
    const orderItemsData = [];
    for (const line of items) {
      const menuItem = menuItemsById[line.menu_item_id];
      if (!menuItem) {
        return res.status(400).json({ error: `صنف غير متاح أو لا ينتمي لهذا المطعم: ${line.menu_item_id}` });
      }
      const quantity = Math.max(1, Math.min(50, Number(line.quantity) || 1)); // حد أقصى معقول لكل سطر
      const lineTotal = Number(menuItem.price) * quantity;
      itemsTotal += lineTotal;
      orderItemsData.push({
        menu_item_id: menuItem.id,
        name_snapshot: menuItem.name,
        unit_price_snapshot: menuItem.price,
        quantity,
      });
    }

    const dynamicFeeEnabled = await require('../middleware/featureFlagGuard').isFeatureEnabled('orders.dynamic_delivery_fee');
    const deliveryFee = dynamicFeeEnabled
      ? BASE_DELIVERY_FEE // TODO: ربطها بخوارزمية مسافة/ازدحام فعلية عند تفعيل الميزة
      : BASE_DELIVERY_FEE;

    const total = itemsTotal + deliveryFee;

    const order = await sequelize.transaction(async (t) => {
      const created = await Order.create({
        customer_id: req.user.id,
        restaurant_id,
        payment_method,
        items_total: itemsTotal,
        delivery_fee: deliveryFee,
        total,
        drop_latitude,
        drop_longitude,
        scheduled_at: scheduled_at || null,
        promo_code: promo_code || null,
      }, { transaction: t });

      await OrderItem.bulkCreate(
        orderItemsData.map((d) => ({ ...d, order_id: created.id })),
        { transaction: t }
      );

      return created;
    });

    const paymentResult = await paymentService.processOrderPayment({
      userId: req.user.id,
      method: payment_method,
      amount: total,
      orderId: order.id,
    });

    res.status(201).json({ order, payment: paymentResult });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

// تسلسل الحالات المسموح به لكل نوع مستخدم — يمنع تخطي حالات أو تعديل من غير صاحب علاقة (BOLA)
const ALLOWED_TRANSITIONS = {
  restaurant_owner: { pending: 'accepted', accepted: 'preparing', preparing: 'ready_for_pickup' },
  driver: { ready_for_pickup: 'picked_up', picked_up: 'delivered' },
  admin: null, // الأدمن مسموح له بأي انتقال
};

async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByPk(id, { include: [{ association: 'Restaurant' }] });
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

    // إغلاق ثغرة BOLA: التحقق أن مستخدم الطلب فعلاً طرف في هذا الطلب تحديدًا وليس فقط يملك الدور
    if (req.user.role === 'driver' && order.driver_id !== req.user.id) {
      return res.status(403).json({ error: 'لا تملك صلاحية تعديل هذا الطلب' });
    }
    if (req.user.role === 'restaurant_owner') {
      const restaurant = await Restaurant.findOne({ where: { id: order.restaurant_id, owner_id: req.user.id } });
      if (!restaurant) return res.status(403).json({ error: 'لا تملك صلاحية تعديل هذا الطلب' });
    }

    // التحقق أن الانتقال بين الحالات منطقي ومسموح لهذا الدور تحديدًا
    if (req.user.role !== 'admin') {
      const allowed = ALLOWED_TRANSITIONS[req.user.role] || {};
      if (allowed[order.status] !== status) {
        return res.status(409).json({ error: `لا يمكن الانتقال من (${order.status}) إلى (${status}) بهذه الصلاحية` });
      }
    }

    await order.update({ status });

    // بث التحديث لحظيًا عبر Socket.IO لكل الأطراف المتابعة لهذا الطلب
    const io = req.app.get('io');
    if (io) io.to(`order:${order.id}`).emit('order:status_updated', { orderId: order.id, status: order.status });

    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const where = req.user.role === 'driver'
      ? { driver_id: req.user.id }
      : { customer_id: req.user.id };
    const orders = await Order.findAll({ where, order: [['created_at', 'DESC']], limit: 50 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, updateOrderStatus, getMyOrders };

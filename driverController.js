const { DriverLocation, Order } = require('../models');

async function updateLocation(req, res, next) {
  try {
    const { latitude, longitude, is_online, is_available } = req.body;
    const [loc] = await DriverLocation.findOrCreate({
      where: { driver_id: req.user.id },
      defaults: { latitude, longitude, is_online, is_available, updated_at_ms: Date.now() },
    });
    await loc.update({
      latitude, longitude,
      is_online: is_online ?? loc.is_online,
      is_available: is_available ?? loc.is_available,
      updated_at_ms: Date.now(),
    });
    res.json(loc);
  } catch (err) {
    next(err);
  }
}

async function goOnline(req, res, next) {
  try {
    const [loc] = await DriverLocation.findOrCreate({
      where: { driver_id: req.user.id },
      defaults: { latitude: 0, longitude: 0, is_online: true, is_available: true, updated_at_ms: Date.now() },
    });
    await loc.update({ is_online: true, is_available: true });
    res.json({ message: 'تم تفعيل الاتصال', location: loc });
  } catch (err) {
    next(err);
  }
}

async function goOffline(req, res, next) {
  try {
    const loc = await DriverLocation.findOne({ where: { driver_id: req.user.id } });
    if (loc) await loc.update({ is_online: false, is_available: false });
    res.json({ message: 'تم إيقاف الاتصال' });
  } catch (err) {
    next(err);
  }
}

async function acceptOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });
    if (order.driver_id) return res.status(409).json({ error: 'تم إسناد هذا الطلب لسائق آخر بالفعل' });

    await order.update({ driver_id: req.user.id, status: 'accepted' });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function myEarnings(req, res, next) {
  try {
    const orders = await Order.findAll({
      where: { driver_id: req.user.id, status: 'delivered' },
      order: [['created_at', 'DESC']],
      limit: 200,
    });
    const totalDeliveryFees = orders.reduce((sum, o) => sum + Number(o.delivery_fee), 0);
    res.json({ deliveredOrdersCount: orders.length, totalDeliveryFees, orders });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateLocation, goOnline, goOffline, acceptOrder, myEarnings };

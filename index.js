const jwt = require('jsonwebtoken');

/**
 * أحداث لحظية:
 * - driver:location_update -> يبث موقع السائق لتطبيق الزبون المتابع للطلب
 * - order:status_updated   -> يبث تحديث حالة الطلب لكل الأطراف (زبون/سائق/مطعم)
 */
function initSockets(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('توكن مفقود'));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      next();
    } catch (err) {
      next(new Error('توكن غير صالح'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);
    if (socket.user.role === 'driver') socket.join('drivers_online');

    socket.on('driver:location_update', (data) => {
      // يُبث فقط لغرفة الطلب الحالي إن وُجد orderId
      if (data.orderId) {
        io.to(`order:${data.orderId}`).emit('driver:location', {
          driverId: socket.user.id,
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    });

    socket.on('order:track', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('disconnect', () => {
      // يمكن هنا تحديث DriverLocation.is_online = false عند الانقطاع الطويل
    });
  });
}

/** يُستدعى من أي controller لبث تحديث حالة الطلب */
function broadcastOrderStatus(io, order) {
  io.to(`order:${order.id}`).emit('order:status_updated', {
    orderId: order.id,
    status: order.status,
  });
}

module.exports = { initSockets, broadcastOrderStatus };

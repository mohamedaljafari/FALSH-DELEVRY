const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  customer_id: { type: DataTypes.UUID, allowNull: false },
  restaurant_id: { type: DataTypes.UUID, allowNull: false },
  driver_id: { type: DataTypes.UUID, allowNull: true },
  status: {
    type: DataTypes.ENUM(
      'pending', 'accepted', 'preparing', 'ready_for_pickup',
      'picked_up', 'delivered', 'cancelled'
    ),
    defaultValue: 'pending',
  },
  payment_method: { type: DataTypes.ENUM('cash', 'electronic', 'wallet'), allowNull: false },
  items_total: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
  delivery_fee: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
  drop_latitude: { type: DataTypes.FLOAT, allowNull: true },
  drop_longitude: { type: DataTypes.FLOAT, allowNull: true },
  scheduled_at: { type: DataTypes.DATE, allowNull: true }, // للطلبات المجدولة
  promo_code: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'orders',
  indexes: [
    { fields: ['customer_id'] },
    { fields: ['driver_id'] },
    { fields: ['restaurant_id'] },
    { fields: ['created_at'] },
    { fields: ['drop_latitude', 'drop_longitude'] },
  ],
});

module.exports = Order;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// سطر ضمن الطلب — يحفظ السعر وقت الطلب (snapshot) حتى لو تغيّر سعر الصنف لاحقًا
const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID, allowNull: false },
  menu_item_id: { type: DataTypes.UUID, allowNull: false },
  name_snapshot: { type: DataTypes.STRING, allowNull: false },
  unit_price_snapshot: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, {
  tableName: 'order_items',
});

module.exports = OrderItem;

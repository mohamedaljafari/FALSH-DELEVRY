const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// عنصر في قائمة طعام المطعم — السعر هنا هو "مصدر الحقيقة" الوحيد
// يُستخدم لحساب قيمة الطلب من الخادم، ولا يُسمح أبدًا بالثقة بسعر يرسله التطبيق
const MenuItem = sequelize.define('MenuItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'menu_items',
  indexes: [{ fields: ['restaurant_id'] }],
});

module.exports = MenuItem;

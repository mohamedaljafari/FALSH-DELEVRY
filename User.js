const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// المستخدم العام: زبون / سائق / صاحب مطعم / أدمن
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  full_name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false, unique: true }, // رقم الهاتف الليبي
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('customer', 'driver', 'restaurant_owner', 'admin'),
    allowNull: false,
    defaultValue: 'customer',
  },
  city_id: { type: DataTypes.UUID, allowNull: true }, // لدعم التوسع لعدة مدن
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  last_login_ip: { type: DataTypes.STRING, allowNull: true },
  reliability_score: { type: DataTypes.FLOAT, defaultValue: 100.0 }, // ميزة السوق الليبي: تقييم الأمانة
}, {
  tableName: 'users',
});

module.exports = User;

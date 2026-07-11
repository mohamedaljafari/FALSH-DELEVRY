const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Restaurant = sequelize.define('Restaurant', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  owner_id: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  city_id: { type: DataTypes.UUID, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: true },
  latitude: { type: DataTypes.FLOAT, allowNull: true },
  longitude: { type: DataTypes.FLOAT, allowNull: true },
  is_open: { type: DataTypes.BOOLEAN, defaultValue: true }, // فتح/إغلاق يدوي من صاحب المطعم
  is_approved: { type: DataTypes.BOOLEAN, defaultValue: false }, // موافقة الأدمن
  commission_rate: { type: DataTypes.FLOAT, defaultValue: 15.0 }, // نسبة عمولة المنصة %
}, {
  tableName: 'restaurants',
});

module.exports = Restaurant;

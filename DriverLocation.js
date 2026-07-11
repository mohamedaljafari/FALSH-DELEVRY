const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// آخر مواقع السائقين (تُحدَّث بشكل متكرر عبر Socket.IO) + تُستخدم لبناء الخريطة الحرارية
const DriverLocation = sequelize.define('DriverLocation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  driver_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  latitude: { type: DataTypes.FLOAT, allowNull: false },
  longitude: { type: DataTypes.FLOAT, allowNull: false },
  is_online: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_available: { type: DataTypes.BOOLEAN, defaultValue: false }, // متصل لكن مشغول بطلب
  updated_at_ms: { type: DataTypes.BIGINT, allowNull: true },
}, {
  tableName: 'driver_locations',
  indexes: [{ fields: ['is_online'] }, { fields: ['latitude', 'longitude'] }],
});

module.exports = DriverLocation;

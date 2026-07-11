const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// بانر أعلى الصفحة الرئيسية لتطبيق الزبون
const Banner = sequelize.define('Banner', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: false },
  link_type: { type: DataTypes.ENUM('restaurant', 'offer', 'external_url', 'none'), defaultValue: 'none' },
  link_value: { type: DataTypes.STRING, allowNull: true },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }, // تفعيل/تعطيل يدوي لكل بانر
  starts_at: { type: DataTypes.DATE, allowNull: true },
  ends_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'banners',
});

module.exports = Banner;

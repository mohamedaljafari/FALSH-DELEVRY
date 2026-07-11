const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// عروض/إعلانات تظهر في صفحة العروض المستقلة
const Offer = sequelize.define('Offer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  image_url: { type: DataTypes.STRING, allowNull: true },
  discount_type: { type: DataTypes.ENUM('percentage', 'fixed_amount', 'free_delivery'), allowNull: false },
  discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  promo_code: { type: DataTypes.STRING, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  starts_at: { type: DataTypes.DATE, allowNull: true },
  ends_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'offers',
});

module.exports = Offer;

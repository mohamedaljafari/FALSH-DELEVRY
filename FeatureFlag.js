const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FeatureFlag = sequelize.define('FeatureFlag', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  label: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  is_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  updated_by_admin_id: { type: DataTypes.UUID, allowNull: true },
}, {
  tableName: 'feature_flags',
});

module.exports = FeatureFlag;

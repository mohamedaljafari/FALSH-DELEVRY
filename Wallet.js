const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Wallet = sequelize.define('Wallet', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  balance: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
  currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'LYD' },
  is_frozen: { type: DataTypes.BOOLEAN, defaultValue: false }, // تجميد المحفظة يدويًا من الأدمن
}, {
  tableName: 'wallets',
});

module.exports = Wallet;

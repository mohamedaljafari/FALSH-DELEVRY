const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// حظر حساب/رقم هاتف/عنوان IP - يمكن الجمع بينها
const Ban = sequelize.define('Ban', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: {
    type: DataTypes.ENUM('phone', 'ip', 'user_id'),
    allowNull: false,
  },
  value: { type: DataTypes.STRING, allowNull: false }, // رقم الهاتف أو IP أو user_id
  reason: { type: DataTypes.STRING, allowNull: true },
  banned_by_admin_id: { type: DataTypes.UUID, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  expires_at: { type: DataTypes.DATE, allowNull: true }, // null = حظر دائم
}, {
  tableName: 'bans',
  indexes: [{ fields: ['type', 'value'] }],
});

module.exports = Ban;

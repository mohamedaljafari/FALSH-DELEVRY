const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// حظر وسيلة دفع معينة لحساب معين يدويًا (مثال: منع الدفع النقدي لزبون كثير الإلغاء)
const PaymentMethodBlock = sequelize.define('PaymentMethodBlock', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  method: {
    type: DataTypes.ENUM('cash', 'electronic', 'wallet'),
    allowNull: false,
  },
  reason: { type: DataTypes.STRING, allowNull: true },
  blocked_by_admin_id: { type: DataTypes.UUID, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'payment_method_blocks',
  indexes: [{ unique: true, fields: ['user_id', 'method'] }],
});

module.exports = PaymentMethodBlock;

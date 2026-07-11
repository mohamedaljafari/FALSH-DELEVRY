const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// سجل كل حركة على المحفظة: شحن، تحويل صادر/وارد، دفع طلب، استرجاع
const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  wallet_id: { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM('topup', 'transfer_in', 'transfer_out', 'order_payment', 'refund', 'admin_adjustment'),
    allowNull: false,
  },
  amount: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
  balance_after: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
  related_user_id: { type: DataTypes.UUID, allowNull: true }, // الطرف الآخر في التحويل
  related_order_id: { type: DataTypes.UUID, allowNull: true },
  note: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'transactions',
  indexes: [{ fields: ['wallet_id', 'created_at'] }],
});

module.exports = Transaction;

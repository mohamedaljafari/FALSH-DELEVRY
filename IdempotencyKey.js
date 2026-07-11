const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// مفتاح تكرار العملية: يمنع تنفيذ نفس عملية الشحن/التحويل مرتين
// عندما يعيد التطبيق إرسال نفس الطلب بسبب انقطاع الشبكة أو إعادة محاولة تلقائية
const IdempotencyKey = sequelize.define('IdempotencyKey', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  key: { type: DataTypes.STRING, allowNull: false, unique: true }, // يُرسل من التطبيق في header: Idempotency-Key
  user_id: { type: DataTypes.UUID, allowNull: false },
  endpoint: { type: DataTypes.STRING, allowNull: false },
  response_status: { type: DataTypes.INTEGER, allowNull: true },
  response_body: { type: DataTypes.JSONB, allowNull: true },
  status: { type: DataTypes.ENUM('processing', 'completed'), defaultValue: 'processing' },
}, {
  tableName: 'idempotency_keys',
});

module.exports = IdempotencyKey;

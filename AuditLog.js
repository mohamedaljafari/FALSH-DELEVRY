const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// سجل تدقيق لكل عملية إدارية حساسة: من فعلها، متى، من أي IP، وما التغيير
const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  actor_admin_id: { type: DataTypes.UUID, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false }, // مثال: 'wallet.adjust', 'ban.create', 'feature_flag.toggle'
  target_type: { type: DataTypes.STRING, allowNull: true },
  target_id: { type: DataTypes.STRING, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: true },
  ip_address: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'audit_logs',
  indexes: [{ fields: ['actor_admin_id'] }, { fields: ['action'] }],
});

module.exports = AuditLog;

const sequelize = require('../config/db');
const User = require('./User');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const PaymentMethodBlock = require('./PaymentMethodBlock');
const Ban = require('./Ban');
const FeatureFlag = require('./FeatureFlag');
const Banner = require('./Banner');
const Offer = require('./Offer');
const Restaurant = require('./Restaurant');
const Order = require('./Order');
const DriverLocation = require('./DriverLocation');
const Otp = require('./Otp');
const MenuItem = require('./MenuItem');
const OrderItem = require('./OrderItem');
const IdempotencyKey = require('./IdempotencyKey');
const AuditLog = require('./AuditLog');

// العلاقات
User.hasOne(Wallet, { foreignKey: 'user_id' });
Wallet.belongsTo(User, { foreignKey: 'user_id' });

Wallet.hasMany(Transaction, { foreignKey: 'wallet_id' });
Transaction.belongsTo(Wallet, { foreignKey: 'wallet_id' });

User.hasMany(PaymentMethodBlock, { foreignKey: 'user_id' });
User.hasMany(Restaurant, { foreignKey: 'owner_id' });
Restaurant.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Restaurant.hasMany(Order, { foreignKey: 'restaurant_id' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });
User.hasMany(Order, { foreignKey: 'customer_id', as: 'customerOrders' });
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
User.hasMany(Order, { foreignKey: 'driver_id', as: 'driverOrders' });
Order.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });

User.hasOne(DriverLocation, { foreignKey: 'driver_id' });
DriverLocation.belongsTo(User, { foreignKey: 'driver_id' });

Restaurant.hasMany(Offer, { foreignKey: 'restaurant_id' });

Restaurant.hasMany(MenuItem, { foreignKey: 'restaurant_id' });
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = {
  sequelize,
  User,
  Wallet,
  Transaction,
  PaymentMethodBlock,
  Ban,
  FeatureFlag,
  Banner,
  Offer,
  Restaurant,
  Order,
  DriverLocation,
  Otp,
  MenuItem,
  OrderItem,
  IdempotencyKey,
  AuditLog,
};

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'flash_platform',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
    // مهم تحت الحمل العالي: الإعداد الافتراضي (5 اتصالات) يخنق الخادم عند مئات
    // الطلبات المتزامنة. اضبط هذه القيم حسب حدود قاعدة البيانات الفعلية (راجع max_connections).
    pool: {
      max: Number(process.env.DB_POOL_MAX) || 50,
      min: Number(process.env.DB_POOL_MIN) || 5,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;

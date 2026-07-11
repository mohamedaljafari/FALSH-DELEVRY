require('dotenv').config();
const { sequelize } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✔ الاتصال بقاعدة البيانات ناجح');
    await sequelize.sync({ alter: true });
    console.log('✔ تم إنشاء/تحديث كل الجداول بنجاح');
    process.exit(0);
  } catch (err) {
    console.error('✘ فشل الاتصال أو إنشاء الجداول:', err);
    process.exit(1);
  }
})();

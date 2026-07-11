require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Wallet, FeatureFlag, Restaurant, MenuItem } = require('../models');
const defaultFlags = require('./featureFlags');

(async () => {
  try {
    await sequelize.authenticate();

    // 1) إنشاء مفاتيح الميزات الافتراضية إن لم تكن موجودة
    for (const flag of defaultFlags) {
      await FeatureFlag.findOrCreate({
        where: { key: flag.key },
        defaults: {
          label: flag.label,
          category: flag.category,
          is_enabled: flag.default,
        },
      });
    }
    console.log(`✔ تم إنشاء ${defaultFlags.length} مفتاح ميزة (feature flags)`);

    // 2) إنشاء حساب أدمن افتراضي
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (!existingAdmin) {
      const password_hash = await bcrypt.hash('Admin@12345', 10);
      const admin = await User.create({
        full_name: 'مدير المنصة',
        phone: '218900000000',
        password_hash,
        role: 'admin',
      });
      await Wallet.create({ user_id: admin.id, balance: 0, currency: 'LYD' });
      console.log('✔ تم إنشاء حساب أدمن افتراضي: 218900000000 / Admin@12345 (يرجى تغييره فورًا)');
    }

    // 3) مطعم تجريبي + صنف تجريبي (لاختبار تدفق الطلب والسعر المحسوب من الخادم)
    let demoRestaurant = await Restaurant.findOne({ where: { name: 'مطعم فلاش التجريبي' } });
    if (!demoRestaurant) {
      const ownerPasswordHash = await bcrypt.hash('Owner@12345', 10);
      const owner = await User.create({
        full_name: 'صاحب مطعم تجريبي',
        phone: '218900000001',
        password_hash: ownerPasswordHash,
        role: 'restaurant_owner',
      });
      await Wallet.create({ user_id: owner.id, balance: 0 });

      demoRestaurant = await Restaurant.create({
        owner_id: owner.id,
        name: 'مطعم فلاش التجريبي',
        is_open: true,
        is_approved: true,
      });

      await MenuItem.create({
        restaurant_id: demoRestaurant.id,
        name: 'برغر تجريبي',
        price: 15.5,
        is_available: true,
      });

      console.log('✔ تم إنشاء مطعم تجريبي وصنف تجريبي لاختبار تدفق الطلبات');
    }

    console.log('✔ اكتمل التزويد بالبيانات الأولية (seed)');
    process.exit(0);
  } catch (err) {
    console.error('✘ فشل التزويد بالبيانات:', err);
    process.exit(1);
  }
})();

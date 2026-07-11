// تشغيل السيرفر بوضع Cluster عبر PM2 يستغل كل أنوية المعالج بدل عملية واحدة فقط.
// هذا ضروري لتحمّل آلاف الطلبات المتزامنة (راجع docs/LOAD_TESTING.md).
// التشغيل: pm2 start ecosystem.config.js --env production
module.exports = {
  apps: [
    {
      name: 'flash-backend',
      script: 'src/server.js',
      instances: 'max', // استخدام كل الأنوية المتاحة
      exec_mode: 'cluster',
      env: { NODE_ENV: 'development' },
      env_production: { NODE_ENV: 'production' },
      max_memory_restart: '512M',
    },
  ],
};

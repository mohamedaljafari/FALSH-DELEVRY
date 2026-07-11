require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const { sequelize } = require('./models');
const { initSockets } = require('./sockets');

const authRoutes = require('./routes/authRoutes');
const otpRoutes = require('./routes/otpRoutes');
const walletRoutes = require('./routes/walletRoutes');
const orderRoutes = require('./routes/orderRoutes');
const driverRoutes = require('./routes/driverRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// قائمة النطاقات/التطبيقات المسموح لها بالاتصال — لا تُترك مفتوحة (*) في الإنتاج
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:19006')
  .split(',')
  .map((s) => s.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // نسمح بدون origin (تطبيقات الموبايل الأصلية) لكن نقيّد المتصفح فقط بالنطاقات المعروفة
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('غير مسموح: مصدر الطلب غير موثوق (CORS)'));
  },
  credentials: true,
};

const io = new Server(server, { cors: corsOptions });
app.set('io', io);

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// حماية عامة من الطلبات الكثيفة
app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'flash-platform-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// معالج أخطاء موحّد
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'خطأ داخلي في الخادم' });
});

initSockets(io);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✔ متصل بقاعدة البيانات');
    server.listen(PORT, () => console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`));
  } catch (err) {
    console.error('✘ فشل تشغيل الخادم:', err);
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };

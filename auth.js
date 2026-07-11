const jwt = require('jsonwebtoken');
const { User, Ban } = require('../models');
const { Op } = require('sequelize');

// كاش قصير جدًا (10 ثوانٍ) لحالة "نشط/محظور" لكل مستخدم، لتفادي استعلام على كل طلب
// مع ضمان أن التعطيل/الحظر يسري خلال ثوانٍ معدودة بدل الانتظار حتى انتهاء صلاحية التوكن (30 يومًا)
const statusCache = new Map();
const STATUS_CACHE_TTL_MS = 10 * 1000;

async function isUserBlocked(userId) {
  const cached = statusCache.get(userId);
  if (cached && Date.now() - cached.checkedAt < STATUS_CACHE_TTL_MS) {
    return cached.blocked;
  }

  const user = await User.findByPk(userId, { attributes: ['id', 'is_active', 'phone'] });
  if (!user || !user.is_active) {
    statusCache.set(userId, { blocked: true, checkedAt: Date.now() });
    return true;
  }

  const activeBan = await Ban.findOne({
    where: {
      is_active: true,
      type: 'user_id',
      value: userId,
      [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: new Date() } }],
    },
  });

  const blocked = !!activeBan;
  statusCache.set(userId, { blocked, checkedAt: Date.now() });
  return blocked;
}

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح: التوكن مفقود' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // إغلاق ثغرة "التوكن يبقى صالحًا بعد الحظر/التعطيل" — نتحقق من الحالة الحيّة للحساب
    const blocked = await isUserBlocked(payload.id);
    if (blocked) {
      return res.status(403).json({ error: 'هذا الحساب معطّل أو محظور حاليًا' });
    }

    req.user = payload; // { id, role, phone }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'التوكن غير صالح أو منتهي' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'لا تملك صلاحية الوصول لهذا المورد' });
    }
    next();
  };
}

/** يُستدعى من adminController فور تعطيل حساب أو إضافة حظر، لإسقاط الكاش فورًا بدل انتظار 10 ثوانٍ */
function invalidateUserStatusCache(userId) {
  statusCache.delete(userId);
}

module.exports = { authenticate, requireRole, invalidateUserStatusCache };

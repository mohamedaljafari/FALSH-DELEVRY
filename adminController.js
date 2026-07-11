const { FeatureFlag, Ban, PaymentMethodBlock, User, Wallet, Restaurant, AuditLog } = require('../models');
const { refreshCache } = require('../middleware/featureFlagGuard');
const { invalidateUserStatusCache } = require('../middleware/auth');
const walletService = require('../services/walletService');

/** يسجّل كل عملية إدارية حساسة لأغراض التدقيق والمساءلة */
async function logAdminAction(req, action, targetType, targetId, metadata) {
  try {
    await AuditLog.create({
      actor_admin_id: req.user.id,
      action,
      target_type: targetType,
      target_id: String(targetId || ''),
      metadata: metadata || null,
      ip_address: req.clientIp || req.ip,
    });
  } catch (e) {
    console.error('فشل تسجيل سجل التدقيق:', e);
  }
}

/* ---------- مفاتيح الميزات (تفعيل/تعطيل أي شيء يدويًا) ---------- */
async function listFeatureFlags(req, res, next) {
  try {
    const flags = await FeatureFlag.findAll({ order: [['category', 'ASC'], ['label', 'ASC']] });
    res.json(flags);
  } catch (err) { next(err); }
}

async function toggleFeatureFlag(req, res, next) {
  try {
    const flag = await FeatureFlag.findOne({ where: { key: req.params.key } });
    if (!flag) return res.status(404).json({ error: 'المفتاح غير موجود' });
    await flag.update({ is_enabled: !flag.is_enabled, updated_by_admin_id: req.user.id });
    await refreshCache();
    await logAdminAction(req, 'feature_flag.toggle', 'feature_flag', flag.key, { is_enabled: flag.is_enabled });
    res.json(flag);
  } catch (err) { next(err); }
}

async function setFeatureFlag(req, res, next) {
  try {
    const { is_enabled } = req.body;
    const flag = await FeatureFlag.findOne({ where: { key: req.params.key } });
    if (!flag) return res.status(404).json({ error: 'المفتاح غير موجود' });
    await flag.update({ is_enabled: !!is_enabled, updated_by_admin_id: req.user.id });
    await refreshCache();
    await logAdminAction(req, 'feature_flag.set', 'feature_flag', flag.key, { is_enabled: flag.is_enabled });
    res.json(flag);
  } catch (err) { next(err); }
}

/* ---------- الحظر حسب الهاتف/IP/الحساب ---------- */
async function listBans(req, res, next) {
  try {
    const bans = await Ban.findAll({ order: [['created_at', 'DESC']] });
    res.json(bans);
  } catch (err) { next(err); }
}

async function createBan(req, res, next) {
  try {
    const { type, value, reason, expires_at } = req.body;
    const ban = await Ban.create({
      type, value, reason, expires_at: expires_at || null,
      banned_by_admin_id: req.user.id, is_active: true,
    });
    if (type === 'user_id') invalidateUserStatusCache(value);
    await logAdminAction(req, 'ban.create', 'ban', ban.id, { type, value, reason });
    res.status(201).json(ban);
  } catch (err) { next(err); }
}

async function liftBan(req, res, next) {
  try {
    const ban = await Ban.findByPk(req.params.id);
    if (!ban) return res.status(404).json({ error: 'سجل الحظر غير موجود' });
    await ban.update({ is_active: false });
    if (ban.type === 'user_id') invalidateUserStatusCache(ban.value);
    await logAdminAction(req, 'ban.lift', 'ban', ban.id);
    res.json(ban);
  } catch (err) { next(err); }
}

/* ---------- حظر وسيلة دفع معينة لحساب معين ---------- */
async function listPaymentBlocks(req, res, next) {
  try {
    const blocks = await PaymentMethodBlock.findAll({ order: [['created_at', 'DESC']] });
    res.json(blocks);
  } catch (err) { next(err); }
}

async function createPaymentBlock(req, res, next) {
  try {
    const { user_id, method, reason } = req.body;
    const [block, created] = await PaymentMethodBlock.findOrCreate({
      where: { user_id, method },
      defaults: { reason, blocked_by_admin_id: req.user.id, is_active: true },
    });
    if (!created) await block.update({ is_active: true, reason, blocked_by_admin_id: req.user.id });
    res.status(201).json(block);
  } catch (err) { next(err); }
}

async function removePaymentBlock(req, res, next) {
  try {
    const block = await PaymentMethodBlock.findByPk(req.params.id);
    if (!block) return res.status(404).json({ error: 'السجل غير موجود' });
    await block.update({ is_active: false });
    res.json(block);
  } catch (err) { next(err); }
}

/* ---------- إدارة الحسابات ---------- */
async function listUsers(req, res, next) {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const users = await User.findAll({ where, attributes: { exclude: ['password_hash'] }, order: [['created_at', 'DESC']] });
    res.json(users);
  } catch (err) { next(err); }
}

async function toggleUserActive(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    await user.update({ is_active: !user.is_active });
    invalidateUserStatusCache(user.id); // يسري التعطيل فورًا حتى مع توكن ساري
    await logAdminAction(req, 'user.toggle_active', 'user', user.id, { is_active: user.is_active });
    res.json(user);
  } catch (err) { next(err); }
}

async function adjustWallet(req, res, next) {
  try {
    const { amount, note } = req.body;
    const wallet = await walletService.adminAdjustBalance(req.params.userId, amount, note, req.user.id);
    await logAdminAction(req, 'wallet.adjust', 'wallet', wallet.id, { amount, note, user_id: req.params.userId });
    res.json(wallet);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

/* ---------- موافقة المطاعم ---------- */
async function approveRestaurant(req, res, next) {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'المطعم غير موجود' });
    await restaurant.update({ is_approved: true });
    res.json(restaurant);
  } catch (err) { next(err); }
}

module.exports = {
  listFeatureFlags, toggleFeatureFlag, setFeatureFlag,
  listBans, createBan, liftBan,
  listPaymentBlocks, createPaymentBlock, removePaymentBlock,
  listUsers, toggleUserActive, adjustWallet,
  approveRestaurant,
};

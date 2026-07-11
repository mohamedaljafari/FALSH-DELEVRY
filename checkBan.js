const { Op } = require('sequelize');
const { Ban } = require('../models');
const { isFeatureEnabled } = require('./featureFlagGuard');
const { getClientIp } = require('../utils/ipHelper');

/**
 * يُستخدم في مسارات تسجيل الدخول/التسجيل لمنع أي حساب محظور
 * حسب رقم الهاتف أو عنوان IP من المتابعة، حتى قبل التحقق من كلمة المرور.
 */
async function checkBan(req, res, next) {
  try {
    const ip = getClientIp(req);
    const phone = req.body?.phone;

    const activeBanWhere = {
      is_active: true,
      [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: new Date() } }],
    };

    const checks = [];

    if (phone && (await isFeatureEnabled('security.phone_ban_check'))) {
      checks.push(Ban.findOne({ where: { ...activeBanWhere, type: 'phone', value: phone } }));
    }
    if (ip && (await isFeatureEnabled('security.ip_ban_check'))) {
      checks.push(Ban.findOne({ where: { ...activeBanWhere, type: 'ip', value: ip } }));
    }

    const results = await Promise.all(checks);
    const ban = results.find((r) => r);

    if (ban) {
      return res.status(403).json({
        error: 'هذا الحساب أو عنوان الاتصال محظور من استخدام المنصة',
        reason: ban.reason || undefined,
      });
    }

    req.clientIp = ip;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = checkBan;

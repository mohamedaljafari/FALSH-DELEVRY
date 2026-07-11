const otpService = require('../services/otpService');

async function requestOtp(req, res, next) {
  try {
    const { phone, purpose, channel } = req.body;
    const validPurposes = ['register', 'login', 'wallet_transfer', 'wallet_topup', 'reset_password'];
    if (!validPurposes.includes(purpose)) {
      return res.status(400).json({ error: 'غرض غير صالح لرمز التحقق' });
    }
    const result = await otpService.requestOtp({ phone, purpose, channel, ip: req.clientIp });
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { phone, purpose, code } = req.body;
    await otpService.verifyOtp({ phone, purpose, code });
    res.json({ verified: true });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { requestOtp, verifyOtp };

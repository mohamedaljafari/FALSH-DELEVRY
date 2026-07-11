const walletService = require('../services/walletService');
const otpService = require('../services/otpService');
const { Wallet, Transaction } = require('../models');

// السقف الذي فوقه يُطلب رمز OTP إضافي لتأكيد العملية المالية (طبقة حماية ثانية)
const OTP_REQUIRED_ABOVE_AMOUNT = Number(process.env.OTP_REQUIRED_ABOVE_AMOUNT || 500);

async function getMyWallet(req, res, next) {
  try {
    const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
    if (!wallet) return res.status(404).json({ error: 'المحفظة غير موجودة' });
    res.json(wallet);
  } catch (err) {
    next(err);
  }
}

async function getMyTransactions(req, res, next) {
  try {
    const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
    if (!wallet) return res.status(404).json({ error: 'المحفظة غير موجودة' });
    const transactions = await Transaction.findAll({
      where: { wallet_id: wallet.id },
      order: [['created_at', 'DESC']],
      limit: 100,
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

async function topup(req, res, next) {
  try {
    const { amount, otp_code } = req.body;

    // طبقة حماية ثانية: للمبالغ الكبيرة نطلب تأكيد OTP إضافي حتى لو كان المستخدم مسجّل الدخول بالفعل
    if (Number(amount) > OTP_REQUIRED_ABOVE_AMOUNT) {
      if (!otp_code) {
        return res.status(400).json({ error: `مطلوب رمز تحقق (OTP) لعمليات الشحن فوق ${OTP_REQUIRED_ABOVE_AMOUNT}` });
      }
      await otpService.verifyOtp({ phone: req.user.phone, purpose: 'wallet_topup', code: otp_code });
    }

    const wallet = await walletService.topup(req.user.id, amount);
    res.json(wallet);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function transfer(req, res, next) {
  try {
    const { to_phone, amount, note, otp_code } = req.body;

    if (Number(amount) > OTP_REQUIRED_ABOVE_AMOUNT) {
      if (!otp_code) {
        return res.status(400).json({ error: `مطلوب رمز تحقق (OTP) للتحويلات فوق ${OTP_REQUIRED_ABOVE_AMOUNT}` });
      }
      await otpService.verifyOtp({ phone: req.user.phone, purpose: 'wallet_transfer', code: otp_code });
    }

    const result = await walletService.transferBetweenWallets(req.user.id, to_phone, amount, note);
    res.json({ message: `تم تحويل المبلغ إلى ${result.toUserName} بنجاح`, ...result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { getMyWallet, getMyTransactions, topup, transfer };

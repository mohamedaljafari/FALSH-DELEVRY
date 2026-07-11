const { sequelize, Wallet, Transaction, User, PaymentMethodBlock } = require('../models');

class WalletError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/** التأكد أن وسيلة الدفع غير محظورة يدويًا لهذا المستخدم */
async function assertPaymentMethodAllowed(userId, method) {
  const block = await PaymentMethodBlock.findOne({
    where: { user_id: userId, method, is_active: true },
  });
  if (block) {
    throw new WalletError(`وسيلة الدفع (${method}) محظورة على هذا الحساب${block.reason ? ': ' + block.reason : ''}`, 403);
  }
}

/** شحن المحفظة */
async function topup(userId, amount) {
  if (amount <= 0) throw new WalletError('المبلغ يجب أن يكون أكبر من صفر');
  await assertPaymentMethodAllowed(userId, 'electronic');

  return sequelize.transaction(async (t) => {
    const wallet = await Wallet.findOne({ where: { user_id: userId }, transaction: t, lock: t.LOCK.UPDATE });
    if (!wallet) throw new WalletError('المحفظة غير موجودة', 404);
    if (wallet.is_frozen) throw new WalletError('المحفظة مجمّدة حاليًا من الإدارة', 403);

    const newBalance = Number(wallet.balance) + Number(amount);
    await wallet.update({ balance: newBalance }, { transaction: t });

    await Transaction.create({
      wallet_id: wallet.id,
      type: 'topup',
      amount,
      balance_after: newBalance,
      note: 'شحن المحفظة',
    }, { transaction: t });

    return wallet;
  });
}

/**
 * تحويل رصيد بين محفظتي زبونين (P2P)
 * يتم التحقق من: تفعيل الميزة (في الـ route عبر featureFlagGuard)، تجميد المحافظ، الرصيد الكافي.
 */
async function transferBetweenWallets(fromUserId, toPhone, amount, note) {
  if (amount <= 0) throw new WalletError('المبلغ يجب أن يكون أكبر من صفر');
  if (!toPhone) throw new WalletError('رقم هاتف المستلم مطلوب');

  const toUser = await User.findOne({ where: { phone: toPhone } });
  // رسالة موحّدة بغض النظر عن السبب الفعلي، لمنع اكتشاف أرقام هواتف مسجّلة (Enumeration)
  if (!toUser) throw new WalletError('تعذّر إتمام التحويل، يرجى التأكد من رقم المستلم', 404);
  if (toUser.id === fromUserId) throw new WalletError('لا يمكن تحويل الرصيد لنفس الحساب');

  return sequelize.transaction(async (t) => {
    const fromWallet = await Wallet.findOne({ where: { user_id: fromUserId }, transaction: t });
    const toWallet = await Wallet.findOne({ where: { user_id: toUser.id }, transaction: t });
    if (!fromWallet || !toWallet) throw new WalletError('تعذّر إتمام التحويل، يرجى التأكد من رقم المستلم', 404);

    // مهم لمنع Deadlock تحت الحمل العالي: نقفل المحفظتين دائمًا بترتيب ثابت (حسب id)
    // بغض النظر عن اتجاه التحويل، حتى لا يتقاطع قفل A→B مع قفل B→A في نفس اللحظة
    const [firstId, secondId] = [fromWallet.id, toWallet.id].sort();
    const first = await Wallet.findByPk(firstId, { transaction: t, lock: t.LOCK.UPDATE });
    const second = await Wallet.findByPk(secondId, { transaction: t, lock: t.LOCK.UPDATE });
    const lockedFromWallet = first.id === fromWallet.id ? first : second;
    const lockedToWallet = first.id === toWallet.id ? first : second;
    Object.assign(fromWallet, lockedFromWallet.dataValues);
    Object.assign(toWallet, lockedToWallet.dataValues);

    if (fromWallet.is_frozen) throw new WalletError('محفظتك مجمّدة حاليًا من الإدارة', 403);
    if (toWallet.is_frozen) throw new WalletError('محفظة المستلم مجمّدة حاليًا من الإدارة', 403);
    if (Number(fromWallet.balance) < Number(amount)) throw new WalletError('الرصيد غير كافٍ لإتمام التحويل', 402);

    const fromNewBalance = Number(fromWallet.balance) - Number(amount);
    const toNewBalance = Number(toWallet.balance) + Number(amount);

    await fromWallet.update({ balance: fromNewBalance }, { transaction: t });
    await toWallet.update({ balance: toNewBalance }, { transaction: t });

    await Transaction.create({
      wallet_id: fromWallet.id,
      type: 'transfer_out',
      amount,
      balance_after: fromNewBalance,
      related_user_id: toUser.id,
      note: note || 'تحويل صادر',
    }, { transaction: t });

    await Transaction.create({
      wallet_id: toWallet.id,
      type: 'transfer_in',
      amount,
      balance_after: toNewBalance,
      related_user_id: fromUserId,
      note: note || 'تحويل وارد',
    }, { transaction: t });

    return { fromBalance: fromNewBalance, toBalance: toNewBalance, toUserName: toUser.full_name };
  });
}

/** خصم قيمة طلب من المحفظة عند الدفع بها */
async function payOrderFromWallet(userId, amount, orderId) {
  await assertPaymentMethodAllowed(userId, 'wallet');

  return sequelize.transaction(async (t) => {
    const wallet = await Wallet.findOne({ where: { user_id: userId }, transaction: t, lock: t.LOCK.UPDATE });
    if (!wallet) throw new WalletError('المحفظة غير موجودة', 404);
    if (wallet.is_frozen) throw new WalletError('المحفظة مجمّدة حاليًا من الإدارة', 403);
    if (Number(wallet.balance) < Number(amount)) throw new WalletError('الرصيد غير كافٍ', 402);

    const newBalance = Number(wallet.balance) - Number(amount);
    await wallet.update({ balance: newBalance }, { transaction: t });

    await Transaction.create({
      wallet_id: wallet.id,
      type: 'order_payment',
      amount,
      balance_after: newBalance,
      related_order_id: orderId,
      note: 'دفع قيمة طلب من المحفظة',
    }, { transaction: t });

    return wallet;
  });
}

/** تعديل يدوي من الأدمن (إضافة/خصم) مع تسجيل السبب */
async function adminAdjustBalance(userId, amount, note, adminId) {
  return sequelize.transaction(async (t) => {
    const wallet = await Wallet.findOne({ where: { user_id: userId }, transaction: t, lock: t.LOCK.UPDATE });
    if (!wallet) throw new WalletError('المحفظة غير موجودة', 404);

    const newBalance = Number(wallet.balance) + Number(amount);
    if (newBalance < 0) throw new WalletError('لا يمكن أن يصبح الرصيد سالبًا');

    await wallet.update({ balance: newBalance }, { transaction: t });
    await Transaction.create({
      wallet_id: wallet.id,
      type: 'admin_adjustment',
      amount,
      balance_after: newBalance,
      related_user_id: adminId,
      note: note || 'تعديل يدوي من الإدارة',
    }, { transaction: t });

    return wallet;
  });
}

module.exports = {
  WalletError,
  assertPaymentMethodAllowed,
  topup,
  transferBetweenWallets,
  payOrderFromWallet,
  adminAdjustBalance,
};

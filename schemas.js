const { z } = require('zod');

// رقم هاتف ليبي مبسّط: يقبل صيغة دولية 218xxxxxxxxx أو محلية 09xxxxxxxx
const phoneSchema = z.string().regex(/^(218\d{9}|0\d{9})$/, 'رقم هاتف ليبي غير صالح');

const registerSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: phoneSchema,
  password: z.string().min(8, 'كلمة المرور يجب ألا تقل عن 8 أحرف').max(128),
  role: z.enum(['customer', 'driver', 'restaurant_owner']).optional(),
  otp_code: z.string().length(6),
});

const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1).max(128),
});

const otpRequestSchema = z.object({
  phone: phoneSchema,
  purpose: z.enum(['register', 'login', 'wallet_transfer', 'wallet_topup', 'reset_password']),
  channel: z.enum(['sms', 'whatsapp']).optional(),
});

const otpVerifySchema = z.object({
  phone: phoneSchema,
  purpose: z.enum(['register', 'login', 'wallet_transfer', 'wallet_topup', 'reset_password']),
  code: z.string().length(6),
});

const walletTopupSchema = z.object({
  amount: z.number().positive().max(50000, 'المبلغ يتجاوز الحد الأقصى المسموح لعملية شحن واحدة'),
  otp_code: z.string().length(6).optional(),
});

const walletTransferSchema = z.object({
  to_phone: phoneSchema,
  amount: z.number().positive().max(50000, 'المبلغ يتجاوز الحد الأقصى المسموح لعملية تحويل واحدة'),
  note: z.string().max(200).optional(),
  otp_code: z.string().length(6).optional(),
});

const orderItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(50),
});

const createOrderSchema = z.object({
  restaurant_id: z.string().uuid(),
  items: z.array(orderItemSchema).min(1).max(50),
  payment_method: z.enum(['cash', 'electronic', 'wallet']),
  drop_latitude: z.number().min(-90).max(90).optional(),
  drop_longitude: z.number().min(-180).max(180).optional(),
  scheduled_at: z.string().datetime().optional(),
  promo_code: z.string().max(50).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  walletTopupSchema,
  walletTransferSchema,
  createOrderSchema,
};

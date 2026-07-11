/**
 * سكربت اختبار تحميل بـ k6 — يحاكي السيناريو المطلوب بالضبط:
 * 2500 طلب متزامن + 1200 إيداع إلكتروني + 850 تحويل داخلي + 4500 "رسالة خدمة عملاء" (مُحاكاة كـ endpoint وهمي).
 *
 * التشغيل (على بيئة تحتوي فعليًا الباكند وقاعدة البيانات، وليس هنا):
 *   k6 run --env BASE_URL=http://localhost:4000/api scripts/load-test.js
 *
 * ملاحظة: يجب إنشاء مستخدمين تجريبيين ورموز OTP محاكاة قبل التشغيل (راجع seed.js)،
 * ويُفضّل تعطيل otp إجباريًا في بيئة الاختبار عبر متغيّر بيئة مخصص لتسهيل الأتمتة.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/api';

const orderFailures = new Counter('order_failures');
const topupFailures = new Counter('topup_failures');
const transferFailures = new Counter('transfer_failures');
const supportFailures = new Counter('support_failures');

export const options = {
  scenarios: {
    orders: {
      executor: 'shared-iterations',
      vus: 250,
      iterations: 2500,
      exec: 'placeOrder',
      maxDuration: '3m',
    },
    topups: {
      executor: 'shared-iterations',
      vus: 150,
      iterations: 1200,
      exec: 'topupWallet',
      maxDuration: '3m',
      startTime: '5s',
    },
    transfers: {
      executor: 'shared-iterations',
      vus: 120,
      iterations: 850,
      exec: 'transferWallet',
      maxDuration: '3m',
      startTime: '10s',
    },
    support_messages: {
      executor: 'shared-iterations',
      vus: 300,
      iterations: 4500,
      exec: 'sendSupportMessage',
      maxDuration: '3m',
      startTime: '15s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95% من الطلبات يجب أن تُنجز خلال 1.5 ثانية
    order_failures: ['count<125'], // نسبة فشل مقبولة أقل من 5%
    topup_failures: ['count<60'],
    transfer_failures: ['count<43'],
  },
};

function authHeaders(token) {
  return { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
}

// يفترض وجود توكن تجريبي محقون عبر متغير بيئة (يُنشأ مسبقًا بسكربت تسجيل دخول منفصل)
const TEST_TOKEN = __ENV.TEST_TOKEN || '';

export function placeOrder() {
  const payload = JSON.stringify({
    restaurant_id: __ENV.TEST_RESTAURANT_ID,
    items: [{ menu_item_id: __ENV.TEST_MENU_ITEM_ID, quantity: 2 }],
    payment_method: 'cash',
  });
  const headers = authHeaders(TEST_TOKEN);
  headers.headers['Idempotency-Key'] = `order-${__VU}-${__ITER}-${Date.now()}`;
  const res = http.post(`${BASE_URL}/orders`, payload, headers);
  const ok = check(res, { 'order created': (r) => r.status === 201 });
  if (!ok) orderFailures.add(1);
  sleep(0.2);
}

export function topupWallet() {
  const payload = JSON.stringify({ amount: 50 });
  const headers = authHeaders(TEST_TOKEN);
  headers.headers['Idempotency-Key'] = `topup-${__VU}-${__ITER}-${Date.now()}`;
  const res = http.post(`${BASE_URL}/wallet/topup`, payload, headers);
  const ok = check(res, { 'topup ok': (r) => r.status === 200 });
  if (!ok) topupFailures.add(1);
  sleep(0.2);
}

export function transferWallet() {
  const payload = JSON.stringify({ to_phone: __ENV.TEST_RECEIVER_PHONE, amount: 10 });
  const headers = authHeaders(TEST_TOKEN);
  headers.headers['Idempotency-Key'] = `transfer-${__VU}-${__ITER}-${Date.now()}`;
  const res = http.post(`${BASE_URL}/wallet/transfer`, payload, headers);
  const ok = check(res, { 'transfer ok': (r) => r.status === 200 });
  if (!ok) transferFailures.add(1);
  sleep(0.2);
}

// ملاحظة: خدمة العملاء غير مُنفَّذة بعد في الباكند — هذا الجزء توضيحي فقط
// ليُستبدل بالمسار الحقيقي بعد بناء موديول الدردشة/التذاكر
export function sendSupportMessage() {
  const res = http.post(
    `${BASE_URL}/support/messages`,
    JSON.stringify({ message: 'استفسار تجريبي لاختبار الحمل' }),
    authHeaders(TEST_TOKEN)
  );
  const ok = check(res, { 'support message accepted': (r) => r.status === 201 || r.status === 404 });
  if (!ok) supportFailures.add(1);
  sleep(0.1);
}

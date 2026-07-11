import axios from 'axios';

// عدّل هذا الرابط ليشير إلى خادم الباكند عند النشر
export const API_URL = 'http://localhost:4000/api';

const api = axios.create({ baseURL: API_URL });

let authToken = null;
let currentUserPhone = null;
export function setAuthToken(token) {
  authToken = token;
  api.defaults.headers.common.Authorization = token ? `Bearer ${token}` : undefined;
}
export function setCurrentUserPhone(phone) {
  currentUserPhone = phone;
}
export function getCurrentUserPhone() {
  return currentUserPhone;
}

// يولّد مفتاح تكرار فريد لكل عملية مالية جديدة (شحن/تحويل) لمنع التكرار عند ضعف الشبكة
export function newIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default api;

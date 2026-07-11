import axios from 'axios';

export const API_URL = 'http://localhost:4000/api';
const api = axios.create({ baseURL: API_URL });

export function setAuthToken(token) {
  api.defaults.headers.common.Authorization = token ? `Bearer ${token}` : undefined;
}

export default api;

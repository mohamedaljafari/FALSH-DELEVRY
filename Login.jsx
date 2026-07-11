import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { phone, password });
      if (data.user.role !== 'admin') {
        setError('هذا الحساب ليس حساب أدمن');
        return;
      }
      localStorage.setItem('flash_admin_token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'فشل تسجيل الدخول');
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center mb-4">دخول لوحة تحكم فلاش</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          className="w-full border p-2 rounded"
          placeholder="رقم الهاتف"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="كلمة المرور"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-gray-900 text-white p-2 rounded hover:bg-gray-800">
          دخول
        </button>
      </form>
    </div>
  );
}

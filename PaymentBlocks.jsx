import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function PaymentBlocks() {
  const [blocks, setBlocks] = useState([]);
  const [form, setForm] = useState({ user_id: '', method: 'cash', reason: '' });

  async function load() {
    const { data } = await api.get('/admin/payment-blocks');
    setBlocks(data);
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    await api.post('/admin/payment-blocks', form);
    setForm({ user_id: '', method: 'cash', reason: '' });
    load();
  }

  async function remove(id) {
    await api.post(`/admin/payment-blocks/${id}/remove`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">حظر وسيلة دفع لحساب معيّن</h1>
      <form onSubmit={submit} className="bg-white p-4 rounded-lg shadow mb-6 flex gap-2 items-end flex-wrap">
        <div>
          <label className="block text-sm mb-1">معرّف المستخدم (User ID)</label>
          <input className="border p-2 rounded" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm mb-1">وسيلة الدفع</label>
          <select className="border p-2 rounded" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            <option value="cash">نقدي</option>
            <option value="electronic">إلكتروني</option>
            <option value="wallet">المحفظة</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">السبب</label>
          <input className="border p-2 rounded" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded">حظر الوسيلة</button>
      </form>

      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-right">User ID</th>
            <th className="p-2 text-right">الوسيلة</th>
            <th className="p-2 text-right">السبب</th>
            <th className="p-2 text-right">الحالة</th>
            <th className="p-2 text-right">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="p-2">{b.user_id}</td>
              <td className="p-2">{b.method}</td>
              <td className="p-2">{b.reason}</td>
              <td className="p-2">{b.is_active ? 'محظورة' : 'مسموحة'}</td>
              <td className="p-2">
                {b.is_active && <button onClick={() => remove(b.id)} className="text-blue-600">إلغاء الحظر</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

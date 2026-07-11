import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Bans() {
  const [bans, setBans] = useState([]);
  const [form, setForm] = useState({ type: 'phone', value: '', reason: '' });

  async function load() {
    const { data } = await api.get('/admin/bans');
    setBans(data);
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    await api.post('/admin/bans', form);
    setForm({ type: 'phone', value: '', reason: '' });
    load();
  }

  async function lift(id) {
    await api.post(`/admin/bans/${id}/lift`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">حظر الحسابات (رقم الهاتف / IP)</h1>

      <form onSubmit={submit} className="bg-white p-4 rounded-lg shadow mb-6 flex gap-2 items-end flex-wrap">
        <div>
          <label className="block text-sm mb-1">نوع الحظر</label>
          <select className="border p-2 rounded" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="phone">رقم الهاتف</option>
            <option value="ip">عنوان IP</option>
            <option value="user_id">معرّف الحساب</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">القيمة</label>
          <input className="border p-2 rounded" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm mb-1">السبب</label>
          <input className="border p-2 rounded" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded">حظر</button>
      </form>

      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-right">النوع</th>
            <th className="p-2 text-right">القيمة</th>
            <th className="p-2 text-right">السبب</th>
            <th className="p-2 text-right">الحالة</th>
            <th className="p-2 text-right">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {bans.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="p-2">{b.type}</td>
              <td className="p-2">{b.value}</td>
              <td className="p-2">{b.reason}</td>
              <td className="p-2">{b.is_active ? 'محظور' : 'مرفوع الحظر'}</td>
              <td className="p-2">
                {b.is_active && (
                  <button onClick={() => lift(b.id)} className="text-blue-600">رفع الحظر</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

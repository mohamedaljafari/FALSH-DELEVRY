import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', discount_type: 'percentage', discount_value: '', promo_code: '' });

  async function load() {
    const { data } = await api.get('/admin/offers');
    setOffers(data);
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    await api.post('/admin/offers', form);
    setForm({ title: '', description: '', discount_type: 'percentage', discount_value: '', promo_code: '' });
    load();
  }

  async function toggle(id) {
    await api.post(`/admin/offers/${id}/toggle`);
    load();
  }

  async function remove(id) {
    await api.delete(`/admin/offers/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">صفحة العروض والإعلانات</h1>
      <form onSubmit={submit} className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-2 gap-3">
        <input className="border p-2 rounded" placeholder="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="كود الخصم (اختياري)" value={form.promo_code} onChange={(e) => setForm({ ...form, promo_code: e.target.value })} />
        <select className="border p-2 rounded" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
          <option value="percentage">نسبة مئوية</option>
          <option value="fixed_amount">مبلغ ثابت</option>
          <option value="free_delivery">توصيل مجاني</option>
        </select>
        <input className="border p-2 rounded" type="number" placeholder="قيمة الخصم" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
        <textarea className="border p-2 rounded col-span-2" placeholder="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="bg-gray-900 text-white px-4 py-2 rounded col-span-2">إضافة عرض</button>
      </form>

      <div className="grid grid-cols-3 gap-4">
        {offers.map((o) => (
          <div key={o.id} className="bg-white rounded-lg shadow p-4">
            <p className="font-bold">{o.title}</p>
            <p className="text-sm text-gray-500">{o.description}</p>
            {o.promo_code && <p className="text-xs mt-1">كود: {o.promo_code}</p>}
            <div className="flex justify-between mt-3">
              <button onClick={() => toggle(o.id)} className={`px-3 py-1 rounded-full text-white text-sm ${o.is_active ? 'bg-green-600' : 'bg-gray-400'}`}>
                {o.is_active ? 'مفعّل' : 'معطّل'}
              </button>
              <button onClick={() => remove(o.id)} className="text-red-600 text-sm">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: '', image_url: '', link_type: 'none', link_value: '', display_order: 0 });

  async function load() {
    const { data } = await api.get('/admin/banners');
    setBanners(data);
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    await api.post('/admin/banners', form);
    setForm({ title: '', image_url: '', link_type: 'none', link_value: '', display_order: 0 });
    load();
  }

  async function toggle(id) {
    await api.post(`/admin/banners/${id}/toggle`);
    load();
  }

  async function remove(id) {
    await api.delete(`/admin/banners/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">بانر الصفحة الرئيسية</h1>
      <form onSubmit={submit} className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-2 gap-3">
        <input className="border p-2 rounded" placeholder="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="رابط الصورة" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} required />
        <select className="border p-2 rounded" value={form.link_type} onChange={(e) => setForm({ ...form, link_type: e.target.value })}>
          <option value="none">بدون رابط</option>
          <option value="restaurant">مطعم</option>
          <option value="offer">عرض</option>
          <option value="external_url">رابط خارجي</option>
        </select>
        <input className="border p-2 rounded" placeholder="قيمة الرابط" value={form.link_value} onChange={(e) => setForm({ ...form, link_value: e.target.value })} />
        <input className="border p-2 rounded" type="number" placeholder="ترتيب العرض" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
        <button className="bg-gray-900 text-white px-4 py-2 rounded col-span-2">إضافة بانر</button>
      </form>

      <div className="grid grid-cols-3 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-lg shadow overflow-hidden">
            <img src={b.image_url} alt={b.title} className="w-full h-32 object-cover" />
            <div className="p-3">
              <p className="font-bold">{b.title}</p>
              <div className="flex justify-between mt-2">
                <button onClick={() => toggle(b.id)} className={`px-3 py-1 rounded-full text-white text-sm ${b.is_active ? 'bg-green-600' : 'bg-gray-400'}`}>
                  {b.is_active ? 'مفعّل' : 'معطّل'}
                </button>
                <button onClick={() => remove(b.id)} className="text-red-600 text-sm">حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

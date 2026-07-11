import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function FeatureFlags() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get('/admin/feature-flags');
    setFlags(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggle(key) {
    await api.post(`/admin/feature-flags/${key}/toggle`);
    load();
  }

  const categories = [...new Set(flags.map((f) => f.category))];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">التحكم اليدوي بالميزات</h1>
      <p className="text-gray-600 mb-6">تفعيل أو تعطيل أي ميزة في المنصة فورًا دون الحاجة لتحديث التطبيقات.</p>
      {loading ? <p>جارِ التحميل...</p> : (
        categories.map((cat) => (
          <div key={cat} className="mb-6 bg-white rounded-lg shadow p-4">
            <h2 className="font-bold mb-3 text-lg">{cat}</h2>
            <div className="space-y-2">
              {flags.filter((f) => f.category === cat).map((f) => (
                <div key={f.key} className="flex items-center justify-between border-b py-2">
                  <div>
                    <p className="font-medium">{f.label}</p>
                    <p className="text-xs text-gray-400">{f.key}</p>
                  </div>
                  <button
                    onClick={() => toggle(f.key)}
                    className={`px-4 py-1 rounded-full text-white ${f.is_enabled ? 'bg-green-600' : 'bg-gray-400'}`}
                  >
                    {f.is_enabled ? 'مفعّلة' : 'معطّلة'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');

  async function load() {
    const { data } = await api.get('/admin/users', { params: role ? { role } : {} });
    setUsers(data);
  }
  useEffect(() => { load(); }, [role]);

  async function toggleActive(id) {
    await api.post(`/admin/users/${id}/toggle-active`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">إدارة الحسابات</h1>
      <select className="border p-2 rounded mb-4" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">كل الأدوار</option>
        <option value="customer">زبون</option>
        <option value="driver">سائق</option>
        <option value="restaurant_owner">صاحب مطعم</option>
        <option value="admin">أدمن</option>
      </select>

      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-right">الاسم</th>
            <th className="p-2 text-right">الهاتف</th>
            <th className="p-2 text-right">الدور</th>
            <th className="p-2 text-right">الحالة</th>
            <th className="p-2 text-right">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.full_name}</td>
              <td className="p-2">{u.phone}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.is_active ? 'نشط' : 'معطّل'}</td>
              <td className="p-2">
                <button onClick={() => toggleActive(u.id)} className="text-blue-600">
                  {u.is_active ? 'تعطيل' : 'تفعيل'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

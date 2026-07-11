import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const links = [
  { to: '/', label: 'الرئيسية' },
  { to: '/feature-flags', label: 'التحكم بالميزات' },
  { to: '/bans', label: 'الحظر (هاتف/IP)' },
  { to: '/payment-blocks', label: 'حظر وسائل الدفع' },
  { to: '/banners', label: 'البانر الرئيسي' },
  { to: '/offers', label: 'العروض والإعلانات' },
  { to: '/users', label: 'الحسابات' },
];

export default function Layout() {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem('flash_admin_token');
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">لوحة تحكم فلاش</div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block px-3 py-2 rounded hover:bg-gray-800">
              {l.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="m-2 p-2 bg-red-600 rounded hover:bg-red-700">
          تسجيل الخروج
        </button>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

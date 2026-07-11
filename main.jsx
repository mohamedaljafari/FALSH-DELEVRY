import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeatureFlags from './pages/FeatureFlags';
import Bans from './pages/Bans';
import PaymentBlocks from './pages/PaymentBlocks';
import Banners from './pages/Banners';
import Offers from './pages/Offers';
import Users from './pages/Users';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('flash_admin_token');
  return token ? children : <Navigate to="/login" />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="feature-flags" element={<FeatureFlags />} />
          <Route path="bans" element={<Bans />} />
          <Route path="payment-blocks" element={<PaymentBlocks />} />
          <Route path="banners" element={<Banners />} />
          <Route path="offers" element={<Offers />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

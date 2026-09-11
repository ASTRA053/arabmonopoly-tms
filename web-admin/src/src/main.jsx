import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import TripsPage from './pages/TripsPage';
import FuelPage from './pages/FuelPage';
import PaymentsPage from './pages/PaymentsPage';
import SettlementsPage from './pages/SettlementsPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/trips" element={<TripsPage />} />
      <Route path="/fuel" element={<FuelPage />} />
      <Route path="/payments" element={<PaymentsPage />} />
      <Route path="/settlements" element={<SettlementsPage />} />
    </Routes>
  </BrowserRouter>
);
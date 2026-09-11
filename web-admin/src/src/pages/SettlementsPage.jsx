import { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/api';

export default function SettlementsPage() {
  const [form, setForm] = useState({ driver_id: '', period_start: '', period_end: '' });
  const [result, setResult] = useState(null);

  const generateSettlement = async () => {
    const res = await axios.post(`${API}/payments/settlement`, form);
    setResult(res.data);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Generate Driver Settlement</h1>
      <div style={{ marginBottom: 16 }}>
        <input placeholder="driver_id" value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })} /><br />
        <input type="date" value={form.period_start} onChange={e => setForm({ ...form, period_start: e.target.value })} /><br />
        <input type="date" value={form.period_end} onChange={e => setForm({ ...form, period_end: e.target.value })} /><br />
        <button onClick={generateSettlement}>Generate</button>
      </div>

      {result && (
        <div>
          <h3>Settlement Created</h3>
          <p>ID: {result.id}</p>
          <p>Driver ID: {result.driver_id}</p>
          <p>Period: {result.period_start} to {result.period_end}</p>
          <p>Earnings: {JSON.stringify(result.earnings)}</p>
          <p>Net Pay: {result.net_pay}</p>
          <p>Status: {result.status}</p>
        </div>
      )}
    </div>
  );
}
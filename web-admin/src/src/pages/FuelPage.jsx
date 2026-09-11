import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/api';

export default function FuelPage() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    vehicle_id: '', driver_id: '', log_date: '',
    station: '', liters: '', price_per_liter: '', total_cost: '', odometer: '', notes: ''
  });

  useEffect(() => {
    (async () => {
      const res = await axios.get(`${API}/fuel`);
      setLogs(res.data);
    })();
  }, []);

  const createLog = async () => {
    await axios.post(`${API}/fuel`, {
      ...form,
      liters: parseFloat(form.liters),
      price_per_liter: parseFloat(form.price_per_liter),
      total_cost: parseFloat(form.total_cost),
      odometer: form.odometer ? parseFloat(form.odometer) : null
    });
    const res = await axios.get(`${API}/fuel`);
    setLogs(res.data);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Fuel Logs</h1>
      <div style={{ marginBottom: 24 }}>
        <h3>Add Fuel Log</h3>
        <input placeholder="vehicle_id" value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} /><br />
        <input placeholder="driver_id" value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })} /><br />
        <input type="date" value={form.log_date} onChange={e => setForm({ ...form, log_date: e.target.value })} /><br />
        <input placeholder="station" value={form.station} onChange={e => setForm({ ...form, station: e.target.value })} /><br />
        <input placeholder="liters" value={form.liters} onChange={e => setForm({ ...form, liters: e.target.value })} /><br />
        <input placeholder="price_per_liter" value={form.price_per_liter} onChange={e => setForm({ ...form, price_per_liter: e.target.value })} /><br />
        <input placeholder="total_cost" value={form.total_cost} onChange={e => setForm({ ...form, total_cost: e.target.value })} /><br />
        <input placeholder="odometer" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} /><br />
        <input placeholder="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /><br />
        <button onClick={createLog}>Add</button>
      </div>

      <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>ID</th><th>Vehicle</th><th>Driver</th><th>Station</th><th>Liters</th><th>Cost</th><th>Date</th></tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <td>{l.id}</td><td>{l.plate}</td><td>{l.driver_name || '-'}</td>
              <td>{l.station}</td><td>{l.liters}</td><td>{l.total_cost}</td>
              <td>{new Date(l.log_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
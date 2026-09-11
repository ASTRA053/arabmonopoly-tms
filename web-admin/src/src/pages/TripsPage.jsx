import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/api';

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({
    load_id: '', vehicle_id: '', driver_id: '',
    planned_start: '', planned_end: '',
    rate_per_trip: '', extra_earnings: ''
  });

  useEffect(() => {
    (async () => {
      const res = await axios.get(`${API}/trips`);
      setTrips(res.data);
    })();
  }, []);

  const createTrip = async () => {
    await axios.post(`${API}/trips`, {
      ...form,
      rate_per_trip: parseFloat(form.rate_per_trip) || 0,
      extra_earnings: parseFloat(form.extra_earnings) || 0
    });
    const res = await axios.get(`${API}/trips`);
    setTrips(res.data);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Trips</h1>
      <div style={{ marginBottom: 24 }}>
        <h3>Create Trip</h3>
        <input placeholder="load_id" value={form.load_id} onChange={e => setForm({ ...form, load_id: e.target.value })} /><br />
        <input placeholder="vehicle_id" value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} /><br />
        <input placeholder="driver_id" value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })} /><br />
        <input type="datetime-local" value={form.planned_start} onChange={e => setForm({ ...form, planned_start: e.target.value })} /><br />
        <input type="datetime-local" value={form.planned_end} onChange={e => setForm({ ...form, planned_end: e.target.value })} /><br />
        <input placeholder="rate_per_trip" value={form.rate_per_trip} onChange={e => setForm({ ...form, rate_per_trip: e.target.value })} /><br />
        <input placeholder="extra_earnings" value={form.extra_earnings} onChange={e => setForm({ ...form, extra_earnings: e.target.value })} /><br />
        <button onClick={createTrip}>Create</button>
      </div>

      <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th><th>Driver</th><th>Vehicle</th><th>Material</th><th>Rate</th><th>Extra</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {trips.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.driver_name}</td>
              <td>{t.plate} ({t.model})</td>
              <td>{t.material_type} – {t.quantity} {t.unit}</td>
              <td>{t.rate_per_trip}</td>
              <td>{t.extra_earnings}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
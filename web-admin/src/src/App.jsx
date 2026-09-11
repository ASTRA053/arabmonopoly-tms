import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/api';

export default function App() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await axios.get(`${API}/trips`);
      setTrips(res.data);
    })();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Dump Truck TMS – Admin (50 Trucks)</h1>
      <nav style={{ marginBottom: 16 }}>
        <a href="/trips" style={{ marginRight: 12 }}>Trips</a>
        <a href="/fuel" style={{ marginRight: 12 }}>Fuel</a>
        <a href="/payments" style={{ marginRight: 12 }}>Payments</a>
        <a href="/settlements">Settlements</a>
      </nav>

      <h2>Recent Trips</h2>
      <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th><th>Driver</th><th>Vehicle</th><th>Material</th><th>Rate</th><th>Extra</th><th>Status</th><th>Created</th>
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
              <td>{new Date(t.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
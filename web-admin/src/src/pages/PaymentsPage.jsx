import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await axios.get(`${API}/payments`);
      setPayments(res.data);
    })();
  }, []);

  const approve = async (id) => {
    await axios.patch(`${API}/payments/${id}`, { status: 'approved' });
    const res = await axios.get(`${API}/payments`);
    setPayments(res.data);
  };

  const markPaid = async (id) => {
    await axios.patch(`${API}/payments/${id}`, { status: 'paid', paid_at: new Date().toISOString() });
    const res = await axios.get(`${API}/payments`);
    setPayments(res.data);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Driver Payments</h1>
      <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>ID</th><th>Driver</th><th>Period</th><th>Net Pay</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.driver_name}</td>
              <td>{p.period_start} to {p.period_end}</td>
              <td>{p.net_pay}</td>
              <td>{p.status}</td>
              <td>
                {p.status === 'pending' && <button onClick={() => approve(p.id)}>Approve</button>}
                {p.status === 'approved' && <button onClick={() => markPaid(p.id)}>Mark Paid</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
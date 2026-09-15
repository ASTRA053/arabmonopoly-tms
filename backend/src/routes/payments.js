import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const managementRoles = ['admin', 'dispatcher'];

router.get('/', requireAuth, requireRole(...managementRoles), async (req, res) => {
  const { driver_id, status } = req.query;
  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (driver_id) {
      conditions.push(`driver_id = $${idx}`); values.push(parseInt(driver_id)); idx++;
    }
    if (status) {
      conditions.push(`status = $${idx}`); values.push(status); idx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT p.*, d.name AS driver_name
      FROM driver_payments p
      JOIN drivers d ON p.driver_id = d.id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT 500
    `;
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.post('/', requireAuth, requireRole(...managementRoles), async (req, res) => {
  const { driver_id, trip_id, period_start, period_end, earnings, deductions, net_pay } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO driver_payments
       (driver_id, trip_id, period_start, period_end, earnings, deductions, net_pay)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [driver_id, trip_id, period_start, period_end, earnings, deductions, net_pay]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

router.post('/settlement', requireAuth, requireRole(...managementRoles), async (req, res) => {
  const { driver_id, period_start, period_end } = req.body;
  try {
    const tripSum = await pool.query(
      `SELECT
         COUNT(*) AS trip_count,
         COALESCE(SUM(rate_per_trip), 0) AS base_pay,
         COALESCE(SUM(extra_earnings), 0) AS extra_pay
       FROM trips
       WHERE driver_id = $1
         AND status = 'completed'
         AND actual_start >= $2
         AND actual_start <= $3`,
      [driver_id, period_start, period_end]
    );

    const { trip_count, base_pay, extra_pay } = tripSum.rows[0];
    const deductions = {};
    const total_deductions = Object.values(deductions).reduce((a, b) => a + b, 0);
    const net_pay = parseFloat(base_pay) + parseFloat(extra_pay) - total_deductions;

    const { rows } = await pool.query(
      `INSERT INTO driver_payments
       (driver_id, period_start, period_end, earnings, deductions, net_pay, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [driver_id, period_start, period_end, { trip_count, base_pay, extra_pay }, deductions, net_pay]
    );

    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Settlement failed' });
  }
});

router.patch('/:id', requireAuth, requireRole(...managementRoles), async (req, res) => {
  const { id } = req.params;
  const { status, paid_at } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE driver_payments
       SET status = COALESCE($1, status),
           paid_at = COALESCE($2, paid_at)
       WHERE id = $3
       RETURNING *`,
      [status || null, paid_at || null, id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

export default router;
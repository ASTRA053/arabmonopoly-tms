import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { standardRateLimit } from '../middleware/rateLimit.js';

const router = Router();
router.use(standardRateLimit, requireAuth, requireRole('admin', 'dispatcher'));

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM expenses ORDER BY id DESC LIMIT 200');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { vehicle_id, driver_id, type, amount, expense_date, receipt_url, approved } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO expenses (vehicle_id, driver_id, type, amount, expense_date, receipt_url, approved)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [vehicle_id, driver_id, type, amount, expense_date, receipt_url, approved ?? false]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

export default router;

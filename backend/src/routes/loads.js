import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('admin', 'dispatcher'));

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM loads ORDER BY id DESC LIMIT 200');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { customer_id, material_type, quantity, unit, rate, total_amount, status } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO loads (customer_id, material_type, quantity, unit, rate, total_amount, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [customer_id, material_type, quantity, unit, rate, total_amount, status]
  );
  res.status(201).json(rows[0]);
});

export default router;
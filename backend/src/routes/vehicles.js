import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { standardRateLimit } from '../middleware/rateLimit.js';

const router = Router();
router.use(standardRateLimit, requireAuth, requireRole('admin', 'dispatcher'));

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM vehicles ORDER BY id DESC LIMIT 200');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { plate, model, capacity, year, gps_device_id, status } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO vehicles (plate, model, capacity, year, gps_device_id, status)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [plate, model, capacity, year, gps_device_id, status]
  );
  res.status(201).json(rows[0]);
});

export default router;
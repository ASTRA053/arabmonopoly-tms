import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('admin', 'dispatcher'));

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, phone, license_no, license_expiry, contract_type, status, trip_rate, rate_type, currency, created_at
     FROM drivers
     ORDER BY id DESC
     LIMIT 200`
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, phone, national_id, license_no, license_expiry, contract_type, bank_details, trip_rate, rate_type, currency } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO drivers
     (name, phone, national_id, license_no, license_expiry, contract_type, bank_details, trip_rate, rate_type, currency)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [name, phone, national_id, license_no, license_expiry, contract_type, bank_details, trip_rate, rate_type, currency]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, national_id, license_no, license_expiry, contract_type, bank_details, trip_rate, rate_type, currency, status } = req.body;
  const { rows } = await pool.query(
    `UPDATE drivers SET
       name=$1, phone=$2, national_id=$3, license_no=$4, license_expiry=$5,
       contract_type=$6, bank_details=$7, trip_rate=$8, rate_type=$9, currency=$10, status=$11
     WHERE id=$12 RETURNING *`,
    [name, phone, national_id, license_no, license_expiry, contract_type, bank_details, trip_rate, rate_type, currency, status, id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Driver not found' });
  res.json(rows[0]);
});

export default router;
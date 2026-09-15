import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { standardRateLimit } from '../middleware/rateLimit.js';

const router = Router();
router.use(standardRateLimit, requireAuth, requireRole('admin', 'dispatcher'));

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM customers ORDER BY id DESC LIMIT 200');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, contact_person, phone, address, tax_id, payment_terms } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO customers (name, contact_person, phone, address, tax_id, payment_terms)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, contact_person, phone, address, tax_id, payment_terms]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

export default router;

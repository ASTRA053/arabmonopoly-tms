import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/', async (req, res) => {
  const { rows } = await pool.query(`SELECT id, name, email, role, driver_id, created_at FROM users ORDER BY id DESC`);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, email, password, role = 'driver', driver_id } = req.body;
  if (!name || !email || !password || !['admin', 'dispatcher', 'driver'].includes(role)) {
    return res.status(400).json({ error: 'Name, email, password and a valid role are required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, driver_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, driver_id, created_at`,
      [name, email.toLowerCase(), hash, role, driver_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'User could not be created' });
  }
});

export default router;

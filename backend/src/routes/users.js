import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { recordAudit } from '../audit.js';
import { standardRateLimit } from '../middleware/rateLimit.js';

const router = Router();
router.use(standardRateLimit, requireAuth, requireRole('admin'));

router.get('/', async (req, res) => {
  const { rows } = await pool.query(`SELECT id, name, email, role, driver_id, created_at FROM users ORDER BY id DESC`);
  res.json(rows);
});

router.patch('/me/password', async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 12) {
    return res.status(400).json({ error: 'Current password and a new password of at least 12 characters are required' });
  }
  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  if (!rows.length || !(await bcrypt.compare(current_password, rows[0].password_hash))) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  const passwordHash = await bcrypt.hash(new_password, 12);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.user.id]);
  await recordAudit({ actorUserId: req.user.id, action: 'password_changed', entityType: 'user', entityId: req.user.id, metadata: {} });
  res.status(204).end();
});

router.patch('/:id/password', async (req, res) => {
  const { new_password } = req.body;
  if (!new_password || new_password.length < 12) {
    return res.status(400).json({ error: 'A new password of at least 12 characters is required' });
  }
  const passwordHash = await bcrypt.hash(new_password, 12);
  const { rows } = await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id', [passwordHash, req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  await recordAudit({ actorUserId: req.user.id, action: 'password_reset', entityType: 'user', entityId: req.params.id, metadata: {} });
  res.status(204).end();
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
    await recordAudit({ actorUserId: req.user.id, action: 'user_created', entityType: 'user', entityId: rows[0].id, metadata: { role: rows[0].role } });
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'User could not be created' });
  }
});

export default router;

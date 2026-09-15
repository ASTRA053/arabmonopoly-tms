import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { standardRateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.get('/', standardRateLimit, requireAuth, requireRole('admin', 'dispatcher'), async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const { rows } = await pool.query(
    `SELECT al.*, u.name AS actor_name
     FROM audit_logs al LEFT JOIN users u ON u.id = al.actor_user_id
     ORDER BY al.created_at DESC LIMIT $1`,
    [limit]
  );
  res.json(rows);
});
export default router;

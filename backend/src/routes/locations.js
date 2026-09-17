import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { recordAudit } from '../audit.js';
import { standardRateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', standardRateLimit, requireAuth, requireRole('admin', 'dispatcher', 'driver'), async (req, res) => {
  const { vehicle_id, latitude, longitude } = req.body;
  if (!vehicle_id || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    return res.status(400).json({ error: 'vehicle_id, latitude and longitude are required' });
  }
  if (req.user.role === 'driver') {
    const assigned = await pool.query('SELECT 1 FROM trips WHERE driver_id = $1 AND vehicle_id = $2 AND status IN (\'planned\', \'in_transit\') LIMIT 1', [req.user.driver_id, vehicle_id]);
    if (!assigned.rowCount) return res.status(403).json({ error: 'Vehicle is not assigned to your active trip' });
  }
  const { rows } = await pool.query(
    `INSERT INTO vehicle_locations (vehicle_id, driver_id, latitude, longitude)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [vehicle_id, req.user.driver_id || null, latitude, longitude]
  );
  await recordAudit({ actorUserId: req.user.id, action: 'location_recorded', entityType: 'vehicle', entityId: vehicle_id, metadata: { latitude, longitude } });
  res.status(201).json(rows[0]);
});

router.get('/latest', standardRateLimit, requireAuth, requireRole('admin', 'dispatcher'), async (req, res) => {
  const { rows } = await pool.query(`
    SELECT DISTINCT ON (vl.vehicle_id) vl.*, v.plate
    FROM vehicle_locations vl LEFT JOIN vehicles v ON v.id = vl.vehicle_id
    ORDER BY vl.vehicle_id, vl.recorded_at DESC
  `);
  res.json(rows);
});

export default router;

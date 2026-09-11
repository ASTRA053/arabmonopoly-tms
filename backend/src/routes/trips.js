import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { recordAudit } from '../audit.js';
import { storeDeliveryPhoto } from '../storage.js';

const router = Router();

router.get('/', async (req, res) => {
  const { status, driver_id, vehicle_id, date_from, date_to } = req.query;
  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (status) {
      conditions.push(`t.status = $${idx}`); values.push(status); idx++;
    }
    if (driver_id) {
      conditions.push(`t.driver_id = $${idx}`); values.push(parseInt(driver_id)); idx++;
    }
    if (vehicle_id) {
      conditions.push(`t.vehicle_id = $${idx}`); values.push(parseInt(vehicle_id)); idx++;
    }
    if (date_from) {
      conditions.push(`t.created_at >= $${idx}`); values.push(date_from); idx++;
    }
    if (date_to) {
      conditions.push(`t.created_at <= $${idx}`); values.push(date_to); idx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT t.*, l.material_type, l.quantity, l.unit,
             v.plate, v.model,
             d.name AS driver_name
      FROM trips t
      JOIN loads l ON t.load_id = l.id
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN drivers d ON t.driver_id = d.id
      ${where}
      ORDER BY t.created_at DESC
      LIMIT 500
    `;
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

router.get('/driver/:driverId', async (req, res) => {
  const { driverId } = req.params;
  const { status } = req.query;
  try {
    let query = `
      SELECT t.*, l.material_type, l.quantity, l.unit, v.plate, v.model
      FROM trips t
      JOIN loads l ON t.load_id = l.id
      JOIN vehicles v ON t.vehicle_id = v.id
      WHERE t.driver_id = $1
    `;
    const values = [driverId];
    if (status) {
      query += ` AND t.status = $2`;
      values.push(status);
    }
    query += ` ORDER BY t.created_at DESC`;
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

router.get('/mine', requireAuth, requireRole('driver'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, l.material_type, l.quantity, l.unit, v.plate, v.model,
          dp.photo AS delivery_photo
       FROM trips t JOIN loads l ON t.load_id = l.id JOIN vehicles v ON t.vehicle_id = v.id
       LEFT JOIN LATERAL (SELECT photo FROM delivery_proofs WHERE trip_id = t.id ORDER BY created_at DESC LIMIT 1) dp ON TRUE
       WHERE t.driver_id = $1 ORDER BY t.created_at DESC`,
      [req.user.driver_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your trips' });
  }
});

router.post('/', async (req, res) => {
  const { load_id, vehicle_id, driver_id, planned_start, planned_end, rate_per_trip, extra_earnings } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO trips
       (load_id, vehicle_id, driver_id, planned_start, planned_end, rate_per_trip, extra_earnings, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'planned')
       RETURNING *`,
      [load_id, vehicle_id, driver_id, planned_start, planned_end, rate_per_trip || 0, extra_earnings || 0]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, actual_start, actual_end } = req.body;
  try {
    const updates = ['status = $1'];
    const values = [status];
    let idx = 2;

    if (actual_start) {
      updates.push(`actual_start = $${idx}`);
      values.push(actual_start);
      idx++;
    }
    if (actual_end) {
      updates.push(`actual_end = $${idx}`);
      values.push(actual_end);
      idx++;
    }

    values.push(id);
    const query = `
      UPDATE trips
      SET ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const { rows } = await pool.query(query, values);
    if (!rows.length) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

router.patch('/:id/delivery-proof', requireAuth, requireRole('driver'), async (req, res) => {
  const { delivery_photo, delivery_notes } = req.body;
  if (!delivery_photo) return res.status(400).json({ error: 'Delivery photo is required' });
  const { rows } = await pool.query('SELECT id FROM trips WHERE id = $1 AND driver_id = $2', [req.params.id, req.user.driver_id]);
  if (!rows.length) return res.status(404).json({ error: 'Trip not found for this driver' });
  const photoUrl = await storeDeliveryPhoto(delivery_photo, `delivery-proofs/trip-${req.params.id}-${Date.now()}.jpg`);
  await pool.query('INSERT INTO delivery_proofs (trip_id, driver_id, photo, notes) VALUES ($1, $2, $3, $4)', [req.params.id, req.user.driver_id, photoUrl, delivery_notes || null]);
  const { rows: updated } = await pool.query(`UPDATE trips SET status = 'delivered', actual_end = NOW() WHERE id = $1 RETURNING *`, [req.params.id]);
  await recordAudit({ actorUserId: req.user.id, action: 'delivery_proof_submitted', entityType: 'trip', entityId: req.params.id, metadata: { hasPhoto: true } });
  res.json(updated[0]);
});

export default router;
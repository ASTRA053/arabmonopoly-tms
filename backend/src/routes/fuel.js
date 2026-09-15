import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { recordAudit } from '../audit.js';
import { storeDeliveryPhoto } from '../storage.js';

const router = Router();
const managementRoles = ['admin', 'dispatcher'];

router.get('/', requireAuth, requireRole(...managementRoles), async (req, res) => {
  const { vehicle_id, driver_id } = req.query;
  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (vehicle_id) {
      conditions.push(`vehicle_id = $${idx}`); values.push(parseInt(vehicle_id)); idx++;
    }
    if (driver_id) {
      conditions.push(`driver_id = $${idx}`); values.push(parseInt(driver_id)); idx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT f.*, v.plate, d.name AS driver_name
      FROM fuel_logs f
      JOIN vehicles v ON f.vehicle_id = v.id
      LEFT JOIN drivers d ON f.driver_id = d.id
      ${where}
      ORDER BY f.log_date DESC
      LIMIT 500
    `;
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch fuel logs' });
  }
});

router.post('/', requireAuth, requireRole('admin', 'dispatcher', 'driver'), async (req, res) => {
  const { vehicle_id, driver_id, log_date, station, liters, price_per_liter, total_cost, odometer, notes, fuel_photo } = req.body;
  const submittingDriverId = req.user.role === 'driver' ? req.user.driver_id : driver_id;
  if (!vehicle_id || !log_date || !station || !Number(liters) || !Number(price_per_liter) || !Number(total_cost) || !fuel_photo) {
    return res.status(400).json({ error: 'Vehicle, date, station, liters, price, total cost and a fuel pump photo are required' });
  }
  try {
    if (req.user.role === 'driver') {
      const assignment = await pool.query(
        `SELECT 1 FROM trips WHERE driver_id = $1 AND vehicle_id = $2 AND status IN ('planned', 'in_transit') LIMIT 1`,
        [req.user.driver_id, vehicle_id]
      );
      if (!assignment.rowCount) return res.status(403).json({ error: 'Vehicle is not assigned to your active trip' });
    }
    const photoUrl = await storeDeliveryPhoto(fuel_photo, `fuel-proofs/vehicle-${vehicle_id}-${Date.now()}.jpg`);
    const { rows } = await pool.query(
      `INSERT INTO fuel_logs
       (vehicle_id, driver_id, log_date, station, liters, price_per_liter, total_cost, odometer, notes, fuel_photo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [vehicle_id, submittingDriverId || null, log_date, station, liters, price_per_liter, total_cost, odometer || null, notes || null, photoUrl]
    );
    await recordAudit({ actorUserId: req.user.id, action: 'fuel_submitted', entityType: 'fuel_log', entityId: rows[0].id, metadata: { vehicleId: vehicle_id, totalCost: total_cost } });
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(503).json({ error: 'Fuel entry could not be saved. Check the fuel photo and storage connection.' });
  }
});

export default router;
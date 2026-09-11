import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
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

router.post('/', async (req, res) => {
  const { vehicle_id, driver_id, log_date, station, liters, price_per_liter, total_cost, odometer, notes } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO fuel_logs
       (vehicle_id, driver_id, log_date, station, liters, price_per_liter, total_cost, odometer, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [vehicle_id, driver_id, log_date, station, liters, price_per_liter, total_cost, odometer, notes]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create fuel log' });
  }
});

export default router;
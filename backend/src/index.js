import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import driversRoutes from './routes/drivers.js';
import vehiclesRoutes from './routes/vehicles.js';
import customersRoutes from './routes/customers.js';
import loadsRoutes from './routes/loads.js';
import tripsRoutes from './routes/trips.js';
import fuelRoutes from './routes/fuel.js';
import paymentsRoutes from './routes/payments.js';
import expensesRoutes from './routes/expenses.js';
import dashboardRoutes from './routes/dashboard.js';
import usersRoutes from './routes/users.js';
import { pool } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/loads', loadsRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);

const PORT = process.env.PORT || 4000;
async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS delivery_proofs (
      id SERIAL PRIMARY KEY,
      trip_id INT NOT NULL,
      driver_id INT NOT NULL,
      photo TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  app.listen(PORT, () => console.log(`TMS API running on port ${PORT}`));
}

start().catch((error) => {
  console.error('TMS API startup failed', error);
  process.exit(1);
});
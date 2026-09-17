import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import { runMigrations } from './migrate.js';
import locationsRoutes from './routes/locations.js';
import auditRoutes from './routes/audit.js';

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is missing.');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(express.json());

// General rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

// Strict rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' }
});
app.use('/api/auth/login', loginLimiter);

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
app.use('/api/locations', locationsRoutes);
app.use('/api/audit', auditRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
let server;

async function start() {
  await runMigrations();
  server = app.listen(PORT, () => console.log(`TMS API running on port ${PORT}`));
}

start().catch((error) => {
  console.error('TMS API startup failed', error);
  process.exit(1);
});

// Graceful Shutdown
async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await pool.end();
        console.log('Database pool closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error closing database pool:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

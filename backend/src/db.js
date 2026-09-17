import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env.neon', import.meta.url), override: true });

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' || (connectionString && connectionString.includes('neon.tech'))
    ? { rejectUnauthorized: false }
    : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

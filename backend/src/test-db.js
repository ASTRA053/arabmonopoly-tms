// src/test-db.js
import pkg from 'pg';
const { Pool } = pkg;

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = new URL(process.env.DATABASE_URL);

console.log('Connecting with:', {
  host: dbUrl.hostname,
  port: dbUrl.port,
  database: dbUrl.pathname.slice(1),
  user: dbUrl.username,
  hasPassword: !!dbUrl.password,
});

const pool = new Pool({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port, 10),
  database: dbUrl.pathname.slice(1),
  user: dbUrl.username,
  password: dbUrl.password,
});

async function test() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('DB connection OK');
  } catch (err) {
    console.error('DB connection FAILED:', err.message);
  } finally {
    await pool.end();
  }
}

test().catch(console.error);
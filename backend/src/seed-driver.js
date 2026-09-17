// src/seed-driver.js
import pkg from 'pg';
const { Pool } = pkg;

import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set before seeding users`);
  }
  return value;
}

async function createDriver() {
  const email = requireEnv('DRIVER_EMAIL').toLowerCase();
  const password = requireEnv('DRIVER_PASSWORD');
  const name = process.env.DRIVER_NAME || 'Driver';

  const client = await pool.connect();
  try {
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      console.log('Driver already exists:', email);
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const res = await client.query(
      `INSERT INTO users (email, password_hash, name, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, email, role`,
      [email, hashed, name, 'driver']
    );

    console.log('Driver created:', res.rows[0]);
  } catch (err) {
    console.error('Error creating driver:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createDriver().catch(console.error);
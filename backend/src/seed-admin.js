// src/seed-admin.js
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@tms.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin1234!';

  const client = await pool.connect();
  try {
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      await client.query("UPDATE users SET name = 'Ahmed', role = 'admin' WHERE email = $1", [email]);
      console.log('Admin already exists and was renamed:', email);
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const res = await client.query(
      `INSERT INTO users (email, password_hash, name, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, email, role`,
      [email, hashed, 'Ahmed', 'admin']
    );

    console.log('Admin created:', res.rows[0]);
  } catch (err) {
    console.error('Error creating admin:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdmin().catch(console.error);
// src/check-roles.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'tms_db',
  user: 'postgres',
  password: 'Aa123456',
});

async function checkRoles() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) AS constraint_def
      FROM pg_constraint
      WHERE conrelid = 'users'::regclass
        AND contype = 'c';
    `);
    console.log('Check constraints on "users":');
    res.rows.forEach(r => console.log(`${r.conname}: ${r.constraint_def}`));

    // Also list existing roles
    const roles = await client.query(`SELECT DISTINCT role FROM users`);
    console.log('Existing roles in users table:');
    roles.rows.forEach(r => console.log(`- ${r.role}`));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkRoles().catch(console.error);
// src/check-users-table.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'tms_db',
  user: 'postgres',
  password: 'Aa123456',
});

async function checkTable() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.log('Columns in "users" table:');
    res.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTable().catch(console.error);
// src/test-postgres.js
import pkg from 'pg';
const { Pool } = pkg;

const postgresPool = new Pool({
  connectionString: process.env.POSTGRES_ADMIN_DATABASE_URL || process.env.DATABASE_URL,
});

async function testPostgres() {
  if (!process.env.POSTGRES_ADMIN_DATABASE_URL && !process.env.DATABASE_URL) {
    throw new Error('POSTGRES_ADMIN_DATABASE_URL or DATABASE_URL must be set before running this script');
  }
  const client = await postgresPool.connect();
  try {
    const targetUser = process.env.DB_APP_USER || 'user';
    const res = await client.query(`SELECT usename FROM pg_user WHERE usename = $1`, [targetUser]);
    console.log(`User "${targetUser}" exists?`, res.rows.length > 0);
    if (res.rows.length > 0) {
      console.log('Users:', res.rows);
    }
    console.log('SUCCESS: the configured admin database connection works');
  } catch (err) {
    console.error('FAILED for the configured admin database connection:', err.message);
  } finally {
    client.release();
    await postgresPool.end();
  }
}

testPostgres().catch(console.error);
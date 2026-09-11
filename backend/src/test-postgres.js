// src/test-postgres.js
import pkg from 'pg';
const { Pool } = pkg;

const postgresPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Aa123456',
});

async function testPostgres() {
  const client = await postgresPool.connect();
  try {
    const res = await client.query(`SELECT usename FROM pg_user WHERE usename = 'user'`);
    console.log('User "user" exists?', res.rows.length > 0);
    if (res.rows.length > 0) {
      console.log('Users:', res.rows);
    }
    console.log('SUCCESS: postgres/Aa123456 can connect');
  } catch (err) {
    console.error('FAILED for postgres/Aa123456:', err.message);
  } finally {
    client.release();
    await postgresPool.end();
  }
}

testPostgres().catch(console.error);
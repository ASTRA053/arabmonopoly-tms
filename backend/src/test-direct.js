// src/test-direct.js
import pkg from 'pg';
const { Pool } = pkg;

// Try connecting as the "user" role with the password we set
const userPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'tms_db',
  user: 'user',
  password: 'Aa123456',
});

async function testUser() {
  const client = await userPool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('SUCCESS: user/Aa123456 can connect to tms_db');
  } catch (err) {
    console.error('FAILED for user/Aa123456:', err.message);
  } finally {
    client.release();
    await userPool.end();
  }
}

testUser().catch(console.error);
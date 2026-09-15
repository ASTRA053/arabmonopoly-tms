// src/test-direct.js
import pkg from 'pg';
const { Pool } = pkg;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set before running this script`);
  }
  return value;
}

const userPool = new Pool({
  connectionString: requireEnv('DATABASE_URL'),
});

async function testUser() {
  const client = await userPool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('SUCCESS: the configured database connection works');
  } catch (err) {
    console.error('FAILED to connect with the configured database connection:', err.message);
  } finally {
    client.release();
    await userPool.end();
  }
}

testUser().catch(console.error);
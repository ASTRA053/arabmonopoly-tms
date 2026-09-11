// src/grant-permissions.js
import pkg from 'pg';
const { Pool } = pkg;

const adminPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'tms_db',
  user: 'postgres',
  password: 'Aa123456',
});

async function grantPermissions() {
  const client = await adminPool.connect();
  try {
    // Grant usage on schema
    await client.query(`GRANT USAGE ON SCHEMA public TO "user"`);

    // Grant all on all tables in public schema
    await client.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "user"`);

    // Grant all on all sequences (for auto-increment ids)
    await client.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "user"`);

    // For future tables
    await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "user"`);
    await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "user"`);

    console.log('Permissions granted to "user" on tms_db');
  } catch (err) {
    console.error('Error granting permissions:', err.message);
  } finally {
    client.release();
    await adminPool.end();
  }
}

grantPermissions().catch(console.error);
// src/grant-permissions.js
import pkg from 'pg';
const { Pool } = pkg;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set before running this script`);
  }
  return value;
}

const adminPool = new Pool({
  connectionString: requireEnv('DATABASE_URL'),
});

async function grantPermissions() {
  const targetUser = process.env.DB_APP_USER || 'user';
  const client = await adminPool.connect();
  try {
    // Grant usage on schema
    await client.query(`GRANT USAGE ON SCHEMA public TO "${targetUser.replace(/"/g, '""')}"`);

    // Grant all on all tables in public schema
    await client.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${targetUser.replace(/"/g, '""')}"`);

    // Grant all on all sequences (for auto-increment ids)
    await client.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${targetUser.replace(/"/g, '""')}"`);

    // For future tables
    await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${targetUser.replace(/"/g, '""')}"`);
    await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "${targetUser.replace(/"/g, '""')}"`);

    console.log(`Permissions granted to "${targetUser}" on the configured database`);
  } catch (err) {
    console.error('Error granting permissions:', err.message);
  } finally {
    client.release();
    await adminPool.end();
  }
}

grantPermissions().catch(console.error);
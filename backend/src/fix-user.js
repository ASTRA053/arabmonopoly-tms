// src/fix-user.js
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
  connectionString: requireEnv('POSTGRES_ADMIN_DATABASE_URL'),
});

async function fixUser() {
  const targetUser = process.env.DB_APP_USER || 'user';
  const targetDatabase = process.env.DB_APP_DATABASE || 'tms_db';
  const newPassword = requireEnv('DB_APP_PASSWORD');
  const escapedUser = targetUser.replace(/"/g, '""');
  const escapedPassword = newPassword.replace(/'/g, "''");
  const escapedDatabase = targetDatabase.replace(/"/g, '""');

  const client = await adminPool.connect();
  try {
    // Check if user exists
    const res = await client.query(
      `SELECT usename FROM pg_user WHERE usename = $1`,
      [targetUser]
    );

    if (res.rows.length === 0) {
      console.log(`User "${targetUser}" not found, creating...`);
      await client.query(
        `CREATE USER "${escapedUser}" WITH PASSWORD '${escapedPassword}'`
      );
      await client.query(`GRANT ALL PRIVILEGES ON DATABASE "${escapedDatabase}" TO "${escapedUser}"`);
      console.log(`User "${targetUser}" created and granted access to "${targetDatabase}"`);
    } else {
      console.log(`User "${targetUser}" exists, resetting password...`);
      await client.query(
        `ALTER USER "${escapedUser}" WITH PASSWORD '${escapedPassword}'`
      );
      console.log(`Password for "${targetUser}" updated`);
    }

    // Also make sure the application database exists
    const dbRes = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDatabase]
    );
    if (dbRes.rows.length === 0) {
      console.log(`Database "${targetDatabase}" not found, creating...`);
      await client.query(`CREATE DATABASE "${escapedDatabase}"`);
      console.log(`Database "${targetDatabase}" created`);
    } else {
      console.log(`Database "${targetDatabase}" exists`);
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await adminPool.end();
  }
}

fixUser().catch(console.error);
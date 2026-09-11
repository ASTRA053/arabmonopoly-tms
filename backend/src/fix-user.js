// src/fix-user.js
import pkg from 'pg';
const { Pool } = pkg;

const adminPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Aa123456', // postgres superuser password
});

async function fixUser() {
  const targetUser = 'user';
  const newPassword = 'Aa123456'; // password you want for "user"

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
        `CREATE USER "${targetUser}" WITH PASSWORD '${newPassword.replace(/'/g, "''")}'`
      );
      await client.query(`GRANT ALL PRIVILEGES ON DATABASE tms_db TO "${targetUser}"`);
      console.log(`User "${targetUser}" created and granted access to tms_db`);
    } else {
      console.log(`User "${targetUser}" exists, resetting password...`);
      await client.query(
        `ALTER USER "${targetUser}" WITH PASSWORD '${newPassword.replace(/'/g, "''")}'`
      );
      console.log(`Password for "${targetUser}" updated`);
    }

    // Also make sure tms_db exists
    const dbRes = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = 'tms_db'`
    );
    if (dbRes.rows.length === 0) {
      console.log('Database tms_db not found, creating...');
      await client.query(`CREATE DATABASE tms_db`);
      console.log('Database tms_db created');
    } else {
      console.log('Database tms_db exists');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await adminPool.end();
  }
}

fixUser().catch(console.error);
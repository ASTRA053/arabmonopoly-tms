import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env.neon', import.meta.url), override: true });

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
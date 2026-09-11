-- Run this in the Neon SQL Editor.
-- The main schema is the source of truth; this file is a reminder for the
-- delivery proof table created by the backend startup migration.
CREATE TABLE IF NOT EXISTS delivery_proofs (
  id SERIAL PRIMARY KEY,
  trip_id INT NOT NULL,
  driver_id INT NOT NULL,
  photo TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

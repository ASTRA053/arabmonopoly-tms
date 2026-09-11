-- Users (for login)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','dispatcher','driver')),
  driver_id INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers
CREATE TABLE drivers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  national_id TEXT,
  license_no TEXT,
  license_expiry DATE,
  contract_type TEXT CHECK (contract_type IN ('company','owner_operator')),
  bank_details JSONB,
  status TEXT DEFAULT 'active',
  trip_rate NUMERIC,
  rate_type TEXT DEFAULT 'per_trip',
  currency TEXT DEFAULT 'SAR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles (dump trucks)
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  plate TEXT UNIQUE NOT NULL,
  model TEXT,
  capacity NUMERIC,
  year INT,
  gps_device_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fuel logs
CREATE TABLE fuel_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id),
  driver_id INT REFERENCES drivers(id),
  log_date TIMESTAMPTZ NOT NULL,
  station TEXT,
  liters NUMERIC NOT NULL,
  price_per_liter NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  odometer NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  payment_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loads (jobs)
CREATE TABLE loads (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  material_type TEXT,
  quantity NUMERIC,
  unit TEXT,
  rate NUMERIC,
  total_amount NUMERIC,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  load_id INT REFERENCES loads(id),
  vehicle_id INT REFERENCES vehicles(id),
  driver_id INT REFERENCES drivers(id),
  planned_start TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  planned_end TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT DEFAULT 'planned',
  distance NUMERIC,
  duration_minutes INT,
  rate_per_trip NUMERIC DEFAULT 0,
  extra_earnings NUMERIC DEFAULT 0,
  pay_status TEXT DEFAULT 'unpaid',
  delivery_photo TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip cycles (multiple cycles per trip/day)
CREATE TABLE trip_cycles (
  id SERIAL PRIMARY KEY,
  trip_id INT REFERENCES trips(id),
  sequence_no INT NOT NULL,
  from_location TEXT,
  to_location TEXT,
  quantity NUMERIC,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  weighbridge_ticket_no TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery proof submitted by the assigned driver
CREATE TABLE delivery_proofs (
  id SERIAL PRIMARY KEY,
  trip_id INT NOT NULL,
  driver_id INT NOT NULL,
  photo TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver payments / settlements
CREATE TABLE driver_payments (
  id SERIAL PRIMARY KEY,
  driver_id INT REFERENCES drivers(id),
  trip_id INT REFERENCES trips(id),
  period_start DATE,
  period_end DATE,
  earnings JSONB,
  deductions JSONB,
  net_pay NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id),
  driver_id INT REFERENCES drivers(id),
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  expense_date TIMESTAMPTZ NOT NULL,
  receipt_url TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_actual_start ON trips(actual_start);
CREATE INDEX idx_driver_payments_driver_id ON driver_payments(driver_id);
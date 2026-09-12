# Arabmonopoly Logistics TMS

## Purpose

Arabmonopoly Logistics is a transport management system (TMS) for managing trips, loads, drivers, vehicles, fuel, payments, expenses, delivery proof, and operational reporting.

The system has two user experiences:

- Laptop/desktop: administrator control center for Ahmed.
- Android/mobile: driver-only app for assigned work, earnings, and delivery proof.

## Repository

GitHub repository:

- https://github.com/ASTRA053/arabmonopoly-tms
- Main branch: `main`
- Latest important commits:
  - `4202b2d`: initial deployment-ready project commit
  - `b2c78c1`: mobile app uses the public Render API
  - `77befb2`: desktop app uses the public Render API

Do not commit `.env`, `.env.neon`, API tokens, passwords, or database connection strings.

## Project Structure

```text
backend/       Express + PostgreSQL REST API
web-admin/     React + Vite administrator dashboard
mobile-app/    Expo React Native mobile application
desktop-app/   Electron Windows desktop wrapper
database/      PostgreSQL schema and Neon setup SQL
render.yaml    Render Blueprint for the backend
```

## Backend

Location:

```text
C:\Projects\tms-complete\backend
```

Technology:

- Node.js ESM
- Express
- PostgreSQL using `pg`
- JWT authentication
- bcrypt/bcryptjs password hashing
- CORS
- Docker/Render deployment support

API route groups:

- `/api/auth` login and registration
- `/api/users` admin-only account management
- `/api/drivers` driver management
- `/api/vehicles` fleet management
- `/api/customers` customer management
- `/api/loads` load management
- `/api/trips` trip management
- `/api/fuel` fuel records
- `/api/payments` driver settlements
- `/api/expenses` operational expenses
- `/api/dashboard/summary` live KPI and reporting summary
- `/api/locations` vehicle GPS location ingestion and latest locations
- `/api/audit` admin/dispatcher audit log access

Important driver endpoints:

- `GET /api/trips/mine`: returns trips assigned to the authenticated driver
- `PATCH /api/trips/:id/delivery-proof`: accepts a delivery photo and marks the driver's trip delivered
- `POST /api/locations`: records a foreground or background GPS update for the driver's assigned active vehicle
- `GET /api/audit`: returns recent operational audit events to authenticated administrators and dispatchers

Delivery proof metadata is stored in the `delivery_proofs` table. Photos are uploaded to configured S3-compatible object storage and only their public URL is stored in PostgreSQL.

Render object-storage variables:

- `OBJECT_STORAGE_ENDPOINT`
- `OBJECT_STORAGE_REGION`
- `OBJECT_STORAGE_BUCKET`
- `OBJECT_STORAGE_ACCESS_KEY`
- `OBJECT_STORAGE_SECRET_KEY`
- `OBJECT_STORAGE_PUBLIC_URL`

## Database

The project uses Neon Postgres in the cloud.

Neon project:

- Name: `arabmonopoly-tms`
- Project ID: `cool-wind-01510907`
- Branch: `production`
- Region: AWS Asia Pacific Southeast 1

The database contains these main tables:

- `users`
- `drivers`
- `vehicles`
- `fuel_logs`
- `customers`
- `loads`
- `trips`
- `trip_cycles`
- `driver_payments`
- `expenses`
- `delivery_proofs`

The database schema is in `database/schema.sql`.

Neon environment values were pulled into `backend/.env.neon`. This file is ignored by Git and must never be shared publicly.

The backend loads `backend/.env.neon` when present and uses `backend/.env` as the local fallback.

## Authentication

Backend authentication is real JWT authentication through `/api/auth/login`.

Admin seed account used during development:

- Email: `admin@tms.local`
- Password: `Admin1234!`
- Name: Ahmed
- Role: admin

Do not reuse this password in production. Change it after deployment.

Driver accounts should be created from the laptop Users screen. A driver account should be linked to a driver record using `driver_id`.

Roles supported by the database:

- `admin`
- `dispatcher`
- `driver`

The driver mobile app only exposes driver dashboard and assigned trips screens after a driver logs in.

## Web Admin Dashboard

Location:

```text
C:\Projects\tms-complete\web-admin
```

Run locally:

```powershell
cd C:\Projects\tms-complete\web-admin
npm run dev -- --host 0.0.0.0
```

Local browser URL:

```text
http://localhost:5173
```

LAN browser URL example:

```text
http://10.176.158.251:5173
```

The dashboard has:

- Overview
- Trips
- Fleet
- Drivers
- Users
- Loads
- Customers
- Fuel
- Payments
- Expenses
- Reports
- Settings
- Live KPI cards
- Dispatch board
- Exception queue
- Network health metrics
- Driver totals: trips, delivered trips, earnings
- Fuel total for the current month
- Trip and payment quick status actions
- Laptop-only account creation for drivers, dispatchers, and admins

The desktop package loads the web dashboard from relative Vite assets, which fixes Electron `file://` white-screen problems.

Build and lint:

```powershell
cd C:\Projects\tms-complete\web-admin
npm run build
npm run lint
```

## Mobile App

Location:

```text
C:\Projects\tms-complete\mobile-app
```

Technology:

- Expo SDK 57
- React Native
- React Navigation drawer
- Expo Image Picker for delivery proof photos

Run development mode:

```powershell
cd C:\Projects\tms-complete\mobile-app
npx expo start --lan --clear
```

The installed APK now defaults to the public backend:

```text
https://arabmonopoly-api.onrender.com/api
```

For local development, the API can be overridden with:

```powershell
$env:EXPO_PUBLIC_API_URL="http://10.176.158.251:4000/api"
npx expo start
```

Driver mobile workflow:

1. Driver logs in with the account created by the administrator.
2. Driver sees only assigned trips.
3. Driver sees total trips, delivered trips, and earnings.
4. Driver opens a trip and takes a delivery proof photo.
5. The app sends the photo to the backend.
6. The trip is marked delivered.
7. The laptop dashboard sees the updated delivery and totals.
8. During an active trip, the driver can start background tracking from My trips and stop it when the trip ends. Android displays an ongoing tracking notification while this is active.

Background tracking requires an installed Android build, not Expo Go. The driver must grant foreground and all-the-time location permissions. The app records updates after approximately 150 metres of movement or 60 seconds, subject to Android battery and location-service limits.

Expo project:

- Account: `astra053`
- Project: `@astra053/arabmonopoly`
- Android package: `com.arabmonopoly.logistics`
- EAS project ID: `e92ef49b-7b91-49cd-b75b-d966c713076d`

The latest APK build configured for the public Render API was submitted under EAS build ID:

```text
7e6b0429-f5e1-4766-b26c-3cbd3a3f5567
```

Build page:

https://expo.dev/accounts/astra053/projects/arabmonopoly/builds/7e6b0429-f5e1-4766-b26c-3cbd3a3f5567

If a newer APK is needed:

```powershell
cd C:\Projects\tms-complete\mobile-app
npx --yes eas-cli@24.0.0 build --platform android --profile preview --non-interactive
```

The `preview` profile creates an installable APK. The `production` profile creates an Android App Bundle for Play Store distribution.

## Windows Desktop App

Location:

```text
C:\Projects\tms-complete\desktop-app
```

Technology:

- Electron
- electron-builder
- NSIS Windows installer

The desktop wrapper embeds the built web dashboard and uses the public Render API when loaded from `file://`.

Build installer:

```powershell
cd C:\Projects\tms-complete\web-admin
npm run build
cd C:\Projects\tms-complete\desktop-app
npm run dist
```

Installer output:

```text
C:\Projects\tms-complete\desktop-app\release\Arabmonopoly Logistics Setup 1.0.0.exe
```

Uninstall older versions before installing a rebuilt installer.

## Live Backend Deployment

The backend is deployed successfully on Render.

Live API:

```text
https://arabmonopoly-api.onrender.com
```

Dashboard API check:

```text
https://arabmonopoly-api.onrender.com/api/dashboard/summary
```

Render service:

- Name: `arabmonopoly-api`
- Blueprint: `arabmonopoly-tms`
- Blueprint ID: `exs-dai6526q1p3s73bgnq0g`
- Repository: `ASTRA053/arabmonopoly-tms`
- Branch: `main`
- Blueprint file: `render.yaml`

Render environment variables required:

- `DATABASE_URL`: Neon pooled connection string
- `JWT_SECRET`: long random production secret
- `PORT`: `8080` is configured by `render.yaml`

Do not place the Neon URL or JWT secret into GitHub. Set them in Render Environment Variables.

Render free plan notes:

- The service may sleep when idle.
- The first request after sleep can be slow.
- The public API has been verified with HTTP `200`.

## Frontend Hosting

The web dashboard can be deployed separately to Netlify or Cloudflare Pages.

Netlify configuration is in:

```text
web-admin/netlify.toml
```

Set this build environment variable on the frontend host:

```text
VITE_API_URL=https://arabmonopoly-api.onrender.com/api
```

Build command:

```text
npm run build
```

Publish directory:

```text
dist
```

The web dashboard code also automatically uses the current browser host for local/LAN development and uses the Render API when packaged into the desktop app.

## Google Cloud Attempt

Google Cloud SDK was installed and authenticated, but the Google Cloud project `arab-monopoly-tms` had no billing account linked.

Cloud Run deployment files exist:

- `backend/Dockerfile`
- `backend/cloudbuild.yaml`

Cloud Run was not used because billing was unavailable. Render + Neon is the current free/internet deployment path.

## Common Commands

Start backend locally:

```powershell
cd C:\Projects\tms-complete\backend
node src/index.js
```

Start web admin locally:

```powershell
cd C:\Projects\tms-complete\web-admin
npm run dev -- --host 0.0.0.0
```

Start Expo locally:

```powershell
cd C:\Projects\tms-complete\mobile-app
npx expo start --lan --clear
```

Run backend dashboard test:

```powershell
cd C:\Projects\tms-complete\backend
node --test test/dashboardSummary.test.js
```

Run web checks:

```powershell
cd C:\Projects\tms-complete\web-admin
npm run build
npm run lint
```

## Known Limitations

- The free Render service may sleep when idle.
- The free Neon database has plan limits.
- Delivery photo uploads require S3-compatible object-storage variables on Render.
- Background GPS tracking is opt-in and stops if Android terminates the app; device power-saving settings can also affect updates.
- Full production role permissions should be expanded beyond the current admin/driver route guards.
- The admin UI has broad CRUD coverage, but some edit/delete flows still need deeper lifecycle handling.
- The current public APK uses the Render API and must be rebuilt whenever the public API URL changes.
- The old local/LAN APK should be uninstalled before installing the public-internet APK if Android reports a conflict.

## Recommended Next Steps

1. Verify Render environment variables and deploy logs.
2. Open the live dashboard/API URL from Render.
3. Create a real admin password and real driver accounts.
4. Install the latest public-API APK.
5. Test driver login, assigned trip display, delivery photo upload, and laptop totals.
6. Deploy the web admin to Netlify or Cloudflare Pages using `VITE_API_URL`.
7. Choose an S3-compatible provider and configure the six object-storage variables on Render.
8. Install Android build version 5 before using background location tracking.
9. Review operational activity through the laptop Audit screen, backed by `/api/audit`.
10. Review Dependabot pull requests when GitHub creates them. No Dependabot pull requests were open on 12 September 2026.

# Arabmonopoly Logistics TMS: AI Handoff

## Project Goal

This is a cloud-backed Transport Management System for Arabmonopoly Logistics.

- Laptop/Windows admin app: office users manage drivers, vehicles, loads, trips, fuel, payments, expenses, users, and audit events.
- Android driver app: drivers log in, view assigned trips, submit delivery photos, share GPS, and submit fuel entries with a required fuel-pump photo.

## Architecture

| Area | Location | Technology | Live status |
| --- | --- | --- | --- |
| API | `backend/` | Node.js, Express, PostgreSQL, JWT, bcryptjs | Render: `https://arabmonopoly-api.onrender.com` |
| Database | Neon Lakebase Postgres | PostgreSQL | Production branch |
| Admin app | `web-admin/` | React + Vite | GitHub Pages: `https://astra053.github.io/arabmonopoly-tms/` |
| Windows app | `desktop-app/` | Electron + NSIS | Installer has been built previously |
| Driver app | `mobile-app/` | Expo SDK 57 + React Native | Android preview APK builds via EAS |
| Photo storage | Render environment + Cloudflare R2-compatible S3 API | AWS S3 SDK | Delivery/fuel photos upload through `backend/src/storage.js` |

## Security Rules

- Never print, commit, or request passwords, tokens, database URLs, object-storage keys, or JWT secrets in chat.
- Real user passwords are bcrypt hashes in the database; readable passwords are not stored by the application.
- Environment files such as `backend/.env.neon` are ignored by Git.
- Production configuration belongs in Render environment variables: `DATABASE_URL`, `JWT_SECRET`, and `OBJECT_STORAGE_*`.
- Legacy local scripts contain example development passwords. Treat these as exposed, never use them for real accounts, and do not copy their values into documentation.

## Important Backend Behavior

- `POST /api/auth/login`: all account logins.
- Public registration has been removed. `POST /api/users` is admin-only and creates driver/dispatcher/admin accounts.
- `GET /api/trips/mine`: authenticated driver's assigned trips.
- `PATCH /api/trips/:id/delivery-proof`: driver uploads delivery proof and marks the trip delivered.
- `POST /api/fuel`: admin/dispatcher/driver fuel entry. Driver must have an active assigned trip and must submit a fuel-pump photo.
- `POST /api/locations`: admin/dispatcher/driver GPS update. A driver can post only for the vehicle on their active assigned trip.
- `GET /api/locations/latest`: admin/dispatcher latest vehicle locations.
- `GET /api/audit`: admin/dispatcher activity log.
- Migrations run at startup through `backend/src/migrate.js`. `backend/migrations/002_fuel_photo.sql` adds `fuel_logs.fuel_photo`.

## Mobile Driver Features

- `mobile-app/screens/driver/DriverTripsScreen.js`: assigned trips, manual GPS, delivery photo, and background GPS controls.
- `mobile-app/screens/driver/DriverFuelScreen.js`: driver fuel entry; requires station, liters, price, active trip, and fuel-pump camera photo.
- `mobile-app/screens/driver/BackgroundLocation.js`: global Expo TaskManager location task. It posts updates through `/api/locations` every roughly 150 m or 60 seconds.
- `mobile-app/context/AuthContext.js`: stops background tracking on logout.
- `mobile-app/app.json`: Android `versionCode` is `5`; it includes background location and foreground-service permissions.

Background tracking is opt-in. It requires an installed Android build, driver permission for foreground and all-the-time location, and can stop when Android terminates the app or applies battery restrictions. It cannot be fully tested in Expo Go or the web export.

## Admin Dashboard Features

- `web-admin/src/App.jsx` has authenticated laptop access for admin and dispatcher roles.
- Main modules: Overview, Trips, Fleet, Drivers, Users, Loads, Customers, Fuel, Payments, Expenses, Audit, Reports, Settings.
- The Audit screen loads protected records from `/api/audit`.

## APK Archive

Available local APKs are in `releases/android-apk/`:

| File | Contents |
| --- | --- |
| `Arabmonopoly-Driver-v3.apk` | Delivery proof and manual foreground GPS sharing |
| `Arabmonopoly-Driver-v4.apk` | Driver fuel entry with required fuel-pump photo |

`releases/android-apk/README.md` records SHA-256 hashes.

Android v5 background-GPS build was submitted to EAS and was still in progress on 13 September 2026:

`https://expo.dev/accounts/astra053/projects/arabmonopoly/builds/39cefa8c-a6a7-44ad-a205-a6f8c420e9e1`

When it finishes, download its APK into `releases/android-apk/Arabmonopoly-Driver-v5.apk`, calculate its SHA-256, and update the archive README.

## Current Git State & Updates (18 September 2026)

- Branch: `publish-fuel`.
- Backend production hardening completed:
  - Added `helmet` security headers and `express-rate-limit` (global and login rate-limiting).
  - Robust PostgreSQL pool config (`backend/src/db.js`) with SSL for Neon, connection limits, and idle error listeners.
  - Startup environment validation (`JWT_SECRET`, `DATABASE_URL`) and graceful shutdown (`SIGTERM`, `SIGINT`).
  - Comprehensive `.gitignore` updates ensuring `.apk`, `.exe`, `.blockmap`, and release folders remain untracked.
- Validated:
  - Backend dashboard unit tests passed.
  - `web-admin` build & lint passed.
  - `mobile-app` web export passed.
  - Render API live health check returned HTTP 200.

## Validation Already Performed

- `node --check src/routes/fuel.js`: passed.
- Database migration confirmed `fuel_logs.fuel_photo` exists.
- Backend dashboard test: passed.
- `npx expo export --platform web`: passed after background GPS changes.
- `npm run build` and `npm run lint` in `web-admin/`: passed after Audit screen changes.
- `npx expo config --type public`: confirmed Android version code 5 and background location plugin configuration.
- API dashboard summary returned HTTP 200 during earlier production checks.

## Recommended Next Actions

1. Wait for EAS v5 build to finish, archive it locally, and verify its SHA-256.
2. Review and commit the current source/documentation changes. Keep APK binaries untracked.
3. Push the source-only commit to `origin/main`; Render will deploy the backend only if backend files changed.
4. On a real Android device, log in as a driver with an active trip; grant all-the-time location; start tracking; background the app; then confirm an admin sees the update in `/api/locations/latest` and the Audit screen.
5. Run an end-to-end delivery/fuel photo upload with a real driver session to verify R2 storage returns public URLs.
6. Before live office use, replace or delete demo driver/vehicle/trip records only with owner approval.

## Common Commands

```powershell
# Backend test
Set-Location C:\Projects\tms-complete\backend
node --test test/dashboardSummary.test.js

# Web admin validation
Set-Location C:\Projects\tms-complete\web-admin
npm run build
npm run lint

# Mobile export/config validation
Set-Location C:\Projects\tms-complete\mobile-app
npx expo export --platform web
npx expo config --type public

# Start next Android preview APK build
npx eas-cli build --platform android --profile preview --non-interactive
```
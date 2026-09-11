import { Router } from 'express';
import { pool } from '../db.js';
import { buildDashboardSummary } from '../dashboardSummary.js';

const router = Router();

router.get('/summary', async (req, res) => {
  try {
    const [tripStats, paymentStats, vehicleStats, lateTripStats, onTimeStats, loadsMovedStats, kmCoveredStats, revenueStats, expiringLicensesStats, fuelVarianceStats, fuelTotalStats, driverTripStats, tripRows] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) AS active_trips,
          COALESCE(SUM(CASE WHEN status = 'delivered' AND actual_end >= NOW() - INTERVAL '1 day' THEN 1 ELSE 0 END), 0) AS delivered_today
        FROM trips
        WHERE status IN ('planned', 'in_transit', 'delivered')
      `),
      pool.query(`
        SELECT COALESCE(SUM(net_pay), 0) AS pending_payments
        FROM driver_payments
        WHERE status <> 'paid'
      `),
      pool.query(`
        SELECT COUNT(*) AS total_vehicles
        FROM vehicles
      `),
      pool.query(`
        SELECT COUNT(*) AS late_trips
        FROM trips
        WHERE status NOT IN ('delivered', 'cancelled')
          AND planned_end IS NOT NULL
          AND planned_end < NOW()
      `),
      pool.query(`
        SELECT COALESCE(AVG(CASE WHEN status = 'delivered' THEN 100 ELSE 0 END), 0) AS on_time_rate
        FROM trips
      `),
      pool.query(`
        SELECT COUNT(*) AS loads_moved
        FROM trips
        WHERE status = 'delivered'
      `),
      pool.query(`
        SELECT COALESCE(SUM(distance), 0) AS km_covered
        FROM trips
      `),
      pool.query(`
        SELECT COALESCE(SUM(rate_per_trip + extra_earnings), 0) AS revenue_this_month
        FROM trips
        WHERE created_at >= DATE_TRUNC('month', NOW())
      `),
      pool.query(`
        SELECT COUNT(*) AS expiring_licenses
        FROM drivers
        WHERE status = 'active'
          AND license_expiry IS NOT NULL
          AND license_expiry <= NOW() + INTERVAL '30 days'
      `),
      pool.query(`
        SELECT COUNT(*) AS fuel_variance
        FROM fuel_logs f
        JOIN vehicles v ON v.id = f.vehicle_id
        WHERE f.total_cost > 0
          AND f.odometer > 0
          AND f.total_cost / f.odometer > 0.55
      `),
      pool.query(`SELECT COALESCE(SUM(total_cost), 0) AS fuel_cost FROM fuel_logs WHERE log_date >= DATE_TRUNC('month', NOW())`),
      pool.query(`
        SELECT d.id AS driver_id, d.name, COUNT(t.id)::int AS total_trips,
               COUNT(t.id) FILTER (WHERE t.status = 'delivered')::int AS delivered_trips,
               COALESCE(SUM(t.rate_per_trip + t.extra_earnings), 0) AS total_earnings
        FROM drivers d LEFT JOIN trips t ON t.driver_id = d.id
        GROUP BY d.id, d.name ORDER BY total_trips DESC, d.name
      `),
      pool.query(`
        SELECT t.id,
               t.status,
               t.planned_start,
               t.planned_end,
               d.name AS driver_name,
               v.plate,
               COALESCE(l.material_type, 'General cargo') AS material_type
        FROM trips t
        JOIN drivers d ON d.id = t.driver_id
        JOIN vehicles v ON v.id = t.vehicle_id
        LEFT JOIN loads l ON l.id = t.load_id
        ORDER BY t.created_at DESC
        LIMIT 12
      `)
    ]);

    const activeTrips = Number(tripStats.rows[0]?.active_trips ?? 0);
    const deliveredToday = Number(tripStats.rows[0]?.delivered_today ?? 0);
    const totalVehicles = Number(vehicleStats.rows[0]?.total_vehicles ?? 0);
    const pendingPayments = Number(paymentStats.rows[0]?.pending_payments ?? 0);
    const lateTrips = Number(lateTripStats.rows[0]?.late_trips ?? 0);
    const onTimeRate = Number(onTimeStats.rows[0]?.on_time_rate ?? 0);
    const loadsMoved = Number(loadsMovedStats.rows[0]?.loads_moved ?? 0);
    const kmCovered = Number(kmCoveredStats.rows[0]?.km_covered ?? 0);
    const revenueThisMonth = Number(revenueStats.rows[0]?.revenue_this_month ?? 0);
    const expiringLicenses = Number(expiringLicensesStats.rows[0]?.expiring_licenses ?? 0);
    const fuelVariance = Number(fuelVarianceStats.rows[0]?.fuel_variance ?? 0);
    const fuelCost = Number(fuelTotalStats.rows[0]?.fuel_cost ?? 0);

    const byStatus = {
      planned: [],
      transit: [],
      delivered: []
    };

    for (const trip of tripRows.rows) {
      const route = trip.material_type ? `${trip.material_type}` : 'General cargo';
      const normalized = {
        id: `TRP-${trip.id}`,
        route,
        driver: trip.driver_name || 'Unassigned',
        vehicle: trip.plate || 'N/A',
        time: trip.planned_start ? new Date(trip.planned_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled',
        status: trip.status === 'in_transit' ? 'In transit' : trip.status === 'delivered' ? 'Delivered' : 'Planned'
      };

      if (trip.status === 'planned') byStatus.planned.push(normalized);
      else if (trip.status === 'in_transit') byStatus.transit.push(normalized);
      else if (trip.status === 'delivered') byStatus.delivered.push(normalized);
    }

    const exceptions = [];
    if (lateTrips > 0) {
      exceptions.push({
        title: 'Late arrival',
        detail: `${lateTrips} trip${lateTrips > 1 ? 's are' : ' is'} behind schedule`,
        severity: 'amber',
        action: 'Review'
      });
    }
    if (expiringLicenses > 0) {
      exceptions.push({
        title: 'License expiry',
        detail: `${expiringLicenses} driver license${expiringLicenses > 1 ? 's are' : ' is'} expiring soon`,
        severity: 'red',
        action: 'Open'
      });
    }
    if (fuelVariance > 0) {
      exceptions.push({
        title: 'Fuel variance',
        detail: `${fuelVariance} fueling record${fuelVariance > 1 ? 's' : ''} exceed the expected route benchmark`,
        severity: 'blue',
        action: 'Inspect'
      });
    }
    if (!exceptions.length) {
      exceptions.push({
        title: 'Network health',
        detail: 'No operational exceptions detected right now.',
        severity: 'green',
        action: 'View'
      });
    }

    const network = [
      { label: 'On-time delivery', value: `${Number(onTimeRate || 0).toFixed(1)}%`, progress: Number(onTimeRate || 0) },
      { label: 'Loads moved', value: String(loadsMoved), progress: loadsMoved > 0 ? Math.min(100, Math.round((loadsMoved / 80) * 100)) : 0 },
      { label: 'KM covered', value: `${Number(kmCovered || 0).toLocaleString()}`, progress: kmCovered > 0 ? Math.min(100, Math.round((kmCovered / 20000) * 100)) : 0 },
      { label: 'Revenue this month', value: `SAR ${Number(revenueThisMonth || 0).toLocaleString()}`, progress: revenueThisMonth > 0 ? Math.min(100, Math.round((revenueThisMonth / 200000) * 100)) : 0 }
      ,{ label: 'Fuel this month', value: `SAR ${fuelCost.toLocaleString()}`, progress: fuelCost > 0 ? Math.min(100, Math.round((fuelCost / 50000) * 100)) : 0 }
    ];

    const summary = buildDashboardSummary({
      activeTrips,
      deliveredToday,
      totalVehicles,
      pendingPayments,
      lateTrips,
      onTimeRate,
      loadsMoved,
      kmCovered,
      revenueThisMonth,
      dispatch: byStatus,
      exceptions,
      network
    });

    summary.driverTotals = driverTripStats.rows.map((driver) => ({
      driverId: driver.driver_id,
      name: driver.name,
      totalTrips: driver.total_trips,
      deliveredTrips: driver.delivered_trips,
      totalEarnings: Number(driver.total_earnings || 0)
    }));

    res.json(summary);
  } catch (error) {
    console.error('Failed to build dashboard summary', error);
    res.status(500).json({ error: 'Failed to build dashboard summary' });
  }
});

export default router;

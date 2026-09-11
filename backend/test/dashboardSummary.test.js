import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDashboardSummary } from '../src/dashboardSummary.js';

test('buildDashboardSummary calculates the live overview metrics', () => {
  const summary = buildDashboardSummary({
    activeTrips: 24,
    deliveredToday: 18,
    totalVehicles: 32,
    pendingPayments: 42800,
    lateTrips: 3,
    onTimeRate: 96.4,
    loadsMoved: 61,
    kmCovered: 18420,
    revenueThisMonth: 128000,
    dispatch: {
      planned: [{ id: 'TRP-2051' }],
      transit: [{ id: 'TRP-2048' }],
      delivered: [{ id: 'TRP-2047' }]
    },
    exceptions: [
      { title: 'Late arrival', detail: 'TRP-2046 is 38 min behind schedule', severity: 'amber' }
    ],
    network: [
      { label: 'On-time delivery', value: '96.4%', progress: 96 },
      { label: 'Loads moved', value: '61', progress: 72 }
    ]
  });

  assert.equal(summary.kpis.activeTrips, 24);
  assert.equal(summary.kpis.deliveredToday, 18);
  assert.equal(summary.kpis.fleetUtilization, 75);
  assert.equal(summary.kpis.pendingPayments, 42800);
  assert.equal(summary.kpis.lateTrips, 3);
  assert.equal(summary.network[0].value, '96.4%');
  assert.equal(summary.dispatch.planned.length, 1);
  assert.equal(summary.exceptions[0].title, 'Late arrival');
});

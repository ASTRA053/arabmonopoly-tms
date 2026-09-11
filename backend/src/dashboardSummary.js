export function buildDashboardSummary({
  activeTrips = 0,
  deliveredToday = 0,
  totalVehicles = 0,
  pendingPayments = 0,
  lateTrips = 0,
  onTimeRate = 0,
  loadsMoved = 0,
  kmCovered = 0,
  revenueThisMonth = 0,
  dispatch = { planned: [], transit: [], delivered: [] },
  exceptions = [],
  network = []
} = {}) {
  const fleetUtilization = totalVehicles > 0
    ? Math.min(100, Math.round((activeTrips / totalVehicles) * 100))
    : 0;

  const safeDispatch = {
    planned: dispatch.planned ?? [],
    transit: dispatch.transit ?? [],
    delivered: dispatch.delivered ?? []
  };

  const safeNetwork = network.length
    ? network
    : [
        { label: 'On-time delivery', value: `${onTimeRate.toFixed(1)}%`, progress: Number(onTimeRate) || 0 },
        { label: 'Loads moved', value: String(loadsMoved), progress: loadsMoved > 0 ? Math.min(100, Math.round((loadsMoved / 80) * 100)) : 0 },
        { label: 'KM covered', value: `${Number(kmCovered).toLocaleString()}`, progress: kmCovered > 0 ? Math.min(100, Math.round((kmCovered / 20000) * 100)) : 0 },
        { label: 'Revenue this month', value: `SAR ${Number(revenueThisMonth).toLocaleString()}`, progress: revenueThisMonth > 0 ? Math.min(100, Math.round((revenueThisMonth / 200000) * 100)) : 0 }
      ];

  return {
    kpis: {
      activeTrips,
      deliveredToday,
      fleetUtilization,
      pendingPayments,
      lateTrips
    },
    dispatch: safeDispatch,
    exceptions: exceptions.length ? exceptions : [
      { title: 'Network health', detail: 'No operational exceptions detected right now.', severity: 'green', action: 'View' }
    ],
    network: safeNetwork
  };
}

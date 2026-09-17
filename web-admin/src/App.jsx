import { useCallback, useEffect, useState } from 'react'
import './App.css'

const defaultSummary = {
  kpis: {
    activeTrips: 0,
    deliveredToday: 0,
    fleetUtilization: 0,
    pendingPayments: 0,
    lateTrips: 0,
  },
  dispatch: {
    planned: [],
    transit: [],
    delivered: [],
  },
  exceptions: [],
  network: []
}

const navItems = [
  ['Overview', '⌂'], ['Trips', '↗'], ['Fleet', '▣'],
  ['Drivers', '♙'], ['Users', '♚'], ['Loads', '▤'], ['Customers', '◎'], ['Fuel', '◉'], ['Payments', '◇'], ['Expenses', '✦'], ['Audit', '◷'], ['Reports', '▥'], ['Settings', '⚙'],
]

const API = import.meta.env.VITE_API_URL || (window.location.protocol === 'file:' ? 'https://arabmonopoly-api.onrender.com/api' : `${window.location.protocol}//${window.location.hostname}:4000/api`)
const authHeaders = (token, json = false) => ({
  ...(json ? { 'Content-Type': 'application/json' } : {}),
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})
const moduleConfig = {
  Trips: { endpoint: 'trips', title: 'Trip control', subtitle: 'Create and monitor every movement across your network.', columns: [['id', 'Trip'], ['driver_name', 'Driver'], ['plate', 'Vehicle'], ['status', 'Status'], ['planned_start', 'Planned start']], fields: [['load_id', 'Load ID'], ['vehicle_id', 'Vehicle ID'], ['driver_id', 'Driver ID'], ['planned_start', 'Planned start'], ['planned_end', 'Planned end'], ['rate_per_trip', 'Trip rate']] },
  Fleet: { endpoint: 'vehicles', title: 'Fleet control', subtitle: 'Keep every vehicle, document and availability state in one place.', columns: [['id', 'ID'], ['plate', 'Plate'], ['model', 'Model'], ['capacity', 'Capacity'], ['status', 'Status']], fields: [['plate', 'Plate'], ['model', 'Model'], ['capacity', 'Capacity'], ['year', 'Year'], ['gps_device_id', 'GPS device ID'], ['status', 'Status']] },
  Drivers: { endpoint: 'drivers', title: 'Driver control', subtitle: 'Manage driver records, licenses, rates and availability.', columns: [['id', 'ID'], ['name', 'Name'], ['phone', 'Phone'], ['license_no', 'License'], ['status', 'Status']], fields: [['name', 'Full name'], ['phone', 'Phone'], ['national_id', 'National ID'], ['license_no', 'License number'], ['license_expiry', 'License expiry'], ['contract_type', 'Contract type'], ['trip_rate', 'Trip rate'], ['currency', 'Currency']] },
  Loads: { endpoint: 'loads', title: 'Load control', subtitle: 'Monitor shipment jobs, material type, quantity and customer commitments.', columns: [['id', 'ID'], ['customer_id', 'Customer'], ['material_type', 'Material'], ['quantity', 'Qty'], ['status', 'Status']], fields: [['customer_id', 'Customer ID'], ['material_type', 'Material type'], ['quantity', 'Quantity'], ['unit', 'Unit'], ['rate', 'Rate'], ['total_amount', 'Total amount'], ['status', 'Status']] },
  Customers: { endpoint: 'customers', title: 'Customer control', subtitle: 'Keep customer records, payment terms and shipping contacts together.', columns: [['id', 'ID'], ['name', 'Customer'], ['contact_person', 'Contact'], ['phone', 'Phone'], ['payment_terms', 'Terms']], fields: [['name', 'Customer name'], ['contact_person', 'Contact person'], ['phone', 'Phone'], ['address', 'Address'], ['tax_id', 'Tax ID'], ['payment_terms', 'Payment terms']] },
  Fuel: { endpoint: 'fuel', title: 'Fuel control', subtitle: 'Track fuel usage, cost and odometer history by vehicle.', columns: [['id', 'ID'], ['plate', 'Vehicle'], ['driver_name', 'Driver'], ['station', 'Station'], ['liters', 'Liters'], ['total_cost', 'Cost']], fields: [['vehicle_id', 'Vehicle ID'], ['driver_id', 'Driver ID'], ['log_date', 'Date'], ['station', 'Station'], ['liters', 'Liters'], ['price_per_liter', 'Price per liter'], ['total_cost', 'Total cost'], ['odometer', 'Odometer']] },
  Payments: { endpoint: 'payments', title: 'Payment control', subtitle: 'Review driver settlements and move approved payments forward.', columns: [['id', 'ID'], ['driver_name', 'Driver'], ['period_start', 'Period'], ['net_pay', 'Net pay'], ['status', 'Status']], fields: [['driver_id', 'Driver ID'], ['period_start', 'Period start'], ['period_end', 'Period end'], ['net_pay', 'Net pay']] },
  Expenses: { endpoint: 'expenses', title: 'Expense control', subtitle: 'Track vehicle and driver expenses before approval and settlement.', columns: [['id', 'ID'], ['type', 'Type'], ['amount', 'Amount'], ['expense_date', 'Date'], ['approved', 'Approved']], fields: [['vehicle_id', 'Vehicle ID'], ['driver_id', 'Driver ID'], ['type', 'Expense type'], ['amount', 'Amount'], ['expense_date', 'Expense date'], ['receipt_url', 'Receipt URL'], ['approved', 'Approved']] },
}

function ManagementView({ module, token }) {
  const config = moduleConfig[module]
  const [records, setRecords] = useState([])
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadRecords = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API}/${config.endpoint}`, { headers: authHeaders(token) })
      if (!response.ok) throw new Error('Could not load data from the API.')
      setRecords(await response.json())
    } catch (requestError) {
      setError(`${requestError.message} Start the backend on port 4000 to use live controls.`)
    } finally { setLoading(false) }
  }, [config.endpoint, token])

  useEffect(() => { loadRecords() }, [loadRecords])

  async function createRecord(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`${API}/${config.endpoint}`, { method: 'POST', headers: authHeaders(token, true), body: JSON.stringify(form) })
      if (!response.ok) throw new Error('The record could not be created.')
      setForm({})
      await loadRecords()
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }

  async function handleQuickAction(recordId, nextStatus) {
    try {
      if (module === 'Trips') {
        const response = await fetch(`${API}/trips/${recordId}/status`, {
          method: 'PATCH',
          headers: authHeaders(token, true),
          body: JSON.stringify({ status: nextStatus })
        })
        if (!response.ok) throw new Error('Trip status could not be updated.')
      }

      if (module === 'Payments') {
        const response = await fetch(`${API}/payments/${recordId}`, {
          method: 'PATCH',
          headers: authHeaders(token, true),
          body: JSON.stringify({ status: nextStatus, paid_at: new Date().toISOString() })
        })
        if (!response.ok) throw new Error('Payment status could not be updated.')
      }

      await loadRecords()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const statusActions = {
    Trips: [
      { label: 'Planned', value: 'planned' },
      { label: 'Dispatch', value: 'in_transit' },
      { label: 'Delivered', value: 'delivered' }
    ],
    Payments: [
      { label: 'Approve', value: 'approved' },
      { label: 'Paid', value: 'paid' }
    ]
  }

  return <div className="content-wrap module-wrap">
    <section className="module-header"><div><p className="eyebrow">ADMINISTRATION / {module.toUpperCase()}</p><h1>{config.title}<span className="title-accent">.</span></h1><p className="lede">{config.subtitle}</p></div><button className="outline-button refresh-button" onClick={loadRecords}>↻ Refresh</button></section>
    <div className="module-layout">
      <section className="panel records-panel"><div className="panel-heading"><div><h2>{module} records</h2><p>{loading ? 'Loading live data...' : `${records.length} records returned`}</p></div></div>{error && <div className="api-error">{error}</div>}<div className="table-wrap module-table"><table><thead><tr>{config.columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{records.map((record) => <tr key={record.id}>{config.columns.map(([key]) => <td key={key}>{key === 'status' ? (() => {
        const statusText = String(record[key] || '—')
        const currentStatus = statusText.toLowerCase().replace(/\s+/g, '_')
        const actions = statusActions[module] || []
        return <div className="status-actions"><span className="status-pill blue"><i />{statusText}</span>{actions.filter((action) => action.value !== currentStatus).map((action) => <button className="mini-action" key={action.value} type="button" onClick={() => handleQuickAction(record.id, action.value)}>{action.label}</button>)}</div>
      })() : String(record[key] ?? '—')}</td>)}</tr>)}{!loading && records.length === 0 && <tr><td className="empty-cell" colSpan={config.columns.length}>No records found.</td></tr>}</tbody></table></div></section>
      <section className="panel form-panel"><div className="panel-heading"><div><h2>Add {module === 'Fleet' ? 'vehicle' : module.slice(0, -1).toLowerCase()}</h2><p>Save a new record to the operations database.</p></div></div><form onSubmit={createRecord}>{config.fields.map(([key, label]) => <label key={key}>{label}<input value={form[key] || ''} required={['name', 'plate', 'driver_id', 'vehicle_id'].includes(key)} type={key.includes('date') || key.includes('start') || key.includes('end') ? 'datetime-local' : 'text'} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}<button className="primary-button form-submit" disabled={saving}>{saving ? 'Saving...' : 'Save record'}</button></form></section>
    </div>
  </div>
}

function UserManagementView({ token }) {
  const [form, setForm] = useState({ role: 'driver' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function createUser(event) {
    event.preventDefault(); setSaving(true); setMessage(''); setError('')
    try {
      const response = await fetch(`${API}/users`, { method: 'POST', headers: authHeaders(token, true), body: JSON.stringify(form) })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'User could not be created.')
      setMessage(`${payload.name} account created. The driver can now log in on mobile.`)
      setForm({ role: 'driver' })
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }

  return <div className="content-wrap module-wrap"><section className="module-header"><div><p className="eyebrow">ADMINISTRATION / USERS</p><h1>Users & admins<span className="title-accent">.</span></h1><p className="lede">Create driver logins and administrator access from the laptop control center.</p></div></section><div className="module-layout"><section className="panel form-panel"><div className="panel-heading"><div><h2>Add account</h2><p>Give a driver their own secure login.</p></div></div>{message && <div className="success-message">{message}</div>}{error && <div className="api-error">{error}</div>}<form onSubmit={createUser}><label>Full name<input required value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input required type="email" value={form.email || ''} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Temporary password<input required minLength="8" type="password" value={form.password || ''} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="driver">Driver</option><option value="dispatcher">Dispatcher</option><option value="admin">Administrator</option></select></label><label>Driver ID (required for driver login)<input value={form.driver_id || ''} onChange={(event) => setForm({ ...form, driver_id: event.target.value })} placeholder="Example: 12" /></label><button className="primary-button form-submit" disabled={saving}>{saving ? 'Creating...' : 'Create account'}</button></form></section><section className="panel form-panel"><div className="panel-heading"><div><h2>How driver access works</h2><p>Simple operational handoff</p></div></div><div className="exception-list"><div className="exception-row"><span className="exception-icon blue">1</span><span><strong>Create driver record</strong><small>Add the driver first in Drivers and note their ID.</small></span></div><div className="exception-row"><span className="exception-icon green">2</span><span><strong>Create driver account</strong><small>Use the same Driver ID and give the driver their password.</small></span></div><div className="exception-row"><span className="exception-icon amber">3</span><span><strong>Driver uses mobile</strong><small>They see only their trips, earnings and delivery photo action.</small></span></div></div></section></div></div>
}

const normalizeTripTone = (status) => {
  if (status === 'Delivered') return 'green'
  if (status === 'In transit') return 'blue'
  return 'amber'
}

function ReportsView({ summary }) {
  return <div className="content-wrap module-wrap">
    <section className="module-header"><div><p className="eyebrow">OPERATIONS / REPORTS</p><h1>Operational intelligence<span className="title-accent">.</span></h1><p className="lede">Network, payment and exception coverage across the transport lifecycle.</p></div></section>
    <div className="dashboard-grid lower-grid">
      <article className="panel">
        <div className="panel-heading"><div><h2>Performance summary</h2><p>Today’s key metrics</p></div></div>
        <div className="metric-grid" style={{ marginTop: '20px' }}>
          <article className="metric-card"><div className="metric-top"><span className="metric-label">ON-TIME RATE</span><span className="metric-icon blue-bg">↗</span></div><div className="metric-value">{summary.network?.[0]?.value || '0.0%'}</div></article>
          <article className="metric-card"><div className="metric-top"><span className="metric-label">LOADS MOVED</span><span className="metric-icon green-bg">✓</span></div><div className="metric-value">{summary.network?.[1]?.value || '0'}</div></article>
          <article className="metric-card"><div className="metric-top"><span className="metric-label">KM COVERED</span><span className="metric-icon orange-bg">◒</span></div><div className="metric-value">{summary.network?.[2]?.value || '0'}</div></article>
          <article className="metric-card"><div className="metric-top"><span className="metric-label">REVENUE</span><span className="metric-icon purple-bg">◇</span></div><div className="metric-value">{summary.network?.[3]?.value || 'SAR 0'}</div></article>
        </div>
      </article>
      <article className="panel"><div className="panel-heading"><div><h2>Action board</h2><p>Priority decisions</p></div></div><div className="exception-list" style={{ marginTop: '18px' }}>{(summary.exceptions || []).slice(0, 4).map((item) => <div className="exception-row" key={item.title}><span className={`exception-icon ${item.severity || 'amber'}`}>!</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><button>{item.action || 'Review'}</button></div>)}</div></article>
    </div>
  </div>
}

function AuditLogView({ token }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadEntries = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`${API}/audit?limit=100`, { headers: authHeaders(token) })
      const payload = await response.json().catch(() => ([]))
      if (!response.ok) throw new Error(payload.error || 'Could not load audit logs.')
      setEntries(payload)
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [token])

  useEffect(() => { loadEntries() }, [loadEntries])
  return <div className="content-wrap module-wrap"><section className="module-header"><div><p className="eyebrow">OPERATIONS / AUDIT</p><h1>Audit log<span className="title-accent">.</span></h1><p className="lede">Review account, trip, fuel, delivery-proof and location activity.</p></div><button className="outline-button refresh-button" onClick={loadEntries}>↻ Refresh</button></section><section className="panel records-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>{loading ? 'Loading secure audit records...' : `${entries.length} records returned`}</p></div></div>{error && <div className="api-error">{error}</div>}<div className="table-wrap module-table"><table><thead><tr><th>TIME</th><th>ACTOR</th><th>ACTION</th><th>ENTITY</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}><td>{new Date(entry.created_at).toLocaleString()}</td><td>{entry.actor_name || 'System'}</td><td>{entry.action}</td><td>{entry.entity_type}{entry.entity_id ? ` #${entry.entity_id}` : ''}</td></tr>)}{!loading && !entries.length && <tr><td className="empty-cell" colSpan="4">No audit records found.</td></tr>}</tbody></table></div></section></div>
}

function SettingsView() {
  return <div className="content-wrap module-wrap">
    <section className="module-header"><div><p className="eyebrow">CONTROL / SETTINGS</p><h1>System preferences<span className="title-accent">.</span></h1><p className="lede">Configure team access, operational alerts and integrations.</p></div></section>
    <div className="dashboard-grid lower-grid">
      <article className="panel"><div className="panel-heading"><div><h2>Access & permissions</h2><p>Role-based controls</p></div></div><div className="exception-list" style={{ marginTop: '18px' }}><div className="exception-row"><span className="exception-icon blue">!</span><span><strong>Administrator</strong><small>Ahmed has full access to dispatch, fleet and settlement controls.</small></span><button>Active</button></div><div className="exception-row"><span className="exception-icon green">!</span><span><strong>Dispatch team</strong><small>Trip coordination and exception review permissions enabled.</small></span><button>Live</button></div><div className="exception-row"><span className="exception-icon amber">!</span><span><strong>Reports</strong><small>Executive KPIs and compliance snapshots shared to leadership.</small></span><button>Queued</button></div></div></article>
      <article className="panel"><div className="panel-heading"><div><h2>Operational settings</h2><p>Connected workflows</p></div></div><div className="vehicle-list" style={{ marginTop: '18px' }}><div className="vehicle-row"><span className="vehicle-icon blue">◉</span><span><strong>GPS feed</strong><small>Vehicle tracking</small></span><span className="vehicle-state"><b className="state-dot blue" />Online</span></div><div className="vehicle-row"><span className="vehicle-icon green">◉</span><span><strong>Alerts</strong><small>Late trip and fuel exceptions</small></span><span className="vehicle-state"><b className="state-dot green" />Enabled</span></div><div className="vehicle-row"><span className="vehicle-icon amber">◉</span><span><strong>Billing sync</strong><small>Payment approvals</small></span><span className="vehicle-state"><b className="state-dot amber" />Queued</span></div></div></article>
    </div>
  </div>
}

function LoginView({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn(event) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const response = await fetch(`${API}/auth/login`, { method: 'POST', headers: authHeaders(null, true), body: JSON.stringify({ email, password }) })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Sign-in failed.')
      if (!['admin', 'dispatcher'].includes(payload.user?.role)) throw new Error('This account does not have laptop control access.')
      onLogin(payload)
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }

  return <main className="main-content"><div className="content-wrap module-wrap"><section className="module-header"><div><p className="eyebrow">ARABMONOPOLY LOGISTICS</p><h1>Admin sign in<span className="title-accent">.</span></h1><p className="lede">Use your administrator account to control fleet operations.</p></div></section><section className="panel form-panel"><form onSubmit={signIn}><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <div className="api-error">{error}</div>}<button className="primary-button form-submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button></form></section></div></main>
}

function App() {
  const [view, setView] = useState('Overview')
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('arabmonopoly-admin-session')) } catch { return null }
  })
  const [summary, setSummary] = useState(defaultSummary)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState('')
  const [showQuickTripForm, setShowQuickTripForm] = useState(false)
  const [quickTripForm, setQuickTripForm] = useState({
    load_id: '',
    vehicle_id: '',
    driver_id: '',
    planned_start: '',
    planned_end: '',
    rate_per_trip: '1500',
    extra_earnings: '0'
  })
  const [quickTripState, setQuickTripState] = useState({ saving: false, error: '' })
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const currentUserName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Administrator'
  const currentUserInitials = currentUserName.slice(0, 2).toUpperCase()
  const greetingName = currentUserName.split(' ')[0]
  const greetingMessage = (() => {
    const hour = now.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  })()
  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const formattedTime = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  function handleLogin(nextSession) {
    setSession(nextSession)
    localStorage.setItem('arabmonopoly-admin-session', JSON.stringify(nextSession))
  }

  function signOut() {
    setSession(null)
    localStorage.removeItem('arabmonopoly-admin-session')
  }

  async function handleQuickTripSubmit(event) {
    event.preventDefault()
    setQuickTripState({ saving: true, error: '' })

    try {
      const response = await fetch(`${API}/trips`, {
        method: 'POST',
        headers: authHeaders(session.token, true),
        body: JSON.stringify({
          ...quickTripForm,
          load_id: Number(quickTripForm.load_id),
          vehicle_id: Number(quickTripForm.vehicle_id),
          driver_id: Number(quickTripForm.driver_id),
          rate_per_trip: Number(quickTripForm.rate_per_trip || 0),
          extra_earnings: Number(quickTripForm.extra_earnings || 0),
        })
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Trip could not be created.')

      setShowQuickTripForm(false)
      setQuickTripForm({
        load_id: '',
        vehicle_id: '',
        driver_id: '',
        planned_start: '',
        planned_end: '',
        rate_per_trip: '1500',
        extra_earnings: '0'
      })
      await loadSummary()
    } catch (error) {
      setQuickTripState({ saving: false, error: error.message })
      return
    }

    setQuickTripState({ saving: false, error: '' })
  }

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true)
    setSummaryError('')
    try {
      const response = await fetch(`${API}/dashboard/summary`)
      if (!response.ok) throw new Error('Could not load dashboard summary.')
      const data = await response.json()
      setSummary(data)
    } catch (error) {
      setSummaryError(error.message)
      setSummary(defaultSummary)
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  const dispatchColumns = summary.dispatch
    ? [
        { title: 'Planned', tone: 'planned', count: String(summary.dispatch.planned?.length ?? 0), trips: summary.dispatch.planned ?? [] },
        { title: 'In transit', tone: 'transit', count: String(summary.dispatch.transit?.length ?? 0), trips: summary.dispatch.transit ?? [] },
        { title: 'Delivered', tone: 'delivered', count: String(summary.dispatch.delivered?.length ?? 0), trips: summary.dispatch.delivered ?? [] },
      ]
    : []

  const recentTrips = [...(summary.dispatch?.planned ?? []), ...(summary.dispatch?.transit ?? []), ...(summary.dispatch?.delivered ?? [])]
    .slice(0, 5)
    .map((trip) => ({
      id: trip.id,
      route: trip.route || 'General cargo',
      driver: trip.driver || 'Unassigned',
      vehicle: trip.vehicle || 'N/A',
      status: trip.status || 'Planned',
      tone: normalizeTripTone(trip.status),
      time: trip.time || 'Scheduled'
    }))

  const fleetPulse = (summary.driverTotals || []).slice(0, 3).map((driver, index) => ({
    plate: driver.name || `Driver ${index + 1}`,
    model: `${driver.totalTrips ?? 0} trips`,
    state: (driver.deliveredTrips ?? 0) > 0 ? 'On route' : 'Available',
    detail: `${driver.deliveredTrips ?? 0} delivered`,
    tone: index === 0 ? 'blue' : index === 1 ? 'green' : 'amber'
  }))

  const exceptions = summary.exceptions?.length ? summary.exceptions : [
    { title: 'Network health', detail: 'No operational exceptions detected right now.', severity: 'green', action: 'View' }
  ]

  if (!session?.token) return <LoginView onLogin={handleLogin} />

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">A</span><span>Arabmonopoly<span className="brand-dot"> Logistics</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-switcher"><span className="workspace-icon">A</span><span><strong>Arabmonopoly Logistics</strong><small>Operations team</small></span><span className="chevron">⌄</span></div>
        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map(([label, icon]) => <button onClick={() => setView(label)} className={`nav-item ${view === label ? 'active' : ''}`} key={label}><span className="nav-icon">{icon}</span>{label}{label === 'Payments' && <span className="nav-badge">3</span>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <button className="user-card" onClick={signOut}><span className="avatar">{currentUserInitials}</span><span><strong>{currentUserName}</strong><small>Sign out</small></span><span className="more">•••</span></button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><button className="mobile-menu" aria-label="Open menu">☰</button><div className="breadcrumbs"><span>Operations</span><b>/</b><strong>Overview</strong></div><div className="top-actions"><button className="icon-button" aria-label="Search">⌕</button><button className="icon-button notification" aria-label="Notifications">♢<i /></button><button className="help-button">?</button></div></header>
        {view === 'Overview' ? <div className="content-wrap">
          <section className="welcome-row"><div><p className="eyebrow">{formattedDate.toUpperCase()} · {formattedTime}</p><h1>{greetingMessage}, {greetingName}<span className="title-accent">.</span></h1><p className="lede">Here is what is happening across your fleet today.</p></div><button className="primary-button" onClick={() => setShowQuickTripForm(true)}><span>＋</span> Create trip</button></section>

          {showQuickTripForm && <div className="quick-trip-overlay" onClick={() => setShowQuickTripForm(false)}>
            <div className="quick-trip-modal" onClick={(event) => event.stopPropagation()}>
              <div className="panel-heading"><div><h2>Create trip</h2><p>Schedule a new load to the active fleet.</p></div><button className="text-button" type="button" onClick={() => setShowQuickTripForm(false)}>Close</button></div>
              <form className="quick-trip-form" onSubmit={handleQuickTripSubmit}>
                <label>Load ID<input required value={quickTripForm.load_id} onChange={(event) => setQuickTripForm({ ...quickTripForm, load_id: event.target.value })} /></label>
                <label>Vehicle ID<input required value={quickTripForm.vehicle_id} onChange={(event) => setQuickTripForm({ ...quickTripForm, vehicle_id: event.target.value })} /></label>
                <label>Driver ID<input required value={quickTripForm.driver_id} onChange={(event) => setQuickTripForm({ ...quickTripForm, driver_id: event.target.value })} /></label>
                <label>Planned start<input required type="datetime-local" value={quickTripForm.planned_start} onChange={(event) => setQuickTripForm({ ...quickTripForm, planned_start: event.target.value })} /></label>
                <label>Planned end<input required type="datetime-local" value={quickTripForm.planned_end} onChange={(event) => setQuickTripForm({ ...quickTripForm, planned_end: event.target.value })} /></label>
                <label>Trip rate<input required type="number" min="0" value={quickTripForm.rate_per_trip} onChange={(event) => setQuickTripForm({ ...quickTripForm, rate_per_trip: event.target.value })} /></label>
                <label>Extra earnings<input type="number" min="0" value={quickTripForm.extra_earnings} onChange={(event) => setQuickTripForm({ ...quickTripForm, extra_earnings: event.target.value })} /></label>
                {quickTripState.error && <div className="api-error" style={{ gridColumn: '1 / -1' }}>{quickTripState.error}</div>}
                <button className="primary-button form-submit" type="submit" disabled={quickTripState.saving}>{quickTripState.saving ? 'Creating...' : 'Save trip'}</button>
              </form>
            </div>
          </div>}

          <section className="metric-grid" aria-label="Today's overview">
            <article className="metric-card"><div className="metric-top"><span className="metric-label">ACTIVE TRIPS</span><span className="metric-icon blue-bg">↗</span></div><div className="metric-value">{summaryLoading ? '—' : summary.kpis?.activeTrips ?? 0}</div><div className="metric-foot"><span className="trend up">↗ 12.5%</span><span>vs yesterday</span></div></article>
            <article className="metric-card"><div className="metric-top"><span className="metric-label">DELIVERED TODAY</span><span className="metric-icon green-bg">✓</span></div><div className="metric-value">{summaryLoading ? '—' : summary.kpis?.deliveredToday ?? 0}</div><div className="metric-foot"><span className="trend up">↗ 8.2%</span><span>vs yesterday</span></div></article>
            <article className="metric-card"><div className="metric-top"><span className="metric-label">FLEET UTILIZATION</span><span className="metric-icon orange-bg">◒</span></div><div className="metric-value">{summaryLoading ? '—' : `${summary.kpis?.fleetUtilization ?? 0}`}<span className="metric-unit">%</span></div><div className="metric-foot"><span className="trend up">↗ 4.6%</span><span>vs last week</span></div></article>
            <article className="metric-card"><div className="metric-top"><span className="metric-label">PENDING PAYMENTS</span><span className="metric-icon purple-bg">◇</span></div><div className="metric-value">{summaryLoading ? '—' : `SAR ${(summary.kpis?.pendingPayments ?? 0).toLocaleString()}`}</div><div className="metric-foot"><span className="trend neutral">{summary.kpis?.lateTrips ?? 0} items</span><span>awaiting approval</span></div></article>
          </section>

          {summaryError && <div className="api-error" style={{ marginBottom: '16px' }}>{summaryError}</div>}

          <section className="command-grid">
            <article className="panel dispatch-panel"><div className="panel-heading"><div><h2>Dispatch board</h2><p>Live trip lifecycle across your operation</p></div><button className="text-button">Open dispatch <span>→</span></button></div><div className="dispatch-board">{dispatchColumns.map((column) => <div className="dispatch-column" key={column.title}><div className="dispatch-column-head"><span className={`dispatch-dot ${column.tone}`} />{column.title}<strong>{column.count}</strong></div>{column.trips.length ? column.trips.map((trip) => <div className="dispatch-card" key={trip.id}><div><strong>{trip.id}</strong><small>{trip.route}</small></div><span><b>{trip.driver}</b><small>{trip.time}</small></span></div>) : <div className="dispatch-card empty-card"><div><strong>No trips</strong><small>Queue is clear</small></div><span><b>—</b><small>waiting</small></span></div>}</div>)}</div></article>
            <article className="panel exceptions-panel"><div className="panel-heading"><div><h2>Exception queue</h2><p>Items that need your attention</p></div><span className="exception-count">{exceptions.length}</span></div><div className="exception-list">{exceptions.map(({ title, detail, severity, action }) => <div className="exception-row" key={title}><span className={`exception-icon ${severity}`}>!</span><span><strong>{title}</strong><small>{detail}</small></span><button>{action}</button></div>)}</div></article>
          </section>

          <section className="network-strip panel"><div className="network-heading"><h2>Network snapshot</h2><p>Performance across active lanes today</p></div>{(summary.network && summary.network.length ? summary.network : []).map((stat, index) => <div className="network-stat" key={stat.label || index}><strong>{stat.value}</strong><span>{stat.label}</span><div className="mini-progress"><i style={{ width: `${Math.min(100, Number(stat.progress) || 0)}%` }} /></div></div>)}</section>

          <section className="panel table-panel"><div className="panel-heading"><div><h2>Driver totals</h2><p>Every driver's trips, deliveries and earnings</p></div></div><div className="table-wrap"><table><thead><tr><th>DRIVER</th><th>TOTAL TRIPS</th><th>DELIVERED</th><th>EARNINGS</th></tr></thead><tbody>{(summary.driverTotals || []).map((driver) => <tr key={driver.driverId}><td><strong>{driver.name}</strong></td><td>{driver.totalTrips}</td><td>{driver.deliveredTrips}</td><td>SAR {Number(driver.totalEarnings || 0).toLocaleString()}</td></tr>)}{!(summary.driverTotals || []).length && <tr><td className="empty-cell" colSpan="4">No driver activity yet.</td></tr>}</tbody></table></div></section>

          <section className="dashboard-grid">
            <article className="panel activity-panel"><div className="panel-heading"><div><h2>Trip activity</h2><p>Live view of today's operations</p></div><button className="text-button">View all <span>→</span></button></div><div className="activity-chart"><div className="chart-y"><span>30</span><span>20</span><span>10</span><span>0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 650 165" preserveAspectRatio="none" aria-label="Trip activity chart"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2775e8" stopOpacity=".22" /><stop offset="1" stopColor="#2775e8" stopOpacity="0" /></linearGradient></defs><path className="chart-fill" d="M0,132 C42,126 56,104 92,110 S140,94 174,100 S224,75 260,83 S308,62 345,72 S392,46 430,57 S478,31 516,44 S562,20 604,30 S632,13 650,17 L650,165 L0,165Z" /><path className="chart-line" d="M0,132 C42,126 56,104 92,110 S140,94 174,100 S224,75 260,83 S308,62 345,72 S392,46 430,57 S478,31 516,44 S562,20 604,30 S632,13 650,17" /></svg><div className="chart-x"><span>6 AM</span><span>9 AM</span><span>12 PM</span><span>3 PM</span><span>6 PM</span><span>Now</span></div></div></div></article>
            <article className="panel status-panel"><div className="panel-heading"><div><h2>Fleet status</h2><p>32 vehicles in your fleet</p></div><button className="icon-button">•••</button></div><div className="donut-wrap"><div className="donut"><div><strong>82%</strong><span>utilized</span></div></div><div className="legend"><div><i className="dot blue-dot" /><span>On route</span><strong>24</strong></div><div><i className="dot green-dot" /><span>Available</span><strong>5</strong></div><div><i className="dot gray-dot" /><span>Maintenance</span><strong>3</strong></div></div></div><button className="outline-button">Manage fleet <span>→</span></button></article>
          </section>

          <section className="dashboard-grid lower-grid"><article className="panel table-panel"><div className="panel-heading"><div><h2>Recent trips</h2><p>Latest movement across your network</p></div><button className="filter-button">All trips <span>⌄</span></button></div><div className="table-wrap"><table><thead><tr><th>TRIP ID</th><th>ROUTE</th><th>DRIVER</th><th>STATUS</th><th>TIME</th></tr></thead><tbody>{recentTrips.map((trip) => <tr key={trip.id}><td><strong>{trip.id}</strong><small>{trip.vehicle}</small></td><td>{trip.route}</td><td>{trip.driver}</td><td><span className={`status-pill ${trip.tone}`}><i />{trip.status}</span></td><td className="time-cell">{trip.time}</td></tr>)}{!recentTrips.length && <tr><td className="empty-cell" colSpan="5">No recent trip activity.</td></tr>}</tbody></table></div></article><article className="panel vehicles-panel"><div className="panel-heading"><div><h2>Fleet pulse</h2><p>Drivers and activity levels</p></div><button className="text-button">View fleet <span>→</span></button></div><div className="vehicle-list">{fleetPulse.map((driver) => <div className="vehicle-row" key={driver.plate}><span className={`vehicle-icon ${driver.tone}`}>▣</span><span><strong>{driver.plate}</strong><small>{driver.model}</small></span><span className="vehicle-state"><b className={`state-dot ${driver.tone}`} />{driver.state}<small>{driver.detail}</small></span></div>)}{!fleetPulse.length && <div className="vehicle-row"><span className="vehicle-icon amber">▣</span><span><strong>No activity</strong><small>Awaiting drivers</small></span><span className="vehicle-state"><b className="state-dot amber" />Available<small>0 delivered</small></span></div>}</div></article></section>
          <footer className="footer"><span>© 2026 Arabmonopoly Logistics</span><span>System status <i className="online-dot" /> All systems operational</span></footer>
        </div> : view === 'Reports' ? <ReportsView summary={summary} /> : view === 'Settings' ? <SettingsView /> : view === 'Audit' ? <AuditLogView token={session.token} /> : view === 'Users' ? <UserManagementView token={session.token} /> : <ManagementView module={view} token={session.token} />}
      </main>
    </div>
  )
}

export default App

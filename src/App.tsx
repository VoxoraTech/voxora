import { useMemo, useState } from 'react'
import { Activity, ArrowDownLeft, ArrowUpRight, AudioLines, Bell, ChevronDown, CircleHelp, CreditCard, Gauge, Headphones, LayoutDashboard, Menu, Phone, Plus, RadioTower, Settings, ShieldCheck, Wallet, X, Zap } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { callFunction, supabase } from './lib'

type Currency = 'NGN' | 'USD'
const chartData = [
  { day: 'Mon', minutes: 42 }, { day: 'Tue', minutes: 58 }, { day: 'Wed', minutes: 45 },
  { day: 'Thu', minutes: 76 }, { day: 'Fri', minutes: 63 }, { day: 'Sat', minutes: 91 }, { day: 'Sun', minutes: 72 }
]
const nav = [
  { label: 'Overview', icon: LayoutDashboard }, { label: 'Calls', icon: Phone },
  { label: 'Phone numbers', icon: RadioTower }, { label: 'Wallet & billing', icon: Wallet },
  { label: 'Transactions', icon: CreditCard }, { label: 'Providers', icon: AudioLines },
  { label: 'Settings', icon: Settings }
]
const money = (amount: number, currency: Currency) => new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', { style: 'currency', currency, maximumFractionDigits: currency === 'NGN' ? 0 : 2 }).format(amount)

export default function App() {
  const [currency, setCurrency] = useState<Currency>('NGN')
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('Demo workspace · Connect Supabase and provider credentials to enable live data.')
  const [loading, setLoading] = useState('')
  const [providerStatus, setProviderStatus] = useState<Record<string,string>>({ Twilio: 'Not configured', Telnyx: 'Not configured' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const [sessionEmail, setSessionEmail] = useState('')
  const [topup, setTopup] = useState('5000')
  const isConnected = Boolean(supabase)

  const balance = currency === 'NGN' ? 125000 : 85.50
  const recent = useMemo(() => [
    { title: 'Wallet funding', sub: 'Paystack · Demo transaction', amount: currency === 'NGN' ? '+₦25,000' : '+$25.00', positive: true, date: 'Today, 10:42 AM' },
    { title: 'Outbound call', sub: 'Telnyx · Demo record', amount: currency === 'NGN' ? '−₦1,250' : '−$0.85', positive: false, date: 'Yesterday, 4:18 PM' },
    { title: 'Outbound call', sub: 'Twilio · Demo record', amount: currency === 'NGN' ? '−₦840' : '−$0.57', positive: false, date: 'Yesterday, 1:06 PM' }
  ], [currency])

  async function signIn() {
    if (!supabase) { setNotice('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment, then restart.'); return }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setNotice(error.message); return }
    setSessionEmail(data.user?.email || '')
    setShowAuth(false)
    setNotice('Signed in. Account data is still subject to your Supabase policies.')
  }
  async function checkProvider(provider: 'twilio'|'telnyx') {
    setLoading(provider)
    try {
      const result = await callFunction<{status:string; message?:string}>(`${provider}-status`)
      setProviderStatus(s => ({ ...s, [provider === 'twilio' ? 'Twilio' : 'Telnyx']: result.status }))
      setNotice(result.message || `${provider} status checked.`)
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Provider check failed.') }
    finally { setLoading('') }
  }
  async function startTopup() {
    setLoading('paystack')
    try {
      const result = await callFunction<{authorization_url:string}>('paystack-initialize', { amount: Number(topup), currency })
      if (result.authorization_url) window.location.href = result.authorization_url
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Payment initialization failed.') }
    finally { setLoading('') }
  }

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><AudioLines size={22}/></div><div><strong>voxora</strong><small>VOICE PLATFORM</small></div><button className="mobile-close" onClick={() => setMenuOpen(false)}><X/></button></div>
      <div className="workspace"><span className="workspace-dot"/> Personal workspace <ChevronDown size={14}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.label} className={`nav-item ${active === item.label ? 'selected' : ''}`} onClick={() => { setActive(item.label); setMenuOpen(false) }}><item.icon size={18}/><span>{item.label}</span>{item.label === 'Calls' && <i>3</i>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><strong>Need a hand?</strong><p>Explore setup guides and get your workspace ready.</p><a href="#setup">View setup guide ↗</a></div><div className="profile"><div className="avatar">VX</div><div className="profile-text"><strong>{sessionEmail || 'Voxora workspace'}</strong><small>{sessionEmail ? 'Signed in' : 'Demo account'}</small></div><button title="Account options" onClick={() => setShowAuth(true)}><ChevronDown size={16}/></button></div></div>
    </aside>
    {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)}/>}
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMenuOpen(true)}><Menu/></button><div className="breadcrumbs">Workspace <span>/</span> <b>{active}</b></div><div className="top-actions"><div className="live-pill"><span/> System overview</div><button className="icon-button" title="Notifications"><Bell size={18}/><i/></button><button className="user-chip" onClick={() => setShowAuth(true)}><span className="avatar small">VX</span><span>{sessionEmail ? 'Account' : 'Sign in'}</span><ChevronDown size={14}/></button></div></header>
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow"><Zap size={13}/> YOUR COMMUNICATIONS, CONNECTED</div><h1>{active === 'Overview' ? 'Good to see you.' : active}</h1><p>Here’s what’s happening across your Voxora workspace.</p></div><div className="welcome-actions"><select value={currency} onChange={e => setCurrency(e.target.value as Currency)} aria-label="Display currency"><option value="NGN">🇳🇬 NGN · Naira</option><option value="USD">🇺🇸 USD · US Dollar</option></select><button className="primary" onClick={() => setNotice('Calling requires a configured voice provider, verified caller ID and server-side call authorization.')}><Phone size={16}/> Start a call</button></div></div>
        {notice && <div className="notice"><ShieldCheck size={16}/><span>{notice}</span><button onClick={() => setNotice('')}><X size={15}/></button></div>}
        {active === 'Overview' ? <>
          <div className="stats-grid">
            <div className="stat-card balance-card"><div className="stat-top"><span>Available wallet balance</span><Wallet size={18}/></div><div className="stat-value">{money(balance,currency)}</div><div className="stat-foot"><span className="positive"><ArrowUpRight size={14}/> 8.4%</span> <span>vs. last month</span></div><div className="balance-glow"/></div>
            <div className="stat-card"><div className="stat-top"><span>Total call minutes</span><Phone size={18}/></div><div className="stat-value">1,284 <small>min</small></div><div className="stat-foot"><span className="positive"><ArrowUpRight size={14}/> 12.6%</span> <span>vs. last month</span></div></div>
            <div className="stat-card"><div className="stat-top"><span>Active phone numbers</span><RadioTower size={18}/></div><div className="stat-value">04</div><div className="stat-foot"><span className="muted-dot"/> All numbers operational</div></div>
            <div className="stat-card"><div className="stat-top"><span>Call completion</span><Activity size={18}/></div><div className="stat-value">98.2<small>%</small></div><div className="stat-foot"><span className="positive"><ArrowUpRight size={14}/> 2.1%</span> <span>vs. last month</span></div></div>
          </div>
          <div className="dashboard-grid"><section className="panel usage-panel"><div className="panel-heading"><div><h2>Call activity</h2><p>Your voice usage over the last 7 days</p></div><button className="subtle-button">Last 7 days <ChevronDown size={14}/></button></div><div className="chart-legend"><span/> Call minutes</div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:10,right:8,left:-22,bottom:0}}><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7568ff" stopOpacity={.28}/><stop offset="100%" stopColor="#7568ff" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#202b40" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize:12}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize:12}}/><Tooltip contentStyle={{background:'#111b2e',border:'1px solid #2a3850',borderRadius:10,color:'#fff'}}/><Area type="monotone" dataKey="minutes" stroke="#8275ff" strokeWidth={2.5} fill="url(#fill)"/></AreaChart></ResponsiveContainer></div></section>
            <section className="panel providers-panel"><div className="panel-heading"><div><h2>Voice providers</h2><p>Integration health at a glance</p></div><button className="dots">•••</button></div>{(['Twilio','Telnyx'] as const).map((p,i)=><div className="provider-row" key={p}><div className={`provider-logo ${i===0?'twilio':'telnyx'}`}>{i===0?'T':'t'}</div><div className="provider-info"><strong>{p}</strong><small>{providerStatus[p]}</small></div><span className="status-dot idle"/><button className="check-link" disabled={loading === p.toLowerCase()} onClick={() => checkProvider(p.toLowerCase() as 'twilio'|'telnyx')}>{loading === p.toLowerCase() ? 'Checking…' : 'Check'}</button></div>)}<div className="provider-hint"><ShieldCheck size={15}/> Credentials are stored server-side in Netlify.</div></section></div>
          <section className="panel transactions-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Your latest wallet and calling transactions</p></div><button className="text-button" onClick={() => setActive('Transactions')}>View all <ArrowUpRight size={14}/></button></div><div className="transaction-list">{recent.map((r,i)=><div className="transaction" key={i}><div className={`transaction-icon ${r.positive?'in':'out'}`}>{r.positive?<ArrowDownLeft size={17}/>:<ArrowUpRight size={17}/>}</div><div className="transaction-title"><strong>{r.title}</strong><small>{r.sub}</small></div><div className={`transaction-amount ${r.positive?'positive':''}`}>{r.amount}</div><div className="transaction-date">{r.date}</div><span className="completed">Demo</span></div>)}</div></section>
          <section className="setup-section" id="setup"><div><div className="eyebrow">NEXT STEPS</div><h2>Make Voxora yours.</h2><p>Connect your services to move from demo workspace to live operations.</p></div><div className="setup-steps"><div><span>01</span><b>Connect Supabase</b><small>Authentication and database</small></div><div><span>02</span><b>Add provider keys</b><small>Twilio and Telnyx credentials</small></div><div><span>03</span><b>Configure Paystack</b><small>Start in test mode</small></div></div></section>
        </> : <section className="panel placeholder-panel"><div className="placeholder-icon"><Headphones size={25}/></div><h2>{active}</h2><p>This section is scaffolded for the next implementation phase. Connect Supabase and configure the required provider services to enable live records and actions.</p><button className="primary" onClick={() => setNotice(`${active} is not enabled in this starter build yet. See README for setup and implementation notes.`)}>View configuration status</button></section>}
        <footer><span>© 2025 Voxora Technologies</span><span><i/> All systems monitored · Demo data</span><a href="#setup">Help & documentation</a></footer>
      </div>
    </main>
    {showAuth && <div className="modal-backdrop" onClick={() => setShowAuth(false)}><div className="auth-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowAuth(false)}><X size={18}/></button><div className="brand-mark"><AudioLines size={22}/></div><h2>Welcome to Voxora</h2><p>Sign in with your Supabase account.</p><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"/></label><button className="primary full" onClick={signIn}>Sign in</button><small>Authentication requires your Supabase project configuration.</small></div></div>}
  </div>
}

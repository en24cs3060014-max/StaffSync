import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarCheck2, CalendarClock, CheckCircle2, Clock3, Plus, Users, UsersRound, Megaphone, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../App';

const shortDate = value => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ employees: 0, pendingLeaves: 0, presentToday: 0, announcements: 0, trainings: 0 });
  const [leaves, setLeaves] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function load() {
    try {
      const [s, l, a, att] = await Promise.all([
        api.get('/summary'), api.get('/leaves'), api.get('/announcements'), api.get('/attendance/mine')
      ]);
      setSummary(s.data); setLeaves(l.data.slice(0, 4)); setAnnouncements(a.data.slice(0, 3)); setAttendance(att.data);
    } catch (e) { setMessage(e.response?.data?.message || 'Could not load dashboard data.'); }
  }
  useEffect(() => { load(); }, []);
  async function mark(action) {
    setBusy(true); setMessage('');
    try { await api.post(`/attendance/${action}`); setMessage(action === 'check-in' ? 'You are checked in. Have a productive day!' : 'You are checked out for today.'); await load(); }
    catch (e) { setMessage(e.response?.data?.message || 'Attendance update failed.'); }
    finally { setBusy(false); }
  }
  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = attendance.find(item => item.dateKey === today);
  const roleLabel = { hr: 'HR administrator', manager: 'Team manager', employee: 'Team member' }[user.role] || user.role;
  return <div className="dashboard-page">
    <div className="page-heading"><div><div className="eyebrow muted-eyebrow">MONDAY MOTIVATION, EVERY DAY</div><h1>Good to see you, {user.name.split(' ')[0]} <span className="wave">✳</span></h1><p>Here’s what’s happening across your workspace today.</p></div><div className="heading-actions"><div className="date-chip"><CalendarCheck2 size={16} /> {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>{user.role === 'hr' && <button className="primary-button" onClick={() => navigate('/announcements')}><Plus size={16} /> New announcement</button>}</div></div>
    {message && <div className={message.includes('failed') || message.includes('Could not') || message.includes('already') ? 'notice notice-error' : 'notice'}>{message}<button onClick={() => setMessage('')}>×</button></div>}
    <section className="welcome-banner"><div className="welcome-copy"><span className="welcome-label">YOUR PEOPLE, AT A GLANCE</span><h2>Better work happens<br />when people <em>feel in sync.</em></h2><p>Keep your day on track. Your team’s latest updates are all in one place.</p><button className="banner-button" onClick={() => navigate('/profile')}>View my profile <ArrowRight size={15} /></button></div><div className="welcome-art" aria-hidden="true"><div className="art-orbit orbit-a" /><div className="art-orbit orbit-b" /><div className="art-circle"><UsersRound size={56} strokeWidth={1.2} /></div><div className="art-card art-card-one"><span className="art-card-icon"><CheckCircle2 size={16} /></span><span><b>Team connected</b><small>Everything in one place</small></span></div><div className="art-card art-card-two"><span className="art-mini-avatar">S</span><span><b>Good things grow</b><small>One team, one goal</small></span></div></div></section>
    <div className="section-heading"><div><h2>Workspace overview</h2><p>A quick snapshot of your people operations</p></div><span className="live-indicator"><span /> LIVE SUMMARY</span></div>
    <section className="stats-grid">
      <StatCard icon={Users} label="Total employees" value={summary.employees} note="Across your workspace" tone="blue" />
      <StatCard icon={CalendarCheck2} label="Present today" value={summary.presentToday} note="Checked in today" tone="green" />
      <StatCard icon={CalendarClock} label="Pending leave" value={summary.pendingLeaves} note="Awaiting review" tone="orange" />
      <StatCard icon={Megaphone} label="Announcements" value={summary.announcements} note="Company updates" tone="purple" />
    </section>
    <div className="dashboard-columns">
      <section className="panel leave-panel"><div className="panel-heading"><div><h3>Leave requests</h3><p>{['hr','manager'].includes(user.role) ? 'The latest requests from your team' : 'Keep an eye on your time off'}</p></div><button className="text-action" onClick={() => navigate('/leaves')}>View all <ArrowRight size={15} /></button></div>
        {leaves.length ? <div className="leave-list">{leaves.map(item => <div className="leave-row" key={item._id}><div className="leave-avatar">{(item.user?.name || user.name).split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}</div><div className="leave-person"><strong>{item.user?.name || user.name}</strong><span>{item.type} leave · {shortDate(item.startDate)} – {shortDate(item.endDate)}</span></div><Status value={item.status} /><button className="row-arrow" onClick={() => navigate('/leaves')} aria-label="View leave request"><ArrowRight size={15} /></button></div>)}</div> : <Empty text="No leave requests yet." />}
      </section>
      <section className="panel attendance-panel"><div className="panel-heading"><div><h3>Today’s attendance</h3><p>Make your workday official</p></div><div className="mini-icon green"><Clock3 size={17} /></div></div><div className="attendance-time"><span>LOCAL DATE</span><strong>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong><small>{todayRecord?.checkIn ? `Checked in at ${new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'You have not checked in yet'}</small></div><div className="attendance-actions"><button className="primary-button" disabled={busy || !!todayRecord} onClick={() => mark('check-in')}>{todayRecord ? 'Checked in' : 'Check in'} <ArrowUpRight size={16} /></button><button className="secondary-button" disabled={busy || !todayRecord || !!todayRecord.checkOut} onClick={() => mark('check-out')}>{todayRecord?.checkOut ? 'Checked out' : 'Check out'} <ArrowDownRight size={16} /></button></div><div className="attendance-foot"><span className="status-dot" /> {todayRecord?.checkOut ? 'Your day is complete' : todayRecord ? 'You’re on the clock' : 'Ready when you are'}</div></section>
    </div>
    <div className="dashboard-columns lower-columns">
      <section className="panel"><div className="panel-heading"><div><h3>Latest announcements</h3><p>News and updates from your team</p></div><button className="text-action" onClick={() => navigate('/announcements')}>See all <ArrowRight size={15} /></button></div>
        {announcements.length ? <div className="announcement-list">{announcements.map(a => <div className="announcement-item" key={a._id}><div className="announcement-icon"><Megaphone size={17} /></div><div><strong>{a.title}</strong><p>{a.body}</p><span>{a.author?.name || 'StaffSync'} · {shortDate(a.createdAt)}</span></div></div>)}</div> : <Empty text="No announcements published yet." />}
      </section>
      <section className="panel quick-panel"><div className="panel-heading"><div><h3>Quick access</h3><p>Jump back into your work</p></div></div><div className="quick-links">
        <QuickLink icon={Users} title="People directory" detail="Meet your teammates" onClick={() => navigate('/employees')} />
        <QuickLink icon={CalendarClock} title="Request time off" detail="Plan your next break" onClick={() => navigate('/leaves')} />
        <QuickLink icon={GraduationCap} title="Learning & growth" detail={`${summary.trainings} training programs`} onClick={() => navigate('/trainings')} />
      </div></section>
    </div>
    <div className="dashboard-bottom-note"><span><CheckCircle2 size={15} /> Signed in as {roleLabel}</span><span>Small steps. Better workdays.</span></div>
  </div>;
}
function StatCard({ icon: Icon, label, value, note, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19} strokeWidth={1.8} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}
function Status({ value }) { return <span className={`status-pill ${value}`}>{value}</span>; }
function Empty({ text }) { return <div className="empty-state">{text}</div>; }
function QuickLink({ icon: Icon, title, detail, onClick }) { return <button className="quick-link" onClick={onClick}><span className="quick-link-icon"><Icon size={17} /></span><span><strong>{title}</strong><small>{detail}</small></span><ArrowRight size={15} className="quick-arrow" /></button>; }

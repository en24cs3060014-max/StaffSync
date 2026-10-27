import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Check, CheckCircle2, Clock3, Plus, Search, Send, UserRound, Users, X } from 'lucide-react';
import api from '../api';
import { useAuth } from '../App';

const date = d => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const dateTime = d => d ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const titles = { employees: ['People directory', 'Meet the people who make your organization work.'], attendance: ['Attendance', 'A clear view of workdays, check-ins, and check-outs.'], leaves: ['Leave management', 'Plan time away and keep requests moving.'], announcements: ['Announcements', 'A shared space for company news and updates.'], trainings: ['Learning & development', 'Build skills and grow together as a team.'], profile: ['My profile', 'Keep your personal and work details up to date.'] };

export default function Workspace({ type }) {
  const { user, setUser } = useAuth();
  const [data, setData] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ type: 'Annual', startDate: '', endDate: '', reason: '', title: '', body: '', description: '', date: '', duration: '1 hour', reviewNote: '', name: user.name, department: user.department || '', jobTitle: user.jobTitle || '', phone: user.phone || '' });

  async function load() {
    setError('');
    try {
      if (type === 'employees') { const r = await api.get('/employees'); setData(r.data); }
      if (type === 'attendance') {
        const endpoint = ['hr','manager'].includes(user.role) ? '/attendance' : '/attendance/mine';
        const r = await api.get(endpoint); setAttendance(r.data);
      }
      if (type === 'leaves') { const r = await api.get('/leaves'); setData(r.data); }
      if (type === 'announcements') { const r = await api.get('/announcements'); setData(r.data); }
      if (type === 'trainings') { const r = await api.get('/trainings'); setData(r.data); }
    } catch (e) { setError(e.response?.data?.message || 'Could not load this section.'); }
  }
  useEffect(() => { load(); }, [type]);
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function action(fn) {
    setBusy(true); setError(''); setSuccess('');
    try { await fn(); setSuccess('Changes saved successfully.'); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }
  async function submitLeave(e) {
    e.preventDefault();
    await action(async () => { await api.post('/leaves', { type: form.type, startDate: form.startDate, endDate: form.endDate, reason: form.reason }); setForm({ ...form, startDate: '', endDate: '', reason: '' }); });
  }
  async function reviewLeave(id, status) {
    await action(async () => { await api.patch(`/leaves/${id}/review`, { status, reviewNote: form.reviewNote }); });
  }
  async function submitAnnouncement(e) {
    e.preventDefault();
    await action(async () => { await api.post('/announcements', { title: form.title, body: form.body }); setForm({ ...form, title: '', body: '' }); });
  }
  async function submitTraining(e) {
    e.preventDefault();
    await action(async () => { await api.post('/trainings', { title: form.title, description: form.description, date: form.date, duration: form.duration }); setForm({ ...form, title: '', description: '', date: '' }); });
  }
  async function saveProfile(e) {
    e.preventDefault();
    await action(async () => { const { data } = await api.patch('/profile', { name: form.name, department: form.department, jobTitle: form.jobTitle, phone: form.phone }); setUser(data.user); });
  }
  const canReview = ['hr','manager'].includes(user.role);
  const canPost = user.role === 'hr';
  const canCreateTraining = ['hr','manager'].includes(user.role);
  const filtered = data.filter(item => {
    const haystack = type === 'employees' ? `${item.name} ${item.email} ${item.department} ${item.jobTitle}` :
      type === 'leaves' ? `${item.user?.name} ${item.type} ${item.status} ${item.reason}` :
      type === 'announcements' ? `${item.title} ${item.body}` : `${item.title} ${item.description}`;
    return haystack.toLowerCase().includes(query.toLowerCase());
  });
  const [title, subtitle] = titles[type];
  return <div className="workspace-page">
    <div className="page-heading"><div><div className="eyebrow muted-eyebrow">PEOPLE OPERATIONS</div><h1>{title}</h1><p>{subtitle}</p></div><div className="heading-actions"><div className="date-chip"><CalendarDays size={16} /> {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div></div></div>
    {error && <div className="notice notice-error">{error}<button onClick={() => setError('')}>×</button></div>}
    {success && <div className="notice">{success}<button onClick={() => setSuccess('')}>×</button></div>}
    {type === 'employees' && <section className="panel workspace-panel"><div className="panel-heading"><div><h3>All team members</h3><p>{data.length} people in your workspace</p></div><div className="search-box"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people…" /></div></div>
      <div className="table-responsive"><table className="staff-table"><thead><tr><th>TEAM MEMBER</th><th>DEPARTMENT</th><th>JOB TITLE</th><th>ACCESS ROLE</th></tr></thead><tbody>{filtered.map(person => <tr key={person.id}><td><div className="table-person"><div className="table-avatar">{person.name.slice(0,1).toUpperCase()}</div><div><strong>{person.name}</strong><span>{person.email}</span></div></div></td><td>{person.department || 'General'}</td><td>{person.jobTitle || 'Team Member'}</td><td><span className={`role-pill ${person.role}`}>{person.role}</span></td></tr>)}</tbody></table>{!filtered.length && <div className="empty-state">No team members match your search.</div>}</div></section>}

    {type === 'attendance' && <section className="panel workspace-panel"><div className="panel-heading"><div><h3>{canReview ? 'Attendance records' : 'My attendance history'}</h3><p>{attendance.length} recent records</p></div><div className="search-box"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search records…" /></div></div><div className="table-responsive"><table className="staff-table"><thead><tr>{canReview && <th>TEAM MEMBER</th>}<th>DATE</th><th>CHECK IN</th><th>CHECK OUT</th><th>STATUS</th></tr></thead><tbody>{attendance.filter(a => `${a.user?.name || user.name} ${a.dateKey}`.toLowerCase().includes(query.toLowerCase())).map(a => <tr key={a._id}>{canReview && <td><div className="table-person"><div className="table-avatar">{a.user?.name?.slice(0,1) || '?'}</div><div><strong>{a.user?.name || 'Team member'}</strong><span>{a.user?.email}</span></div></div></td>}<td>{a.dateKey}</td><td>{dateTime(a.checkIn)}</td><td>{dateTime(a.checkOut)}</td><td><span className="status-pill approved">{a.checkOut ? 'complete' : 'checked in'}</span></td></tr>)}</tbody></table>{!attendance.length && <div className="empty-state">No attendance records yet. Check in from your Overview.</div>}</div></section>}

    {type === 'leaves' && <div className="workspace-columns">
      <section className="panel workspace-panel"><div className="panel-heading"><div><h3>Leave requests</h3><p>{canReview ? 'Review requests from your organization' : 'Track the status of your time off'}</p></div><div className="search-box"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search leaves…" /></div></div>
        {filtered.length ? <div className="request-list">{filtered.map(item => <div className="request-card" key={item._id}><div className="request-top"><div className="request-avatar">{(item.user?.name || user.name).slice(0,1)}</div><div className="request-who"><strong>{item.user?.name || user.name}</strong><span>{item.user?.department || user.department}</span></div><span className={`status-pill ${item.status}`}>{item.status}</span></div><div className="request-details"><span><CalendarDays size={14} /> {date(item.startDate)} – {date(item.endDate)}</span><span><Clock3 size={14} /> {item.type} leave</span></div><p className="request-reason">{item.reason}</p>{item.reviewNote && <p className="review-note">Reviewer note: {item.reviewNote}</p>}{canReview && item.status === 'pending' && <div className="request-actions"><button className="approve-button" disabled={busy} onClick={() => reviewLeave(item._id, 'approved')}><Check size={15} /> Approve</button><button className="reject-button" disabled={busy} onClick={() => reviewLeave(item._id, 'rejected')}><X size={15} /> Decline</button></div>}</div>)}</div> : <div className="empty-state">No leave requests to show.</div>}
      </section>
      {!canReview && <section className="panel form-panel"><div className="panel-heading"><div><h3>Request time off</h3><p>Send a new request for review</p></div><div className="mini-icon orange"><CalendarDays size={17} /></div></div><form onSubmit={submitLeave} className="stack-form"><label className="field-label">Leave type<select name="type" value={form.type} onChange={update}><option>Annual</option><option>Sick</option><option>Personal</option><option>Other</option></select></label><div className="form-two-col"><label className="field-label">Start date<input type="date" name="startDate" value={form.startDate} onChange={update} required /></label><label className="field-label">End date<input type="date" name="endDate" min={form.startDate} value={form.endDate} onChange={update} required /></label></div><label className="field-label">Reason<textarea name="reason" value={form.reason} onChange={update} rows="4" placeholder="Briefly share the reason for your request…" required /></label><button className="primary-button full-button" disabled={busy}><Send size={15} /> Submit request</button></form></section>}
    </div>}

    {type === 'announcements' && <>{canPost && <section className="panel form-panel create-panel"><div className="panel-heading"><div><h3>Share an update</h3><p>Publish news for everyone in the workspace</p></div><div className="mini-icon purple"><Plus size={17} /></div></div><form onSubmit={submitAnnouncement} className="create-form"><label className="field-label">Announcement title<input name="title" value={form.title} onChange={update} placeholder="e.g. Company town hall next week" required /></label><label className="field-label">Message<textarea name="body" value={form.body} onChange={update} rows="3" placeholder="Write the details your team needs to know…" required /></label><button className="primary-button" disabled={busy}><Send size={15} /> Publish announcement</button></form></section>}
      <div className="content-grid">{filtered.map(a => <article className="panel content-card announcement-card" key={a._id}><div className="content-card-top"><div className="content-symbol purple"><span>↗</span></div><span className="content-date">{date(a.createdAt)}</span></div><h3>{a.title}</h3><p>{a.body}</p><div className="content-card-footer"><div className="table-avatar small-avatar">{(a.author?.name || 'S').slice(0,1)}</div><span>Posted by <strong>{a.author?.name || 'StaffSync'}</strong></span></div></article>)}{!filtered.length && <div className="panel empty-state">No announcements yet.</div>}</div></>}

    {type === 'trainings' && <>{canCreateTraining && <section className="panel form-panel create-panel"><div className="panel-heading"><div><h3>Add a training program</h3><p>Create a learning opportunity for your team</p></div><div className="mini-icon green"><Plus size={17} /></div></div><form onSubmit={submitTraining} className="create-form"><label className="field-label">Program title<input name="title" value={form.title} onChange={update} placeholder="e.g. Leadership essentials" required /></label><label className="field-label">Description<textarea name="description" value={form.description} onChange={update} rows="2" placeholder="What will participants learn?" required /></label><div className="form-two-col"><label className="field-label">Date<input type="date" name="date" value={form.date} onChange={update} required /></label><label className="field-label">Duration<input name="duration" value={form.duration} onChange={update} placeholder="e.g. 90 minutes" /></label></div><button className="primary-button" disabled={busy}><Plus size={15} /> Add training</button></form></section>}
      <div className="content-grid">{filtered.map(t => <article className="panel content-card training-card" key={t._id}><div className="content-card-top"><div className="content-symbol green"><GraduationCapIcon /></div><span className="content-date">{date(t.date)}</span></div><h3>{t.title}</h3><p>{t.description}</p><div className="training-meta"><span><Clock3 size={14} /> {t.duration || '1 hour'}</span><span><UserRound size={14} /> {t.createdBy?.name || 'StaffSync'}</span></div><div className="training-footer"><span className="training-tag">LEARNING & DEVELOPMENT</span><ArrowRight size={16} /></div></article>)}{!filtered.length && <div className="panel empty-state">No training programs published yet.</div>}</div></>}

    {type === 'profile' && <div className="profile-layout"><section className="panel profile-hero"><div className="profile-cover"><div className="profile-large-avatar">{user.name?.slice(0,1).toUpperCase()}</div></div><div className="profile-hero-content"><span className={`role-pill ${user.role}`}>{user.role}</span><h2>{user.name}</h2><p>{user.jobTitle || 'Team member'} · {user.department || 'General'}</p><div className="profile-detail"><span>Work email</span><strong>{user.email}</strong></div><div className="profile-detail"><span>Access level</span><strong>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</strong></div></div></section><section className="panel form-panel profile-edit"><div className="panel-heading"><div><h3>Personal information</h3><p>Update your details below</p></div><div className="mini-icon blue"><UserRound size={17} /></div></div><form onSubmit={saveProfile} className="stack-form"><label className="field-label">Full name<input name="name" value={form.name} onChange={update} required /></label><label className="field-label">Work email<input value={user.email} disabled /></label><div className="form-two-col"><label className="field-label">Department<input name="department" value={form.department} onChange={update} /></label><label className="field-label">Job title<input name="jobTitle" value={form.jobTitle} onChange={update} /></label></div><label className="field-label">Phone number<input name="phone" value={form.phone} onChange={update} placeholder="Add a contact number" /></label><button className="primary-button full-button" disabled={busy}>Save profile <ArrowRight size={16} /></button></form></section></div>}
  </div>;
}
function GraduationCapIcon() { return <span style={{ fontSize: 22 }}>✦</span>; }

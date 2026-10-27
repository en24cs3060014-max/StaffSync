import { useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Fingerprint, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../App';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: 'People & Culture', jobTitle: 'Team Member' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
      const { data } = await api.post(endpoint, payload);
      localStorage.setItem('staffsync_token', data.token); setUser(data.user); navigate('/');
    } catch (err) { setError(err.response?.data?.message || 'Could not connect to StaffSync. Is the backend running?'); }
    finally { setBusy(false); }
  }
  return <div className="login-layout">
    <section className="login-visual">
      <div className="login-brand"><div className="brand-mark">S</div><strong>StaffSync</strong></div>
      <div className="visual-content"><div className="eyebrow"><span /> THE PEOPLE PLATFORM</div><h1>Great work<br />starts with <em>people.</em></h1><p>One calm, connected space for your team to do their best work — together.</p>
        <div className="visual-stats"><div><strong>01</strong><span>People first</span></div><div><strong>02</strong><span>Work in sync</span></div><div><strong>03</strong><span>Grow together</span></div></div>
      </div>
      <div className="visual-decoration deco-one" /><div className="visual-decoration deco-two" />
      <div className="visual-footer"><span>© 2026 StaffSync</span><span>People, in sync.</span></div>
    </section>
    <section className="login-panel"><div className="login-form-wrap">
      <div className="mobile-login-brand"><div className="brand-mark">S</div><strong>StaffSync</strong></div>
      <div className="form-kicker">YOUR WORKSPACE AWAITS</div><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="form-subtitle">{mode === 'login' ? 'Enter your details to sign in to your workspace.' : 'Set up your employee account in just a moment.'}</p>
      <div className="auth-tabs"><button className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button><button className={mode === 'register' ? 'selected' : ''} onClick={() => { setMode('register'); setError(''); }}>Create account</button></div>
      <form onSubmit={submit}>
        {mode === 'register' && <label className="field-label">Full name<input name="name" value={form.name} onChange={update} placeholder="e.g. Jordan Lee" required autoComplete="name" /></label>}
        <label className="field-label">Work email<input type="email" name="email" value={form.email} onChange={update} placeholder="you@company.com" required autoComplete="email" /></label>
        <label className="field-label">Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={update} placeholder="At least 8 characters" required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        {mode === 'register' && <label className="field-label">Department<input name="department" value={form.department} onChange={update} placeholder="Department" /></label>}
        {error && <div className="form-error">{error}</div>}
        <button className="primary-button sign-in-button" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in to workspace' : 'Create account'} <ArrowRight size={17} /></button>
      </form>
      <div className="login-assurance"><Fingerprint size={17} /><span>Your information is protected with secure authentication.</span></div>
      <div className="demo-note"><UsersRound size={16} /><div><strong>Exploring the demo?</strong><p>Seed demo users from the README to try HR and manager features.</p></div></div>
      <div className="login-bottom"><span><CheckCircle2 size={14} /> Secure workspace</span><span>Need help? Contact your administrator</span></div>
    </div></section>
  </div>;
}

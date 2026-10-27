import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Bell, CalendarDays, CheckSquare, ChevronRight, CircleHelp, ClipboardList, GraduationCap, LayoutDashboard, LogOut, Menu, Megaphone, Settings, ShieldCheck, Users, X } from 'lucide-react';
import api from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /><p>Loading your workspace…</p></div>;
  return user ? children : <Navigate to="/login" replace />;
}

const navItems = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Employees', to: '/employees', icon: Users, roles: ['hr', 'manager'] },
  { label: 'Attendance', to: '/attendance', icon: CalendarDays },
  { label: 'Leave management', to: '/leaves', icon: ClipboardList },
  { label: 'Announcements', to: '/announcements', icon: Megaphone },
  { label: 'Training', to: '/trainings', icon: GraduationCap },
  { label: 'My profile', to: '/profile', icon: ShieldCheck }
];

function Shell({ children }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const activeItem = navItems.find(item => item.to === location.pathname);
  const items = navItems.filter(item => !item.roles || item.roles.includes(user.role));
  return <div className="app-shell">
    {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark">S</div><div><strong>StaffSync</strong><span>PEOPLE PLATFORM</span></div><button className="close-mobile" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{items.map(item => {
        const Icon = item.icon;
        return <button key={item.to} className={`nav-link-custom ${location.pathname === item.to ? 'active' : ''}`} onClick={() => { navigate(item.to); setMobileOpen(false); }}>
          <Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>{location.pathname === item.to && <ChevronRight size={15} className="nav-arrow" />}
        </button>;
      })}</nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><CircleHelp size={18} /></div><strong>Need a hand?</strong><p>Make the most of your workspace.</p><button onClick={() => window.alert('Tip: use the sidebar to explore each StaffSync module.')}>View quick guide <ChevronRight size={14} /></button></div>
        <button className="nav-link-custom" onClick={logout}><LogOut size={18} /><span>Sign out</span></button>
        <div className="sidebar-footer"><span className="status-dot" /> All systems operational <span className="version">v1.0</span></div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
        <div className="breadcrumb">Workspace <ChevronRight size={14} /> <strong>{activeItem?.label || 'Workspace'}</strong></div>
        <div className="topbar-right"><div className="top-date"><span className="date-dot" /> Workspace online</div><button className="icon-button" title="Notifications" onClick={() => navigate('/announcements')}><Bell size={18} /><span className="notification-dot" /></button><div className="top-divider" /><div className="user-mini"><div className="avatar">{user.name?.slice(0, 1).toUpperCase()}</div><div className="user-mini-copy"><strong>{user.name}</strong><span>{user.role}</span></div></div></div>
      </header>
      <div className="page-content">{children}</div>
      <footer className="app-footer"><span>© {new Date().getFullYear()} StaffSync, Inc.</span><span>Made for better workdays <span className="footer-heart">♥</span></span></footer>
    </main>
  </div>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('staffsync_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then(res => setUser(res.data.user)).catch(() => localStorage.removeItem('staffsync_token')).finally(() => setLoading(false));
  }, []);
  const logout = () => { localStorage.removeItem('staffsync_token'); setUser(null); };
  const authValue = { user, setUser, loading, logout };
  return <AuthContext.Provider value={authValue}>
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="*" element={<Protected><Shell><Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Workspace type="employees" />} />
        <Route path="/attendance" element={<Workspace type="attendance" />} />
        <Route path="/leaves" element={<Workspace type="leaves" />} />
        <Route path="/announcements" element={<Workspace type="announcements" />} />
        <Route path="/trainings" element={<Workspace type="trainings" />} />
        <Route path="/profile" element={<Workspace type="profile" />} />
        <Route path="*" element={<Dashboard />} />
      </Routes></Shell></Protected>} />
    </Routes>
  </AuthContext.Provider>;
}

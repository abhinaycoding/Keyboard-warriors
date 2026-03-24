import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WillBuilder from './pages/WillBuilder';
import ManageWitnesses from './pages/ManageWitnesses';
import WitnessPortal from './pages/WitnessPortal';
import RegistrarDashboard from './pages/RegistrarDashboard';
import CaseDetails from './pages/CaseDetails';
import LegalAssistant from './components/LegalAssistant';

import {
  LayoutDashboard, FilePlus, ShieldCheck, LogOut,
  Bell, Menu, X, Scale
} from 'lucide-react';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

/* ── Sidebar ─────────────────────────────────────────── */
function Sidebar({ open, setOpen }) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/will/new',  icon: <FilePlus size={18} />,        label: 'New Will' },
  ];
  if (user?.role === 'registrar') {
    navItems.push({ to: '/registrar/dashboard', icon: <ShieldCheck size={18} />, label: 'Registrar Portal' });
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-50/90 backdrop-blur-2xl border-r border-slate-200 flex flex-col
        transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy to-saffron flex items-center justify-center shadow-glow-sm">
            <Scale size={15} className="text-navy" />
          </div>
          <div>
            <h1 className="text-navy font-bold text-base leading-none">Will<span className="text-gradient">Maker</span></h1>
            <p className="text-slate-500 text-xs mt-0.5">{t('gov_portal')}</p>
          </div>
          <button className="ml-auto lg:hidden text-slate-600 hover:text-navy" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy/20 to-saffron/20 flex items-center justify-center text-navy font-bold text-xs uppercase border border-slate-200">
              {(user?.name || user?.phone || 'U').charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-navy text-sm font-medium truncate">{user?.name || user?.phone || 'User'}</p>
              <span className="text-xs capitalize badge-blue">{user?.role || 'citizen'}</span>
            </div>
          </div>
          <div className="flex gap-1 px-3">
            {['en','hi','mr'].map(lng => (
              <button key={lng} onClick={() => i18n.changeLanguage(lng)}
                className={`text-xs px-2 py-1 rounded-lg font-medium uppercase transition-all ${
                  i18n.language === lng ? 'bg-slate-100 text-navy' : 'text-slate-500 hover:text-slate-500'}`}>
                {lng}
              </button>
            ))}
          </div>
          <button onClick={() => signOut(auth)} className="sidebar-link w-full text-red-400/70 hover:bg-red-500/10 hover:text-red-400">
            <LogOut size={16} /><span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Auth Shell ──────────────────────────────────────── */
function AuthShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = {
    '/dashboard': 'Dashboard',
    '/will/new': 'Create New Will',
    '/registrar/dashboard': 'Registrar Portal',
  }[location.pathname] || 'WillMaker';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/90 backdrop-blur-2xl border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center gap-4 sticky top-0 z-10">
          <button className="lg:hidden text-slate-600 hover:text-navy" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <h2 className="text-navy font-bold text-lg flex-1 truncate">{pageTitle}</h2>
          <button className="relative p-2 rounded-xl glass hover:bg-white transition-colors">
            <Bell size={18} className="text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in scrollbar-thin">
          {children}
        </main>
      </div>
      <LegalAssistant />
    </div>
  );
}

/* ── Root App ────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/witness/:token" element={<WitnessPortal />} />
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={<AuthShell><Dashboard /></AuthShell>} />
          <Route path="/will/new" element={<AuthShell><WillBuilder /></AuthShell>} />
          <Route path="/will/:id" element={<AuthShell><CaseDetails /></AuthShell>} />
          <Route path="/will/:id/witnesses" element={<AuthShell><ManageWitnesses /></AuthShell>} />
        </Route>
        <Route element={<AuthGuard allowedRoles={['registrar']} />}>
          <Route path="/registrar/dashboard" element={<AuthShell><RegistrarDashboard /></AuthShell>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

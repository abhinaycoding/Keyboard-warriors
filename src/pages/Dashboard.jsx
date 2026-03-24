import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText, PlusCircle, CheckCircle, Clock, AlertTriangle,
  ChevronRight, ShieldCheck, Folder, Activity, User, Sparkles
} from 'lucide-react';

const statusConfig = {
  draft:             { label: 'Draft',              className: 'badge-grey',   icon: <Folder size={11} /> },
  witness_pending:   { label: 'Awaiting Witnesses', className: 'badge-yellow', icon: <Clock size={11} /> },
  registrar_review:  { label: 'Under Review',       className: 'badge-blue',   icon: <ShieldCheck size={11} /> },
  approved:          { label: 'Registered',          className: 'badge-green',  icon: <CheckCircle size={11} /> },
  rejected:          { label: 'Rejected',            className: 'badge-red',    icon: <AlertTriangle size={11} /> },
};

const mockCases = [
  { id: 'WILL-2026-4291', status: 'witness_pending', createdAt: new Date(Date.now() - 3*86400000).toISOString(), testator: { name: 'Demo User' } },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Wills',    value: mockCases.length, icon: <FileText size={20} className="text-navy" />,  bg: 'from-navy/10 to-accent-blue/5', border: 'border-slate-200' },
    { label: 'Pending Action', value: mockCases.filter(c => c.status === 'witness_pending').length, icon: <Clock size={20} className="text-amber-400" />, bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-500/15' },
    { label: 'Registered',     value: mockCases.filter(c => c.status === 'approved').length, icon: <CheckCircle size={20} className="text-emerald-400" />, bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/15' },
    { label: 'Under Review',   value: mockCases.filter(c => c.status === 'registrar_review').length, icon: <ShieldCheck size={20} className="text-saffron" />, bg: 'from-accent-purple/10 to-saffron/5', border: 'border-slate-200' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="gradient-border rounded-2xl overflow-hidden">
        <div className="bg-slate-50 backdrop-blur p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy/20 to-saffron/20 flex items-center justify-center text-navy font-bold text-lg uppercase border border-slate-200">
              {(user?.name || 'U').charAt(0)}
            </div>
            <div>
              <p className="text-slate-600 text-sm">Welcome back,</p>
              <h2 className="text-navy text-xl font-bold">{user?.name || user?.phone}</h2>
            </div>
          </div>
          <button onClick={() => navigate('/will/new')} className="btn-primary shrink-0">
            <PlusCircle size={18} /> Create New Will
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`glass rounded-2xl p-5 border ${s.border} hover:shadow-glow-sm transition-all duration-300`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-600 font-medium">{s.label}</p>
                <p className="text-3xl font-bold text-navy mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.bg} flex items-center justify-center border ${s.border}`}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cases */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-navy flex items-center gap-2">
            <FileText size={18} className="text-navy" /> My Will Cases
          </h3>
          <button onClick={() => navigate('/will/new')} className="btn-ghost text-xs text-navy">
            <PlusCircle size={14} /> New Will
          </button>
        </div>
        {mockCases.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-500">
            <Folder size={40} className="mb-3 opacity-30" />
            <p className="font-medium">No wills created yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {mockCases.map(c => {
              const cfg = statusConfig[c.status] || statusConfig.draft;
              return (
                <li key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-white transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-600">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">{c.id}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`${cfg.className} hidden sm:inline-flex`}>{cfg.icon} {cfg.label}</span>
                    <Link to={`/will/${c.id}`} className="flex items-center gap-1 text-sm font-semibold text-navy hover:text-saffron transition-colors group-hover:translate-x-0.5">
                      View <ChevronRight size={15} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Info panels */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6">
          <h4 className="font-bold text-navy flex items-center gap-2 mb-3 text-sm">
            <Sparkles size={16} className="text-saffron" /> Legal Reminder
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            A registered will without 2 witnesses has no legal standing. Ensure all cases are fully witnessed before Registrar submission.
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h4 className="font-bold text-navy flex items-center gap-2 mb-3 text-sm">
            <User size={16} className="text-navy" /> Your Profile
          </h4>
          <div className="space-y-2 text-sm">
            {[
              { l: 'Name', v: user?.name || '—' },
              { l: 'Phone', v: user?.phone || '—' },
            ].map(f => (
              <div key={f.l} className="flex justify-between">
                <span className="text-slate-500">{f.l}</span>
                <span className="font-medium text-slate-700">{f.v}</span>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Role</span>
              <span className="badge-blue capitalize">{user?.role || 'citizen'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

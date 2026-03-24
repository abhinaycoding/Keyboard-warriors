import { CheckCircle2, Clock, Lock, XCircle } from 'lucide-react';

const phases = [
  { id: 'creation',     label: 'Creation',     icon: '✏️',  events: ['Will Created', 'User Verified', 'Draft Saved'] },
  { id: 'document',     label: 'Document',     icon: '📄',  events: ['PDF Generated', 'SHA-256 Hash', 'Vault Storage'] },
  { id: 'witness',      label: 'Witness',      icon: '👥',  events: ['Witness 1 Invited', 'Witness 1 Signed', 'Witness 2 Signed'] },
  { id: 'registration', label: 'Registration', icon: '🏛️', events: ['Submitted', 'Under Review', 'Reg ID Generated'] },
  { id: 'activation',   label: 'Activation',   icon: '🔓',  events: ['Death Certificate', 'Executor Assigned', 'Family Notified'] },
  { id: 'execution',    label: 'Execution',    icon: '✅',  events: ['Assets Distributed', 'Case Closed'] },
];

const Timeline = ({ currentPhaseId, rejectedPhaseId, completedPhases }) => {
  const getStatus = (id) => {
    if (rejectedPhaseId === id) return 'rejected';
    if (completedPhases.includes(id)) return 'completed';
    if (currentPhaseId === id) return 'pending';
    return 'locked';
  };

  const iconStyle = (status) => {
    const base = 'w-10 h-10 rounded-full flex items-center justify-center text-base border-2 font-bold transition-all duration-300 shrink-0';
    switch (status) {
      case 'completed': return `${base} bg-gradient-to-br from-navy to-saffron border-transparent text-navy shadow-glow-sm`;
      case 'pending':   return `${base} bg-slate-50 border-amber-400/40 text-amber-400 animate-pulse-glow`;
      case 'rejected':  return `${base} bg-slate-50 border-red-400/40 text-red-400`;
      default:          return `${base} bg-slate-50 border-slate-200 text-slate-500`;
    }
  };

  const cardStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-slate-100 border-slate-200';
      case 'pending':   return 'bg-amber-500/5 border-amber-500/15';
      case 'rejected':  return 'bg-red-500/5 border-red-500/15';
      default:          return 'bg-white border-slate-200';
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-bold text-navy mb-6 text-xs uppercase tracking-[0.15em] text-slate-500">Case Timeline</h3>
      <div className="relative">
        <div className="absolute left-5 top-5 bottom-5 w-px bg-white" />
        <div className="space-y-4">
          {phases.map((phase, idx) => {
            const status = getStatus(phase.id);
            return (
              <div key={phase.id} className="relative flex gap-4">
                <div className={iconStyle(status)}>
                  {status === 'completed' ? <CheckCircle2 size={16} /> : status === 'rejected' ? <XCircle size={16} /> : status === 'locked' ? <Lock size={12} /> : phase.icon}
                </div>
                <div className={`flex-1 rounded-xl border p-3 ${cardStyle(status)}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm font-bold ${status === 'locked' ? 'text-slate-500' : 'text-navy'}`}>
                      Phase {idx + 1}: {phase.label}
                    </span>
                    {status === 'completed' && <span className="badge-green text-[10px]">Done</span>}
                    {status === 'pending' && <span className="badge-yellow text-[10px]">Active</span>}
                    {status === 'rejected' && <span className="badge-red text-[10px]">Rejected</span>}
                    {status === 'locked' && <span className="badge-grey text-[10px]">Locked</span>}
                  </div>
                  <div className="space-y-1">
                    {phase.events.map(event => (
                      <div key={event} className="flex items-center gap-2 text-xs text-slate-600">
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'completed' ? 'bg-emerald-400' : 'bg-gray-700'}`} />
                        {event}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;

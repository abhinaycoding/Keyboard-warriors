import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Timeline from '../components/Timeline';
import { FileText, Users, ArrowLeft, Copy, ExternalLink, Hash, ShieldCheck } from 'lucide-react';

const CaseDetails = () => {
  const { id } = useParams();
  const [willCase, setWillCase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'cases', id), snap => { if (snap.exists()) setWillCase(snap.data()); setLoading(false); });
    return unsub;
  }, [id]);

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin w-10 h-10 rounded-full border-4 border-slate-200 border-t-accent-blue" /></div>;
  if (!willCase) return <div className="glass rounded-2xl p-10 text-center text-slate-600">Case not found.</div>;

  let completedPhases = ['creation'], currentPhaseId = 'document', rejectedPhaseId = null;
  if (willCase.document?.hash) { completedPhases.push('document'); currentPhaseId = 'witness'; }
  if (willCase.status === 'registrar_review') { completedPhases.push('witness'); currentPhaseId = 'registration'; }
  if (willCase.status === 'approved') { completedPhases.push('witness','registration'); currentPhaseId = 'activation'; }
  if (willCase.status === 'rejected') { completedPhases.push('witness'); rejectedPhaseId = 'registration'; currentPhaseId = null; }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="p-2 rounded-xl glass hover:bg-white text-slate-600 hover:text-navy transition-colors"><ArrowLeft size={18} /></Link>
        <div><h2 className="text-xl font-bold text-navy">{willCase.caseId || id}</h2><p className="text-sm text-slate-500">Government Will Case</p></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {willCase.registration?.id && (
            <div className="gradient-border rounded-2xl overflow-hidden">
              <div className="bg-slate-50 p-6 flex items-center gap-4">
                <ShieldCheck className="text-emerald-400 w-8 h-8 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Registration ID</p>
                  <p className="text-2xl font-mono font-bold text-navy">{willCase.registration.id}</p>
                </div>
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold text-navy flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 text-sm"><FileText size={16} className="text-navy" /> Testator</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[{l:'Name',v:willCase.testator?.name},{l:'DOB',v:willCase.testator?.dob},{l:'Phone',v:willCase.testator?.phone},{l:'Aadhaar',v:willCase.testator?.aadhaar||'—'}].map(f=>(
                <div key={f.l}><p className="text-slate-500 text-xs mb-0.5">{f.l}</p><p className="text-navy font-semibold">{f.v||'—'}</p></div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold text-navy flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 text-sm"><Hash size={16} className="text-navy" /> Document</h3>
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2 mb-4 border border-slate-200">
              <p className="font-mono text-xs text-slate-500 break-all flex-1">{willCase.document?.hash || 'Not generated'}</p>
              {willCase.document?.hash && <button onClick={()=>navigator.clipboard.writeText(willCase.document.hash)} className="shrink-0 p-1 text-slate-500 hover:text-navy transition-colors"><Copy size={14} /></button>}
            </div>
            {willCase.document?.pdfUrl && <a href={willCase.document.pdfUrl} target="_blank" rel="noreferrer" className="btn-primary text-sm py-2"><ExternalLink size={14} /> View PDF</a>}
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <h3 className="font-bold text-navy flex items-center gap-2 text-sm"><Users size={16} className="text-navy" /> Witnesses</h3>
              <Link to={`/will/${id}/witnesses`} className="btn-primary text-xs py-1.5 px-4">Manage</Link>
            </div>
            <p className="text-sm text-slate-600">Two digital witnesses required before registrar submission.</p>
          </div>
        </div>
        <div className="lg:col-span-1">
          <Timeline currentPhaseId={currentPhaseId} rejectedPhaseId={rejectedPhaseId} completedPhases={completedPhases} />
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;

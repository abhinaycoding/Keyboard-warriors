import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ShieldAlert, CheckCircle2, XCircle, Search, Hash, FileText, Calendar, ChevronRight, RefreshCw } from 'lucide-react';

const RegistrarDashboard = () => {
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [rejectionReason, setRejection] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setAction] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try { const q = query(collection(db,'cases'),where('status','in',['registrar_review'])); const snap = await getDocs(q); const list = []; snap.forEach(d=>list.push({id:d.id,...d.data()})); setCases(list); } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchCases(); }, []);

  const handleApprove = async () => {
    setAction(true);
    const regId = `REG-${new Date().getFullYear()}-${Math.floor(Math.random()*900000+100000)}`;
    await updateDoc(doc(db,'cases',selected.id), { status:'approved', 'registration.id':regId, 'registration.approvedAt':new Date().toISOString(), 'registration.approvedBy':'Registrar_01' });
    setSelected(null); setAction(false); fetchCases();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return alert('Reason required.');
    setAction(true);
    await updateDoc(doc(db,'cases',selected.id), { status:'rejected', 'registration.rejectionReason':rejectionReason, 'registration.rejectedAt':new Date().toISOString() });
    setSelected(null); setRejection(''); setAction(false); fetchCases();
  };

  const filtered = cases.filter(c => c.id.toLowerCase().includes(search.toLowerCase()) || (c.testator?.name||'').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div><h2 className="text-xl font-bold text-navy">Registration Queue</h2><p className="text-sm text-slate-600">Review and process pending registrations</p></div>
        <div className="flex gap-2">
          <div className="relative"><Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" /><input type="text" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} className="form-input pl-9 py-2 text-sm w-48" /></div>
          <button onClick={fetchCases} className="btn-ghost p-2.5 glass"><RefreshCw size={16} className="text-slate-500" /></button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6" style={{ minHeight:'calc(100vh - 220px)' }}>
        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden flex flex-col">
          <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
            <span className="font-semibold text-sm text-slate-700">Pending Queue</span>
            <span className="badge-blue text-[10px]">{cases.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="flex justify-center items-center h-32"><div className="animate-spin w-8 h-8 rounded-full border-4 border-slate-200 border-t-accent-blue" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500"><ShieldAlert size={28} className="mx-auto mb-2 opacity-30" /><p className="text-sm">{search?'No matches':'Empty queue'}</p></div>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {filtered.map(c => (
                  <li key={c.id} onClick={()=>{setSelected(c);setRejection('');}}
                    className={`px-4 py-4 cursor-pointer flex items-center justify-between transition-all group ${
                      selected?.id===c.id ? 'bg-slate-100 border-l-2 border-l-accent-blue' : 'hover:bg-white border-l-2 border-l-transparent'}`}>
                    <div>
                      <p className="font-semibold text-navy text-sm">{c.id}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{c.testator?.name}</p>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1"><Calendar size={10} />{new Date(c.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</p>
                    </div>
                    <ChevronRight size={16} className={`text-slate-600 group-hover:text-navy transition-colors ${selected?.id===c.id?'text-navy':''}`} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 glass-strong rounded-2xl p-6">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center"><ShieldAlert size={32} className="text-slate-600" /></div>
              <p className="font-medium">Select a case</p><p className="text-sm text-slate-600">Choose from the queue</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div><h3 className="text-lg font-bold text-navy">{selected.id}</h3><p className="text-sm text-slate-500 mt-0.5">Submitted: {new Date(selected.createdAt).toLocaleDateString('en-IN')}</p></div>
                {selected.document?.pdfUrl && <a href={selected.document.pdfUrl} target="_blank" rel="noreferrer" className="btn-outline-glow text-sm py-2"><FileText size={14} /> View PDF</a>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Testator</h4>
                  <div className="space-y-2 text-sm">
                    {[{l:'Name',v:selected.testator?.name},{l:'DOB',v:selected.testator?.dob},{l:'Aadhaar',v:selected.testator?.aadhaar||'—'}].map(f=>(
                      <div key={f.l} className="flex justify-between"><span className="text-slate-500">{f.l}</span><strong className="text-navy">{f.v}</strong></div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-xl p-4 border-emerald-500/20">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1"><Hash size={11} /> Hash</h4>
                  <p className="font-mono text-xs text-slate-500 break-all leading-relaxed">{selected.document?.hash || 'None'}</p>
                  {selected.document?.hash && <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-400"><CheckCircle2 size={12} /> Verified</div>}
                </div>
              </div>
              <div className="glass rounded-xl p-5">
                <h4 className="font-bold text-navy text-sm mb-4">Action</h4>
                <div className="space-y-3">
                  <button onClick={handleApprove} disabled={actionLoading} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-navy py-3 rounded-xl font-bold transition-all disabled:opacity-50"><CheckCircle2 size={18} /> Approve</button>
                  <input type="text" value={rejectionReason} onChange={e=>setRejection(e.target.value)} placeholder="Rejection reason…" className="form-input text-sm" />
                  <button onClick={handleReject} disabled={actionLoading||!rejectionReason.trim()} className="w-full flex items-center justify-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-30"><XCircle size={16} /> Reject</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrarDashboard;

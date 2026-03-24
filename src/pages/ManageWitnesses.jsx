import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, collection, setDoc, onSnapshot } from 'firebase/firestore';
import { UserPlus, Copy, CheckCircle2, Clock, Phone } from 'lucide-react';

const ManageWitnesses = () => {
  const { id } = useParams();
  const [witnesses, setWitnesses] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+91');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const u = onSnapshot(collection(db, 'cases', id, 'witnessTokens'), snap => {
      const list = []; snap.forEach(d => list.push({ id: d.id, ...d.data() })); setWitnesses(list); setLoading(false);
    });
    return u;
  }, [id]);

  const handleInvite = async (e) => {
    e.preventDefault(); if (newPhone.length < 13) return; setInviting(true);
    const token = crypto.randomUUID();
    await setDoc(doc(db, 'cases', id, 'witnessTokens', token), {
      name: newName, phone: newPhone, status: 'invited', invitedAt: new Date().toISOString(), signatureBase64: null
    });
    setNewName(''); setNewPhone('+91'); setInviting(false);
  };

  const copyLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/witness/${token}?caseId=${id}`);
    setCopied(token); setTimeout(() => setCopied(null), 2000);
  };

  const signed = witnesses.filter(w => w.status === 'signed').length;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <div className="gradient-border rounded-2xl overflow-hidden">
        <div className="bg-slate-50 backdrop-blur p-6">
          <h2 className="text-navy font-bold text-xl mb-1">Witness Management</h2>
          <p className="text-slate-600 text-sm mb-4">Case: {id}</p>
          <div className="flex gap-4">
            {[{v:signed,l:'Signed',c:'text-navy'},{v:witnesses.length,l:'Invited',c:'text-navy'},{v:2,l:'Required',c:signed>=2?'text-emerald-400':'text-amber-400'}].map(s=>(
              <div key={s.l} className="glass rounded-xl px-4 py-2 text-center"><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p><p className="text-slate-500 text-xs">{s.l}</p></div>
            ))}
          </div>
          {signed >= 2 && <div className="mt-4 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl px-4 py-2"><CheckCircle2 size={16} /> Ready for registrar.</div>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="font-bold text-navy flex items-center gap-2 mb-5 pb-3 border-b border-slate-200 text-sm"><UserPlus size={16} className="text-navy" /> Invite Witness</h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div><label className="form-label">Name</label><input type="text" required value={newName} onChange={e=>setNewName(e.target.value)} className="form-input" placeholder="Legal name" /></div>
            <div><label className="form-label">Phone</label><div className="relative"><Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" /><input type="tel" required value={newPhone} onChange={e=>setNewPhone(e.target.value)} className="form-input pl-10" placeholder="+91…" /></div></div>
            <button type="submit" disabled={inviting} className="btn-primary w-full">{inviting ? 'Generating…' : <><UserPlus size={16} /> Generate Link</>}</button>
          </form>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          <h3 className="font-bold text-navy mb-5 pb-3 border-b border-slate-200 text-sm">Invited ({witnesses.length})</h3>
          {witnesses.length === 0 ? (
            <div className="text-center text-slate-500 py-8"><UserPlus size={28} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No witnesses yet.</p></div>
          ) : (
            <ul className="space-y-3">
              {witnesses.map(w => (
                <li key={w.id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy/15 to-saffron/15 flex items-center justify-center text-navy font-bold text-xs uppercase border border-slate-200">{w.name.charAt(0)}</div>
                      <div><p className="font-semibold text-navy text-sm">{w.name}</p><p className="text-xs text-slate-500">{w.phone}</p></div>
                    </div>
                    {w.status === 'signed' ? <span className="badge-green shrink-0"><CheckCircle2 size={11} /> Signed</span> : <span className="badge-yellow shrink-0"><Clock size={11} /> Pending</span>}
                  </div>
                  {w.status !== 'signed' && (
                    <button onClick={()=>copyLink(w.id)} className={`mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                      copied===w.id ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-slate-200 text-slate-500 hover:border-slate-200 hover:text-navy'}`}>
                      {copied===w.id ? <><CheckCircle2 size={14}/> Copied!</> : <><Copy size={14}/> Copy Link</>}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageWitnesses;

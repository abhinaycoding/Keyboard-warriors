import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import SignatureCanvas from 'react-signature-canvas';
import { Scale, ShieldCheck, Download, Pencil, RotateCcw, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const WitnessPortal = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('caseId');
  const [willCase, setWillCase] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const sigCanvas = useRef({});

  useEffect(() => {
    const load = async () => {
      try {
        const [cs, ts] = await Promise.all([getDoc(doc(db,'cases',caseId)), getDoc(doc(db,'cases',caseId,'witnessTokens',token))]);
        if (!cs.exists()||!ts.exists()) { setError('Invalid link.'); setLoading(false); return; }
        setWillCase(cs.data()); setTokenData(ts.data());
        if (ts.data().status === 'signed') setStep(4);
        if (!window.recaptchaVerifierW) window.recaptchaVerifierW = new RecaptchaVerifier(auth,'recaptcha-w',{size:'invisible'});
      } catch(e) { setError(e.message); }
      setLoading(false);
    };
    if (caseId && token) load();
  }, [caseId, token]);

  const sendOtp = async () => {
    setError(''); setLoading(true);
    try { const r = await signInWithPhoneNumber(auth,tokenData.phone,window.recaptchaVerifierW); setConfirmationResult(r); setStep(2); } catch(e) { setError(e.message); }
    setLoading(false);
  };
  const verifyOtp = async () => {
    setError(''); setLoading(true);
    try { await confirmationResult.confirm(otp); setStep(3); } catch(e) { setError('Invalid OTP'); }
    setLoading(false);
  };
  const submitSig = async () => {
    if (sigCanvas.current.isEmpty()) return alert('Please sign first.');
    setLoading(true);
    try {
      const sig = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      await updateDoc(doc(db,'cases',caseId,'witnessTokens',token), { status:'signed', signatureBase64:sig, signedAt:new Date().toISOString() });
      const snap = await getDocs(collection(db,'cases',caseId,'witnessTokens'));
      let signed = 0; snap.forEach(d => { if (d.data().status==='signed'||d.id===token) signed++; });
      if (signed>=2) await updateDoc(doc(db,'cases',caseId), { status:'registrar_review' });
      setStep(4);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  if (loading && step===1) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-12 h-12 rounded-full border-4 border-slate-200 border-t-accent-blue" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <header className="bg-white/90 backdrop-blur-2xl border-b border-slate-200 px-6 py-4 flex items-center gap-3 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy to-saffron flex items-center justify-center"><Scale size={15} className="text-navy" /></div>
        <span className="text-navy font-bold">WillMaker</span><span className="text-slate-500 text-sm">· Witness Portal</span>
      </header>
      <div id="recaptcha-w" />
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-lg animate-slide-up">
          {error && !willCase ? (
            <div className="glass-strong rounded-3xl p-8 text-center"><AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" /><h3 className="font-bold text-navy text-xl mb-2">Invalid Link</h3><p className="text-slate-600 text-sm">{error}</p></div>
          ) : (
            <>
              <div className="gradient-border rounded-2xl overflow-hidden mb-4">
                <div className="bg-slate-50 p-4 flex items-center gap-3">
                  <ShieldCheck className="text-navy shrink-0" size={20} />
                  <div><p className="text-xs text-slate-600">Witnessing Will Case</p><p className="font-bold text-navy">{caseId}</p><p className="text-xs text-slate-500 mt-0.5">Testator: {willCase?.testator?.name}</p></div>
                </div>
              </div>
              <div className="glass-strong rounded-3xl p-8">
                {error && <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl"><AlertCircle size={14} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
                {step===1 && (
                  <div className="text-center space-y-5">
                    <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl mx-auto">👥</div>
                    <div><h3 className="text-xl font-bold text-navy">You're invited</h3><p className="text-slate-600 text-sm mt-1">as a witness for <strong className="text-slate-700">{willCase?.testator?.name}'s</strong> will.</p></div>
                    <div className="glass rounded-xl p-4 text-left"><p className="text-sm text-slate-600">OTP will be sent to:</p><p className="font-bold text-navy mt-1">{tokenData?.phone}</p></div>
                    <button onClick={sendOtp} disabled={loading} className="btn-primary w-full">Send Verification OTP</button>
                  </div>
                )}
                {step===2 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-navy">Enter OTP</h3>
                    <p className="text-slate-600 text-sm">Sent to <strong className="text-slate-700">{tokenData?.phone}</strong></p>
                    <input type="text" value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} className="form-input text-center text-2xl tracking-[0.5em] font-bold" placeholder="000000" />
                    <button onClick={verifyOtp} disabled={loading||otp.length<6} className="btn-primary w-full">Verify Identity</button>
                  </div>
                )}
                {step===3 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-navy">Sign the Document</h3>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
                      <strong>Legal Declaration:</strong> By signing, you confirm you have witnessed this will.
                    </div>
                    {willCase?.document?.pdfUrl && <a href={willCase.document.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between glass rounded-xl p-3 text-sm hover:border-slate-200 transition-colors"><span className="text-slate-700">View PDF</span><Download size={16} className="text-navy" /></a>}
                    <div>
                      <label className="form-label flex items-center gap-2"><Pencil size={14} /> Draw signature</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden hover:border-slate-200 transition-colors">
                        <SignatureCanvas ref={sigCanvas} penColor="#6C8AFF" canvasProps={{ className: 'w-full', height: 180 }} />
                      </div>
                      <button onClick={()=>sigCanvas.current.clear()} className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><RotateCcw size={11}/> Clear</button>
                    </div>
                    <button onClick={submitSig} disabled={loading} className="btn-primary w-full"><Send size={16} /> Submit Signature</button>
                  </div>
                )}
                {step===4 && (
                  <div className="text-center space-y-4 py-6">
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="text-emerald-400 w-10 h-10" /></div>
                    <h3 className="text-2xl font-bold text-navy">Signature Recorded</h3>
                    <p className="text-slate-600 text-sm">Your digital signature has been securely stored.</p>
                    <div className="glass rounded-xl p-4 text-xs text-slate-500">You may safely close this window.</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WitnessPortal;

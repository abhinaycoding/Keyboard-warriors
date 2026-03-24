import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, Check, User, Users, Building, PieChart, Heart, AlertCircle, ShieldCheck, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { processWillDocument } from '../lib/pdf';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const initialData = {
  personalInfo: { name: '', dob: '', aadhaar: '', address: '', phone: '' },
  family: { spouseName: '', children: '' },
  assets: '',
  distribution: '',
  specialWishes: { funeralInstructions: '', guardianForMinors: '', charity: '' }
};

const steps = [
  { id: 1, label: 'Personal',     icon: <User size={16} />,      desc: 'Identity details' },
  { id: 2, label: 'Family',       icon: <Users size={16} />,     desc: 'Dependants' },
  { id: 3, label: 'Assets',       icon: <Building size={16} />,  desc: 'Inventory' },
  { id: 4, label: 'Distribution', icon: <PieChart size={16} />,  desc: 'Allocation' },
  { id: 5, label: 'Wishes',       icon: <Heart size={16} />,     desc: 'Final notes' },
  { id: 6, label: 'Verify',       icon: <ShieldCheck size={16} />, desc: 'Final OTP' },
];

const WillBuilder = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const { user, isDemoMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 6 && !window.recaptchaVerifierB) {
      window.recaptchaVerifierB = new RecaptchaVerifier(auth, 'recaptcha-builder', { size: 'invisible' });
    }
  }, [step]);

  const update = (section, data) =>
    setFormData(prev => ({ ...prev, [section]: typeof data === 'string' ? data : { ...prev[section], ...data } }));

  const handleSendOtp = async () => {
    setError(''); setLoading(true);
    const phone = formData.personalInfo.phone;
    if (!phone) { setError('Phone number missing in Personal Info'); setStep(1); setLoading(false); return; }
    
    // Developer / Demo Bypass
    if (isDemoMode || phone === '+910000000000') {
      setConfirmationResult({ confirm: async () => true });
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifierB);
      setConfirmationResult(result);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleVerifyAndSubmit = async () => {
    setLoading(true); setError('');
    try {
      await confirmationResult.confirm(otp);
      await handleSubmit();
    } catch (err) { setError('Invalid OTP. ' + err.message); setLoading(false); }
  };

  const handleSubmit = async () => {
    const willCase = {
      caseId: `WILL-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      status: 'witness_pending', createdAt: new Date().toISOString(),
      testator: formData.personalInfo,
      family: { spouseName: formData.family.spouseName, children: formData.family.children.split(',').map(s=>s.trim()).filter(Boolean) },
      assets: formData.assets.split(',').map(s=>s.trim()).filter(Boolean),
      beneficiaries: formData.distribution.split(',').map(s=>s.trim()).filter(Boolean),
      specialWishes: formData.specialWishes, witnesses: [],
      document: { pdfUrl: '', hash: '', generatedAt: '' },
      registration: {}, timeline: [{ step: 'CREATION', status: 'completed', timestamp: new Date().toISOString(), actor: user?.uid, note: 'Drafted & Verified by Testator via OTP' }]
    };
    try { await processWillDocument(willCase); navigate('/dashboard'); }
    catch (err) { setError(err.message); }
    setLoading(false);
  };

  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Stepper */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="relative">
          <div className="hidden sm:block absolute top-4 left-0 right-0 h-0.5 bg-white">
            <div className="h-full bg-gradient-to-r from-navy to-saffron transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <div className="relative flex justify-between">
            {steps.map((s) => {
              const state = step > s.id ? 'done' : step === s.id ? 'active' : 'locked';
              return (
                <div key={s.id} className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${
                    state === 'done'   ? 'bg-gradient-to-br from-navy to-saffron border-transparent text-navy' :
                    state === 'active' ? 'bg-slate-50 border-accent-blue text-navy shadow-glow-sm' :
                    'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    {state === 'done' ? <Check size={16} /> : s.icon}
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className={`text-xs font-semibold ${state === 'active' ? 'text-navy' : state === 'done' ? 'text-slate-500' : 'text-slate-500'}`}>{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="glass-strong rounded-2xl p-6 sm:p-8">
        {error && (
          <div className="mb-6 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl">
            <AlertCircle size={15} className="mt-0.5 shrink-0" /><span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <div className="animate-slide-up space-y-5">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-xl font-bold text-navy">Personal Information</h3>
              <p className="text-sm text-slate-600 mt-1">This will appear on your official document.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className="form-label">Full Name *</label><input type="text" value={formData.personalInfo.name} onChange={e=>update('personalInfo',{name:e.target.value})} className="form-input" placeholder="As per Aadhaar" /></div>
              <div><label className="form-label">Date of Birth *</label><input type="date" value={formData.personalInfo.dob} onChange={e=>update('personalInfo',{dob:e.target.value})} className="form-input" /></div>
              <div><label className="form-label">Aadhaar Number</label><input type="text" value={formData.personalInfo.aadhaar} onChange={e=>update('personalInfo',{aadhaar:e.target.value})} className="form-input" placeholder="XXXX XXXX XXXX" /></div>
              <div><label className="form-label">Phone *</label><input type="tel" value={formData.personalInfo.phone} onChange={e=>update('personalInfo',{phone:e.target.value})} className="form-input" placeholder="+91…" /></div>
              <div className="sm:col-span-2"><label className="form-label">Address *</label><textarea rows={3} value={formData.personalInfo.address} onChange={e=>update('personalInfo',{address:e.target.value})} className="form-input resize-none" placeholder="Full residential address" /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up space-y-5">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-xl font-bold text-navy">Family Details</h3>
              <p className="text-sm text-slate-600 mt-1">Legal dependants for distribution.</p>
            </div>
            <div><label className="form-label">Spouse Name</label><input type="text" value={formData.family.spouseName} onChange={e=>update('family',{spouseName:e.target.value})} className="form-input" placeholder="Legal name" /></div>
            <div><label className="form-label">Children</label><input type="text" value={formData.family.children} onChange={e=>update('family',{children:e.target.value})} className="form-input" placeholder="Comma separated" />
              <p className="text-xs text-slate-500 mt-1.5">Separate names with commas.</p></div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up space-y-5">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-xl font-bold text-navy">Asset Inventory</h3>
              <p className="text-sm text-slate-600 mt-1">All assets to be included.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[{e:'🏠',l:'Property'},{e:'🏦',l:'Bank A/C'},{e:'📈',l:'Investments'},{e:'🚗',l:'Vehicles'}].map(t=>(
                <div key={t.l} className="glass p-3 text-center cursor-pointer hover:border-slate-200 hover:shadow-glow-sm transition-all rounded-xl">
                  <div className="text-2xl mb-1">{t.e}</div><p className="text-xs font-medium text-slate-500">{t.l}</p>
                </div>
              ))}
            </div>
            <div><label className="form-label">Asset Description *</label><textarea rows={5} value={formData.assets} onChange={e=>update('assets',e.target.value)} className="form-input resize-none" placeholder="E.g.: HDFC A/C, Flat at Noida, LIC Policy…" /></div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-slide-up space-y-5">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-xl font-bold text-navy">Distribution Plan</h3>
              <p className="text-sm text-slate-600 mt-1">Who inherits what.</p>
            </div>
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-sm text-slate-500 mb-4">
              💡 Be specific about percentages and asset assignments to avoid disputes.
            </div>
            <div><label className="form-label">Instructions *</label><textarea rows={6} value={formData.distribution} onChange={e=>update('distribution',e.target.value)} className="form-input resize-none" placeholder="E.g.: 50% to spouse, flat to son Rahul…" /></div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-slide-up space-y-5">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-xl font-bold text-navy">Special Wishes</h3>
              <p className="text-sm text-slate-600 mt-1">Final instructions for your family.</p>
            </div>
            <div><label className="form-label">Funeral Instructions</label><textarea rows={3} value={formData.specialWishes.funeralInstructions} onChange={e=>update('specialWishes',{funeralInstructions:e.target.value})} className="form-input resize-none" placeholder="Optional" /></div>
            <div><label className="form-label">Guardian for Minors</label><input type="text" value={formData.specialWishes.guardianForMinors} onChange={e=>update('specialWishes',{guardianForMinors:e.target.value})} className="form-input" placeholder="Name and relation" /></div>
            <div><label className="form-label">Charitable Bequest</label><input type="text" value={formData.specialWishes.charity} onChange={e=>update('specialWishes',{charity:e.target.value})} className="form-input" placeholder="Optional donation" /></div>
            <div className="gradient-border rounded-xl p-5 mt-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-navy/20 to-saffron/20 flex items-center justify-center shrink-0 border border-slate-200">
                  <Check size={16} className="text-navy" />
                </div>
                <div>
                  <h4 className="font-bold text-navy mb-1 text-sm">Draft Complete</h4>
                  <p className="text-slate-600 text-sm">Your details have been captured. Next, verify your identity to officially submit.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="animate-slide-up space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-navy" size={32} />
            </div>
            <div id="recaptcha-builder" />
            <div>
              <h3 className="text-xl font-bold text-navy">Final Identity Verification</h3>
              <p className="text-sm text-slate-600 mt-1">To officially hash and register this Will, an OTP will be sent to your registered number: <strong className="text-navy">{formData.personalInfo.phone}</strong></p>
            </div>

            {!confirmationResult ? (
              <button onClick={handleSendOtp} disabled={loading} className="btn-primary w-full max-w-sm mx-auto">
                {loading ? 'Processing…' : <>Send Verification OTP <ArrowRight size={18} /></>}
              </button>
            ) : (
              <div className="space-y-5 animate-slide-up">
                <div className="flex flex-col gap-2 max-w-sm mx-auto">
                  <label className="form-label text-left">Enter 6-Digit OTP</label>
                  <input 
                    type="text" 
                    value={otp} 
                    onChange={e => setOtp(e.target.value)} 
                    placeholder="000000"
                    maxLength={6}
                    className="form-input text-center text-2xl tracking-[0.5em] font-bold h-16"
                  />
                </div>
                <button onClick={handleVerifyAndSubmit} disabled={loading || otp.length < 6} className="btn-primary w-full max-w-sm mx-auto">
                  {loading ? 'Finalizing Will…' : <>Verify & Securely Submit <Check size={18} /></>}
                </button>
                <button onClick={() => setConfirmationResult(null)} className="text-xs text-slate-400 hover:text-navy transition-colors">Didn't receive? Try again</button>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-700 max-w-sm mx-auto leading-relaxed">
              ⚠️ <strong>Legal Note:</strong> Verifying this OTP acts as your digital signature on the document hash.
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
          <button onClick={() => setStep(s => Math.max(s-1,1))} disabled={step===1 || loading} className="btn-secondary disabled:opacity-30">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex gap-2">
            {step < 5 ? (
              <button onClick={() => setStep(s => Math.min(s+1,6))} className="btn-primary">Next <ChevronRight size={18} /></button>
            ) : step === 5 ? (
              <button onClick={() => setStep(6)} className="btn-primary">Proceed to Verification <ArrowRight size={18} /></button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WillBuilder;

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { Scale, Eye, EyeOff, Phone, Lock, ArrowRight, AlertCircle, ArrowLeft, UserCircle, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const OtpInput = ({ value, onChange }) => {
  const inputs = useRef([]);
  const vals = value.split('').concat(Array(6).fill('')).slice(0, 6);
  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      const next = vals.map((v, i) => i === idx ? '' : v).join('');
      onChange(next);
      if (idx > 0) inputs.current[idx - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      const next = vals.map((v, i) => i === idx ? e.key : v).join('');
      onChange(next);
      if (idx < 5) inputs.current[idx + 1]?.focus();
    }
    e.preventDefault();
  };
  return (
    <div className="flex gap-3 justify-center">
      {vals.map((v, i) => (
        <input key={i} ref={el => inputs.current[i] = el} type="text" inputMode="numeric" maxLength={1}
          value={v} onKeyDown={e => handleKey(e, i)} onChange={() => {}} className="otp-box" />
      ))}
    </div>
  );
};

const Login = () => {
  const [phone, setPhone] = useState('+91');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 13) { setError('Enter a valid +91XXXXXXXXXX number'); return; }
    setError(''); setLoading(true);
    try {
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(result); setStep(2); setCountdown(30);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setError('Enter all 6 digits'); return; }
    setError(''); setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const snap = await getDoc(doc(db, 'users', result.user.uid));
      if (!snap.exists()) { await signOut(auth); setError('User not found. Please register.'); setStep(1); return; }
      if (!bcrypt.compareSync(password, snap.data().password)) { await signOut(auth); setError('Incorrect password.'); setStep(1); return; }
      navigate('/dashboard');
    } catch (err) { setError('Invalid OTP. ' + err.message); }
    setLoading(false);
  };

  const handleSeedLive = async () => {
    setError(''); setLoading(true);
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const sampleCases = [
        {
          testatorId: 'mock-citizen',
          testatorName: 'Rajesh Kumar',
          status: 'witness_pending',
          createdAt: new Date().toISOString(),
          content: {
            assets: [{ type: 'Property', value: '1.5 Cr', owner: 'Self' }],
            beneficiaries: [{ name: 'Sita Kumar', relation: 'Spouse', share: '100%' }]
          },
          timeline: [
            { step: 'CREATION', status: 'COMPLETED', note: 'Will draft finalized.', timestamp: new Date(Date.now()-86400000).toISOString() },
            { step: 'DOCUMENT', status: 'COMPLETED', note: 'PDF Generated & Hashed.', timestamp: new Date(Date.now()-82800000).toISOString() }
          ]
        },
        {
          testatorId: 'mock-citizen',
          testatorName: 'Rajesh Kumar',
          status: 'registrar_review',
          createdAt: new Date().toISOString(),
          district: 'Delhi',
          timeline: [
            { step: 'CREATION', status: 'COMPLETED', note: 'Will draft finalized.', timestamp: new Date(Date.now()-172800000).toISOString() },
            { step: 'DOCUMENT', status: 'COMPLETED', note: 'PDF Generated & Hashed.', timestamp: new Date(Date.now()-169200000).toISOString() },
            { step: 'WITNESS', status: 'COMPLETED', note: 'All witnesses signed.', timestamp: new Date(Date.now()-165600000).toISOString() }
          ]
        }
      ];

      for (const c of sampleCases) {
        await addDoc(collection(db, 'cases'), c);
      }
      alert('Success! 2 cases have been seeded into your Live Firestore DB. Refresh your console.');
    } catch (err) {
      setError('Seeding failed: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent-blue/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Left — branding */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between px-14 py-12 relative z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <WirasatLogo className="w-8 h-8 drop-shadow-md text-navy" />
          <span className="font-bold text-lg">Wira<span className="text-gradient">sat</span></span>
        </Link>

        <div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-navy to-saffron rounded mb-8" />
          <h2 className="text-4xl font-black leading-tight mb-5 tracking-tight">
            Welcome back.<br />
            <span className="text-gradient">Let's secure your legacy.</span>
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-10">
            India's most trusted digital will management platform. Government-grade security meets modern simplicity.
          </p>
          <div className="space-y-4">
            {['SHA-256 encrypted documents', 'Government-verified registration', 'Digital witness signatures'].map(f => (
              <div key={f} className="flex items-center gap-3 text-slate-600">
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Wirasat · Government of India</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col relative z-10">
        <div className="flex items-center justify-between px-8 pt-6">
          <Link to="/" className="flex lg:hidden items-center gap-2">
            <WirasatLogo className="w-8 h-8 drop-shadow-md text-navy" />
            <span className="font-bold text-navy">Wirasat</span>
          </Link>
          <div className="ml-auto flex gap-1">
            {['en','hi','mr'].map(lng => (
              <button key={lng} onClick={() => i18n.changeLanguage(lng)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold uppercase transition-all ${
                  i18n.language === lng ? 'bg-slate-100 text-navy border border-slate-200' : 'text-slate-500 hover:text-slate-500'}`}>
                {lng}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <div className="w-full max-w-md animate-slide-up">
            <div id="recaptcha-container" />

            {step === 1 ? (
              <div className="glass-strong rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-navy mb-1">Sign in</h3>
                <p className="text-slate-600 text-sm mb-8">Enter your credentials to continue</p>

                {error && (
                  <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3.5 rounded-xl">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" /><span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="form-label">Phone Number</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                        className="form-input pl-11" placeholder="+91XXXXXXXXXX" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type={showPass ? 'text' : 'password'} required value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="form-input pl-11 pr-11" placeholder="Enter your password" />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-500">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                    {loading ? 'Sending OTP…' : <>Send OTP <ArrowRight size={16} /></>}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-navy hover:text-saffron font-semibold transition-colors">Register</Link>
                </p>
              </div>
            ) : (
              <div className="glass-strong rounded-3xl p-8">
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-slate-600 hover:text-navy text-sm mb-6 transition-colors">
                  <ArrowLeft size={14} /> Back
                </button>
                <h3 className="text-2xl font-bold text-navy mb-1">Verify OTP</h3>
                <p className="text-slate-600 text-sm mb-8">Sent to <span className="text-slate-700">{phone}</span></p>

                {error && (
                  <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3.5 rounded-xl">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" /><span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                  <OtpInput value={otp} onChange={setOtp} />
                  <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full py-3.5">
                    {loading ? 'Verifying…' : <>Verify & Sign In <ArrowRight size={16} /></>}
                  </button>
                </form>
                <div className="mt-5 text-center text-sm text-slate-500">
                  {countdown > 0
                    ? <span>Resend in <span className="text-slate-500 font-semibold">{countdown}s</span></span>
                    : <button onClick={handleSendOtp} className="text-navy font-semibold hover:text-saffron transition-colors">Resend OTP</button>
                  }
                </div>
              </div>
            )}
            {/* Presentation Helpers */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Zap size={10} className="text-saffron" /> Demo Mode
                  </p>
                  <p className="text-xs text-slate-500">Enable if Wi-Fi/Firebase is dead</p>
                </div>
                <button 
                  type="button"
                  onClick={toggleDemoMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDemoMode ? 'bg-navy' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDemoMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {!isDemoMode && (
                <div className="flex items-center justify-between animate-fade-in">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-1 flex items-center gap-1">
                      🚀 Live Seeder
                    </p>
                    <p className="text-xs text-slate-500">Populate your Firestore DB now</p>
                  </div>
                  <button 
                    onClick={handleSeedLive}
                    disabled={loading}
                    className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Seeding...' : 'Seed Live Data'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

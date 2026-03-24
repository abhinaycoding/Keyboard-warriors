import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { Scale, Eye, EyeOff, Phone, Lock, User, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
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

const Register = () => {
  const [name, setName] = useState('');
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

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors = ['','bg-red-500','bg-amber-500','bg-emerald-500'];
  const pwLabels = ['','Weak','Fair','Strong'];

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Full name required'); return; }
    if (phone.length < 13) { setError('Enter a valid +91XXXXXXXXXX number'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
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
      const hashed = bcrypt.hashSync(password, 10);
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid, name, phone, password: hashed,
        role: 'citizen', createdAt: new Date().toISOString(), isVerified: true
      });
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent-purple/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Left — branding */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between px-14 py-12 relative z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy to-saffron flex items-center justify-center shadow-glow-sm">
            <Scale size={15} className="text-navy" />
          </div>
          <span className="font-bold text-lg">Will<span className="text-gradient">Maker</span></span>
        </Link>

        <div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-accent-purple to-saffron rounded mb-8" />
          <h2 className="text-4xl font-black leading-tight mb-5 tracking-tight">
            Start building<br />
            <span className="text-gradient">your legacy today.</span>
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-10">
            Create your digital will in minutes. Legally sound. Government-backed. Tamper-proof.
          </p>
          <div className="space-y-4">
            {['01 — Register with your phone', '02 — Build your will in 5 steps', '03 — Submit to Government Registrar'].map(s => (
              <div key={s} className="text-slate-600 text-sm flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-accent-purple" />
                {s}
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">© {new Date().getFullYear()} WillMaker · Government of India</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col relative z-10">
        <div className="flex items-center justify-between px-8 pt-6">
          <Link to="/" className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy to-saffron flex items-center justify-center">
              <Scale size={15} className="text-navy" />
            </div>
            <span className="font-bold text-navy">WillMaker</span>
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
                <h3 className="text-2xl font-bold text-navy mb-1">Create account</h3>
                <p className="text-slate-600 text-sm mb-8">Start protecting your family's future</p>

                {error && (
                  <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3.5 rounded-xl">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" /><span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="form-label">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text" required value={name} onChange={e => setName(e.target.value)}
                        className="form-input pl-11" placeholder="As per Aadhaar card" />
                    </div>
                  </div>
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
                        onChange={e => setPassword(e.target.value)} className="form-input pl-11 pr-11" placeholder="Min. 6 characters" />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-500">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? pwColors[pwStrength] : 'bg-white'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">{pwLabels[pwStrength]}</p>
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                    {loading ? 'Sending OTP…' : <>Send Verification OTP <ArrowRight size={16} /></>}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Already registered?{' '}
                  <Link to="/login" className="text-navy hover:text-saffron font-semibold transition-colors">Sign in</Link>
                </p>
              </div>
            ) : (
              <div className="glass-strong rounded-3xl p-8">
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-slate-600 hover:text-navy text-sm mb-6 transition-colors">
                  <ArrowLeft size={14} /> Back
                </button>
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <CheckCircle2 className="text-emerald-400" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-navy mb-1">Verify your number</h3>
                <p className="text-slate-600 text-sm mb-8">OTP sent to <span className="text-slate-700">{phone}</span></p>

                {error && (
                  <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3.5 rounded-xl">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" /><span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                  <OtpInput value={otp} onChange={setOtp} />
                  <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full py-3.5">
                    {loading ? 'Creating Account…' : <>Verify & Register <ArrowRight size={16} /></>}
                  </button>
                </form>
                <div className="mt-5 text-center text-sm text-slate-500">
                  {countdown > 0
                    ? <span>Resend in <span className="text-slate-500 font-semibold">{countdown}s</span></span>
                    : <button onClick={handleSendOtp} className="text-navy font-semibold">Resend OTP</button>
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

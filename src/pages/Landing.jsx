import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Scale, ArrowRight, Shield, FileText, Users, CheckCircle2, Clock,
  Star, ChevronRight, Bot, Globe, Menu, X, Sparkles, Lock,
  Zap, Eye, ArrowUpRight, Play
} from 'lucide-react';

/* ───────────────────────────────────────────────────────
   DATA
   ─────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'How It Works',  href: '#how-it-works' },
  { label: 'Security',      href: '#security' },
  { label: 'Features',      href: '#features' },
  { label: 'Testimonials',  href: '#testimonials' },
  { label: 'FAQs',          href: '#faqs' },
];

const FEATURES = [
  { icon: <FileText size={24} />, title: 'Guided Will Builder', desc: 'Five-step wizard through every legal section — assets, beneficiaries, special instructions. No legal knowledge required.' },
  { icon: <Shield size={24} />,   title: 'SHA-256 Integrity',   desc: 'Documents are cryptographically hashed before upload. Any tampering is instantly detected and flagged.' },
  { icon: <Users size={24} />,    title: 'Digital Witnesses',    desc: 'OTP-verified witness signing portal. No physical presence needed — legally compliant digital attestation.' },
  { icon: <Lock size={24} />,     title: 'Registrar Workflow',   desc: 'Government-grade approval pipeline. Registrars review, verify hashes, and issue official Registration IDs.' },
  { icon: <Clock size={24} />,    title: 'Timeline Tracking',    desc: 'Six-phase lifecycle tracker — from creation to execution. Your family always knows the current status.' },
  { icon: <Globe size={24} />,    title: 'Multilingual',         desc: 'Full support for English, Hindi, and Marathi with proper Devanagari rendering via Noto Sans.' },
];

const STEPS = [
  { num: '01', title: 'Register & Verify',  desc: 'Create your account with phone OTP. Two-factor authentication from day one.', color: 'from-navy to-saffron' },
  { num: '02', title: 'Build Your Will',     desc: 'Fill in five guided sections. We handle the legal structure — you provide the intent.', color: 'from-accent-purple to-saffron' },
  { num: '03', title: 'Invite Witnesses',    desc: 'Share secure links. Witnesses verify identity with OTP and sign digitally.', color: 'from-accent-pink to-accent-cyan' },
  { num: '04', title: 'Get Registered',      desc: 'Registrar verifies document integrity and issues an official government Registration ID.', color: 'from-accent-cyan to-accent-green' },
];

const TESTIMONIALS = [
  { name: 'Ramesh Sharma',  city: 'Mumbai',    text: 'WillMaker made an intimidating legal process feel like filling a simple form. My family is now protected with a government-registered will.', avatar: 'RS' },
  { name: 'Priya Nair',     city: 'Bangalore', text: 'The digital witness feature is brilliant. My witnesses signed from different cities — no courier, no notary, no hassle.', avatar: 'PN' },
  { name: 'Arun Mehta',     city: 'Delhi',     text: 'SHA-256 hash verification gives me peace of mind. Nobody can tamper with my documents after submission. This is the future.', avatar: 'AM' },
];

const FAQS = [
  { q: 'Is a digital will legally valid in India?', a: 'Yes. Under the Indian Succession Act, 1925, a will made voluntarily by a person of sound mind is valid. WillMaker provides additional layers of cryptographic verification and government registration.' },
  { q: 'How many witnesses are required?', a: 'A minimum of two witnesses are required. WillMaker provides OTP-verified digital signatures that meet legal standards.' },
  { q: 'Can I modify my will after creation?', a: 'Yes. You can create a new version (codicil) at any time. The timeline tracks all versions chronologically.' },
  { q: 'What happens to my will if WillMaker shuts down?', a: 'All documents are stored on government-grade cloud infrastructure. You always retain a copy of your PDF and hash.' },
];

/* ───────────────────────────────────────────────────────
   REUSABLE COMPONENTS
   ─────────────────────────────────────────────────────── */

function FadeInSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function GlassCard({ children, className = '', hover = true }) {
  return (
    <div className={`
      glass group
      ${hover ? 'hover:bg-white hover:border-slate-200 hover:shadow-glow-sm hover:-translate-y-1' : ''}
      transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  );
}

function GradientBorderCard({ children, className = '' }) {
  return (
    <div className={`gradient-border ${className}`}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────
   LANDING PAGE
   ─────────────────────────────────────────────────────── */

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [faqOpen, setFaqOpen]       = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-slate-50 text-navy min-h-screen font-sans overflow-x-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 bg-noise pointer-events-none z-[1]" />

      {/* ── NAVBAR ──────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-slate-50/80 backdrop-blur-2xl border-b border-slate-200 shadow-lg'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 lg:h-18 flex items-center">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy to-saffron flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
              <Scale size={15} className="text-navy" />
            </div>
            <span className="font-bold text-lg">
              Will<span className="text-gradient">Maker</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1 ml-10">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href}
                className="px-3 py-1.5 text-[13px] font-medium text-slate-500 hover:text-navy rounded-lg hover:bg-white transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <Link to="/login" className="text-[13px] font-medium text-slate-500 hover:text-navy px-4 py-2 rounded-full hover:bg-white transition-all duration-200">
              Login
            </Link>
            <Link to="/register" className="text-[13px] font-semibold text-navy bg-white hover:bg-white border border-slate-200 hover:border-slate-200 px-5 py-2 rounded-full transition-all duration-300 hover:shadow-glow-sm">
              Get Started
            </Link>
          </div>

          <button className="lg:hidden ml-auto text-slate-500 hover:text-navy p-2" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden glass border-t border-slate-200 px-6 py-6 space-y-1 animate-slide-down">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm text-slate-500 hover:text-navy rounded-xl hover:bg-white transition-all">
                {l.label}
              </a>
            ))}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm border border-slate-200 rounded-full text-slate-700 hover:bg-white">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm bg-gradient-to-r from-navy to-saffron text-navy font-semibold rounded-full">Sign Up</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-blue/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-12 items-center gap-12 w-full">
          {/* Left — text */}
          <div className="lg:col-span-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 text-sm">
              <Sparkles size={14} className="text-saffron" />
              <span className="text-slate-700">New: Free Inheritance Calculator</span>
              <ArrowRight size={14} className="text-slate-600" />
            </div>

            <h1 className="text-[3.25rem] sm:text-6xl lg:text-[4.25rem] font-black leading-[1.05] tracking-tight mb-6">
              Secure Your{' '}
              Legacy:{' '}<br className="hidden sm:block" />
              <span className="text-gradient">Online Will{'\n'}Creation</span>{' '}<br className="hidden sm:block" />
              for India.
            </h1>

            <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-lg">
              Easily create legally sound Wills online, specifically designed for Indian laws and regulations. Protect your loved ones and ensure your wishes are honoured.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/register" className="btn-primary text-base px-8 py-4">
                Create Your Will <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn-secondary text-base px-8 py-4">
                <Play size={16} /> How It Works
              </a>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-8 items-center">
              {[
                { value: '50,000+', label: 'Wills Created' },
                { value: '15 min', label: 'Average Time' },
                { value: '99.9%', label: 'Uptime' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-xl font-bold text-navy">{s.value}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating image card */}
          <div className="lg:col-span-6 relative hidden lg:flex justify-center">
            {/* Background glow */}
            <div className="absolute -inset-8 bg-gradient-to-br from-navy/10 via-accent-purple/10 to-saffron/5 rounded-[2.5rem] blur-2xl" />

            {/* Main image card */}
            <div className="relative animate-float">
              <div className="gradient-border rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-1">
                  <img
                    src="/family.png"
                    alt="Happy Indian family"
                    className="w-full h-[480px] object-cover rounded-[1.25rem]"
                  />
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -bottom-4 -left-8 glass-strong rounded-2xl p-4 shadow-glass animate-slide-up max-w-[260px]" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-navy font-semibold text-sm">Will Registered</p>
                    <p className="text-slate-600 text-xs">REG-2026-482931</p>
                  </div>
                </div>
              </div>

              {/* Floating hash badge */}
              <div className="absolute -top-3 -right-6 glass-strong rounded-xl px-4 py-2.5 shadow-glass animate-slide-down" style={{ animationDelay: '1.2s' }}>
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-navy" />
                  <span className="text-xs font-mono text-slate-700">SHA-256 Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 animate-pulse">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-gray-700 flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-gray-600 rounded-full animate-slide-down" />
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────── */}
      <div className="border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap justify-center items-center gap-x-10 gap-y-3 text-slate-600 text-[13px]">
          {['Government Approved', 'SHA-256 Encrypted', 'Indian Succession Act', 'ISO 27001 Ready', 'DigiLocker Compatible'].map(t => (
            <div key={t} className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-500/60" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how-it-works" className="py-28 relative">
        <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <FadeInSection className="text-center mb-20">
            <p className="section-tag mb-4">Simple Process</p>
            <h2 className="section-title mb-4">Four steps to peace of mind.</h2>
            <p className="section-desc mx-auto">No lawyers. No paperwork. No office visits. Create your government-registered will from your phone in under 15 minutes.</p>
          </FadeInSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <FadeInSection key={s.num} delay={i * 100}>
                <GlassCard className="p-6 h-full">
                  <div className={`text-[2.5rem] font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent leading-none mb-4`}>
                    {s.num}
                  </div>
                  <h3 className="text-navy font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                </GlassCard>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section id="features" className="py-28 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInSection className="text-center mb-20">
            <p className="section-tag mb-4">Platform</p>
            <h2 className="section-title mb-4">Everything you need. Nothing you don't.</h2>
            <p className="section-desc mx-auto">Built for Indian citizens, by Indian engineers. Every feature is designed around the legal requirements of the Indian Succession Act.</p>
          </FadeInSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FadeInSection key={f.title} delay={i * 80}>
                <GlassCard className="p-7 h-full">
                  <div className="text-navy mb-5 group-hover:text-saffron transition-colors duration-300">
                    {f.icon}
                  </div>
                  <h3 className="text-navy font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                </GlassCard>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ────────────────────────────────────── */}
      <section id="security" className="py-28 relative">
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-slate-100 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeInSection>
              <p className="section-tag mb-4">Security</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6 leading-tight">
                Your documents.<br />
                <span className="text-gradient">Completely secure.</span>
              </h2>
              <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                Every Will is encrypted end-to-end, hashed with SHA-256, and stored with role-based access. We take your family's future as seriously as you do.
              </p>
              <div className="space-y-5">
                {[
                  { icon: <Shield size={18} />,  title: 'SHA-256 Hash Verification',  desc: 'Every PDF hashed before upload. Tampering instantly detected.' },
                  { icon: <Lock size={18} />,     title: 'Phone OTP Authentication',   desc: 'Two-factor access via Firebase for all user roles.' },
                  { icon: <Eye size={18} />,      title: 'Role-Based Access',          desc: 'Citizens, Witnesses, Registrars — siloed permissions.' },
                  { icon: <Zap size={18} />,      title: 'Encrypted Cloud Storage',    desc: 'Google Firebase with server-side encryption at rest.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-navy group-hover:shadow-glow-sm transition-shadow shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-navy font-semibold text-sm mb-0.5">{item.title}</p>
                      <p className="text-slate-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInSection>

            <FadeInSection delay={200}>
              <GradientBorderCard className="p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600 mb-6">Live Document Audit Trail</p>
                <div className="space-y-4">
                  {[
                    { step: 'Document Created',        status: 'done',   time: '10:02 AM' },
                    { step: 'SHA-256 Hash Generated',   status: 'done',   time: '10:02 AM' },
                    { step: 'Uploaded to Vault',        status: 'done',   time: '10:03 AM' },
                    { step: 'Witness 1 Signed',         status: 'done',   time: '2:15 PM'  },
                    { step: 'Witness 2 Signed',         status: 'done',   time: '4:30 PM'  },
                    { step: 'Registrar Reviewing',      status: 'active', time: 'Now'      },
                    { step: 'Registration ID Issued',   status: 'locked', time: '—'        },
                  ].map(row => (
                    <div key={row.step} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        row.status === 'done'   ? 'bg-emerald-500/20 border border-emerald-500/30' :
                        row.status === 'active' ? 'bg-slate-100 border border-slate-200 animate-pulse' :
                        'bg-white border border-slate-200'
                      }`}>
                        {row.status === 'done'   && <CheckCircle2 size={12} className="text-emerald-400" />}
                        {row.status === 'active' && <Clock size={11} className="text-navy" />}
                        {row.status === 'locked' && <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />}
                      </div>
                      <span className={`text-sm flex-1 ${row.status === 'locked' ? 'text-slate-500' : 'text-slate-700'}`}>{row.step}</span>
                      <span className={`text-xs font-mono ${row.status === 'active' ? 'text-navy' : 'text-slate-500'}`}>{row.time}</span>
                    </div>
                  ))}
                </div>
              </GradientBorderCard>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────── */}
      <section id="testimonials" className="py-28 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInSection className="text-center mb-20">
            <p className="section-tag mb-4">Social Proof</p>
            <h2 className="section-title mb-4">Trusted by families across India.</h2>
          </FadeInSection>

          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <FadeInSection key={t.name} delay={i * 100}>
                <GlassCard className="p-7 h-full flex flex-col">
                  <div className="flex gap-1 mb-5">
                    {Array(5).fill(0).map((_, j) => (
                      <Star key={j} size={14} fill="#A78BFA" className="text-saffron" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-6 flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy/20 to-saffron/20 flex items-center justify-center text-xs font-bold text-navy border border-slate-200">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-navy font-semibold text-sm">{t.name}</p>
                      <p className="text-slate-600 text-xs">{t.city}</p>
                    </div>
                  </div>
                </GlassCard>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ────────────────────────────────────────── */}
      <section id="faqs" className="py-28 relative">
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-slate-100 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6">
          <FadeInSection className="text-center mb-16">
            <p className="section-tag mb-4">FAQs</p>
            <h2 className="section-title mb-4">Common questions.</h2>
          </FadeInSection>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FadeInSection key={i} delay={i * 80}>
                <div className="glass rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white transition-colors"
                  >
                    <span className="font-semibold text-navy text-sm pr-4">{faq.q}</span>
                    <ChevronRight
                      size={16}
                      className={`text-slate-600 transition-transform duration-300 shrink-0 ${faqOpen === i ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {faqOpen === i && (
                    <div className="px-6 pb-5 animate-slide-down">
                      <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────── */}
      <section className="py-28 px-6">
        <FadeInSection>
          <div className="max-w-5xl mx-auto relative">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-navy/5 via-accent-purple/10 to-saffron/5 rounded-[2.5rem] blur-2xl" />
            <div className="relative gradient-border rounded-3xl overflow-hidden">
              <div className="bg-slate-50 backdrop-blur-xl px-8 sm:px-16 py-16 sm:py-20 text-center">
                <p className="section-tag mb-4">Get Started</p>
                <h2 className="text-4xl sm:text-5xl font-black mb-5 leading-tight">
                  Protect your family's future.
                </h2>
                <p className="text-slate-500 text-lg mb-10 max-w-lg mx-auto">
                  Join 50,000+ Indian families who have already secured their legacy with WillMaker.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/register" className="btn-primary text-base px-10 py-4">
                    Create Your Free Will <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn-secondary text-base px-8 py-4">
                    Already registered? Login <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-navy to-saffron flex items-center justify-center">
                <Scale size={13} className="text-navy" />
              </div>
              <span className="font-bold text-navy">WillMaker</span>
            </div>
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} WillMaker · Government of India Initiative
            </p>
            <div className="flex gap-6 text-sm">
              {['Privacy', 'Terms', 'Contact'].map(l => (
                <a key={l} href="#" className="text-slate-600 hover:text-navy transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

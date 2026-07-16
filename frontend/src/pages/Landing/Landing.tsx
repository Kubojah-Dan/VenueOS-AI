import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Shield,
  Users,
  Map,
  ArrowRight,
  Zap,
  Globe,
  Terminal,
  Leaf,
  MessageSquare,
  Upload,
  ChevronRight,
} from 'lucide-react';

// ── Animated Counter ──────────────────────────────────────────────────────
const AnimatedCounter = ({ end, suffix = '', decimals = 0 }: { end: number; suffix?: string; decimals?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = end / (duration / step);
    const timer = setInterval(() => {
      start = Math.min(start + increment, end);
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <span ref={ref}>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}{suffix}
    </span>
  );
};

// ── Telemetry log colors ───────────────────────────────────────────────────
const LOG_COLORS: Record<string, string> = {
  SYSTEM:         '#94a3b8',
  SENSOR:         '#60a5fa',
  API:            '#2dd4bf',
  AI:             '#c084fc',
  INCIDENT:       '#f87171',
  SUSTAINABILITY: '#34d399',
  SECURITY:       '#fb923c',
  CROWD:          '#fbbf24',
  DATABASE:       '#a3e635',
};

const getLogColor = (line: string): string => {
  for (const key of Object.keys(LOG_COLORS)) {
    if (line.startsWith(key)) return LOG_COLORS[key];
  }
  return '#64748b';
};

// ── Feature cards data ────────────────────────────────────────────────────
const features = [
  {
    icon: Users,
    color: '#10b981',
    colorBg: 'rgba(16,185,129,0.12)',
    title: 'Crowd Telemetry & Routing',
    desc: 'Sensing gate queue thresholds and predicting transit bottlenecks. Updates wayfinding maps dynamically to optimize flow velocities across all sectors.'
  },
  {
    icon: Shield,
    color: '#f59e0b',
    colorBg: 'rgba(245,158,11,0.12)',
    title: 'Incident Dispatch Center',
    desc: 'Log medical, security, or facilities dispatches. Dynamic maps track incident zones and output AI mitigation scripts instantly.'
  },
  {
    icon: Zap,
    color: '#14b8a6',
    colorBg: 'rgba(20,184,166,0.12)',
    title: 'Smart Grid & Sustainability',
    desc: 'Real-time energy monitoring, solar contribution tracking, carbon offsets, and water consumption analytics in one dashboard.'
  },
  {
    icon: MessageSquare,
    color: '#8b5cf6',
    colorBg: 'rgba(139,92,246,0.12)',
    title: 'AI Command Assistant',
    desc: 'Context-aware Groq-powered LLM agent answers operational queries, suggests crowd routing, and drafts PA announcements.'
  },
  {
    icon: Map,
    color: '#60a5fa',
    colorBg: 'rgba(96,165,250,0.12)',
    title: 'Navigation & Wayfinding',
    desc: 'Interactive Leaflet maps with stadium sectors, accessibility routes, and live gate congestion overlays.'
  },
  {
    icon: Upload,
    color: '#fb923c',
    colorBg: 'rgba(251,146,60,0.12)',
    title: 'Data Ingestion Engine',
    desc: 'Upload CSV, Excel, or JSON datasets. All dashboards, AI suggestions, and reports sync in seconds via Socket.IO.'
  },
];

// ── Slate palette constants (matches dashboard dark mode) ─────────────────
const SL = {
  base:      '#0f172a',   // slate-900  — page background
  panel:     '#1e293b',   // slate-800  — cards, panels
  card:      '#1e293b',   // slate-800
  deepCard:  '#0f172a',   // slate-900  — inner-card bg
  border:    'rgba(51,65,85,0.65)',   // slate-700
  borderHov: 'rgba(51,65,85,1.00)',
  textPrim:  '#f1f5f9',   // slate-100
  textSec:   '#94a3b8',   // slate-400
  textMuted: '#475569',   // slate-600
  navBg:     'rgba(15,23,42,0.88)',
  termBg:    '#0b1120',
};

// ── Main Component ────────────────────────────────────────────────────────
export const Landing: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    'SYSTEM [09:12:01]: Initializing VenueOS telemetry ingestion node...',
    'SENSOR [09:12:02]: Calibrating Gate A-D ingress optical sensors...',
    'API [09:12:04]: OpenWeatherMap telemetry connected — Doha 39°C Clear',
    'DATABASE [09:12:05]: Firebase collections successfully bound.',
    'CROWD [09:12:08]: Gate A flow rate nominal (320 ppm).',
  ]);

  useEffect(() => {
    const events = [
      'CROWD [09:12:15]: Gate A flow rate spike detected (450 ppm)',
      'AI [09:12:22]: Re-routing queue models via North Walkways',
      'SUSTAINABILITY [09:12:35]: Solar contribution peaked at 38.6%',
      'INCIDENT [09:12:48]: Category: Medical reported at Gate C Concourse',
      'API [09:13:02]: Football-Data match index synchronized — 104 fixtures',
      'SECURITY [09:13:14]: Volunteer dispatched to Gate C — ETA 2.5m',
      'AI [09:13:20]: P.A. Announcement drafted: "Queue Re-route North"',
      'SENSOR [09:13:31]: Sector East occupancy: 91.3% — CONGESTED alert',
    ];
    let cursor = 0;
    const timer = setInterval(() => {
      setLogs(prev => [...prev.slice(-6), events[cursor]]);
      cursor = (cursor + 1) % events.length;
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col font-sans relative overflow-hidden"
      style={{ background: SL.base, color: SL.textPrim }}
    >
      {/* ── Background layers ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none animate-slow-zoom z-0"
        style={{
          backgroundImage: "url('/stadium_bg.png'), url('/stadium_bg.jpg'), url('/stadium.jpg')",
          opacity: 0.045,
        }}
      />
      {/* Emerald glow top-left */}
      <div className="absolute top-[-15%] left-[-15%] w-[55%] aspect-square rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(28,62,53,0.22) 0%, transparent 70%)' }} />
      {/* Teal glow bottom-right */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] aspect-square rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.06]"
        style={{ backgroundImage: 'linear-gradient(to right, #33415540 1px, transparent 1px), linear-gradient(to bottom, #33415540 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <header
        className="sticky top-3 mx-3 sm:mx-6 mt-3 z-50 rounded-2xl border flex items-center justify-between px-4 sm:px-6 h-14"
        style={{
          background: SL.navBg,
          backdropFilter: 'blur(16px)',
          borderColor: SL.border,
          boxShadow: '0 4px 24px rgba(0,0,0,0.50)',
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full border flex items-center justify-center p-1 shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: SL.border }}>
            <img src="/logos/logo.png" alt="VenueOS AI" className="w-full h-full object-contain animate-spin-slow" />
          </div>
          <div>
            <span className="text-xs font-black tracking-tight text-emerald-400 block leading-none uppercase">VenueOS AI</span>
            <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: SL.textMuted }}>World Cup 2026</span>
          </div>
        </div>
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <a href="#features" className="hidden sm:inline text-xs font-semibold transition-colors" style={{ color: SL.textMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = SL.textPrim)}
            onMouseLeave={e => (e.currentTarget.style.color = SL.textMuted)}>
            Features
          </a>
          <Link to="/login" className="text-xs font-semibold transition-colors" style={{ color: SL.textSec }}
            onMouseEnter={e => (e.currentTarget.style.color = SL.textPrim)}
            onMouseLeave={e => (e.currentTarget.style.color = SL.textSec)}>
            Sign In
          </Link>
          <Link
            to="/dashboard/overview"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1c3e35, #0e1f1b)', border: '1px solid rgba(16,185,129,0.30)' }}
          >
            <span>Launch Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-14 sm:py-20 md:py-28 text-center z-10 space-y-10 sm:space-y-14">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-bold border"
          style={{ background: 'rgba(28,62,53,0.18)', borderColor: 'rgba(16,185,129,0.28)', color: '#34d399' }}
        >
          <Globe className="w-3.5 h-3.5 animate-spin-slow" />
          <span>FIFA WORLD CUP 2026 · ACTIVE SECURITY SPECIFICATION</span>
        </motion.div>

        {/* Headline */}
        <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-wide leading-tight font-graffiti select-none"
            style={{ color: SL.textPrim }}
          >
            The Intelligent<br />
            <span style={{
              background: 'linear-gradient(135deg, #34d399, #14b8a6, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.35))',
            }}>
              Stadium OS
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium"
            style={{ color: SL.textSec }}
          >
            An event-driven intelligence hub mapping crowd kinetics, automating medical dispatch logs, visualizing micro-grid solar consumption, and running context-aware AI support agents — built for FIFA World Cup 2026.
          </motion.p>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            to="/dashboard/overview"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-white w-full sm:w-auto justify-center transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #1c3e35, #10b981)', boxShadow: '0 8px 24px rgba(16,185,129,0.22)' }}
          >
            <span>Launch Operator Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold w-full sm:w-auto justify-center transition-all border hover:-translate-y-0.5"
            style={{ borderColor: SL.border, color: SL.textSec, background: 'rgba(30,41,59,0.50)' }}
          >
            <span>Explore Features</span>
          </a>
        </motion.div>

        {/* ── HERO DEMO PANEL ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.45 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 max-w-5xl mx-auto pt-4 text-left"
        >
          {/* Left: Console KPIs + mini map */}
          <div
            className="lg:col-span-3 rounded-2xl p-4 sm:p-5 flex flex-col space-y-4 border overflow-hidden relative"
            style={{ background: SL.panel, borderColor: SL.border, boxShadow: '0 8px 32px rgba(0,0,0,0.50)' }}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(28,62,53,0.07) 0%, transparent 60%)' }} />

            <div className="flex justify-between items-center pb-2 border-b relative" style={{ borderColor: SL.border }}>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold tracking-wider" style={{ color: SL.textSec }}>LUSAIL OPERATIONS CORE</span>
              </div>
              <span className="text-[9px] font-semibold" style={{ color: SL.textMuted }}>CLASS-A SECURITY</span>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 relative">
              {[
                { label: 'Total Occupancy', value: '78,912', sub: '98.6% Capacity', color: '#34d399' },
                { label: 'Active Incidents', value: '02', sub: 'Queue C, Food Court A', color: '#f59e0b' },
                { label: 'Renewable Power', value: '38.6%', sub: 'Solar — Grid Ready', color: '#2dd4bf' },
              ].map((kpi, i) => (
                <div key={i} className="rounded-xl p-2.5 sm:p-3 flex flex-col justify-between border"
                  style={{ background: SL.deepCard, borderColor: SL.border }}>
                  <span className="text-[8px] font-bold uppercase tracking-wider mb-1" style={{ color: SL.textMuted }}>{kpi.label}</span>
                  <span className="text-base sm:text-xl font-bold block" style={{ color: kpi.color }}>{kpi.value}</span>
                  <span className="text-[8px] font-semibold block mt-0.5" style={{ color: SL.textMuted }}>{kpi.sub}</span>
                </div>
              ))}
            </div>

            {/* Mini radar map */}
            <div className="h-20 sm:h-28 rounded-xl border flex items-center justify-center relative overflow-hidden"
              style={{ background: 'rgba(28,62,53,0.06)', borderColor: 'rgba(28,62,53,0.20)' }}>
              {[64, 36, 18].map((size, i) => (
                <div key={i}
                  className="absolute rounded-full border border-emerald-500/20 animate-pulse"
                  style={{ width: size * 2, height: size * 2, animationDelay: `${i * 0.5}s`, opacity: 0.6 - i * 0.15 }} />
              ))}
              <div className="w-3 h-3 rounded-full bg-emerald-500 z-10" />
              <span className="absolute bottom-2 right-3 text-[8px] font-mono" style={{ color: SL.textMuted }}>25.4208° N, 51.4886° E</span>
            </div>
          </div>

          {/* Right: Telemetry Stream */}
          <div
            className="lg:col-span-2 rounded-2xl p-4 sm:p-5 flex flex-col space-y-3 border font-mono"
            style={{ background: SL.panel, borderColor: SL.border, boxShadow: '0 8px 32px rgba(0,0,0,0.50)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: SL.border }}>
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] font-bold" style={{ color: SL.textSec }}>TELEMETRY STREAM</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
                LIVE
              </span>
            </div>
            <div className="flex-1 rounded-xl p-3 border text-[9px] leading-relaxed space-y-1.5 overflow-y-auto max-h-[180px] sm:max-h-[230px]"
              style={{ background: SL.termBg, borderColor: SL.border }}>
              {logs.map((log, idx) => (
                <div key={idx} style={{ color: getLogColor(log) }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── STATS BAR ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          {[
            { value: 104, suffix: '', label: 'Fixtures Tracked', decimals: 0 },
            { value: 80000, suffix: '+', label: 'Fan Capacity', decimals: 0 },
            { value: 38.6, suffix: '%', label: 'Solar Contribution', decimals: 1 },
            { value: 99.2, suffix: '%', label: 'System Uptime', decimals: 1 },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl p-3 sm:p-4 text-center border"
              style={{ background: 'rgba(30,41,59,0.55)', borderColor: SL.border }}>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
              </div>
              <div className="text-[10px] font-semibold mt-0.5" style={{ color: SL.textMuted }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

      </main>

      {/* ── FEATURES SECTION ─────────────────────────────────────────────── */}
      <section id="features" className="z-10 py-16 sm:py-24 border-t"
        style={{ borderColor: SL.border, background: 'rgba(15,23,42,0.90)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">System Pillars</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-graffiti select-none" style={{ color: SL.textPrim }}>
              Full Stadium Control Suite
            </h2>
            <p className="text-sm" style={{ color: SL.textSec }}>
              Six integrated modules that power every aspect of stadium operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group rounded-2xl p-5 sm:p-6 border transition-all duration-300 cursor-default"
                  style={{ background: SL.panel, borderColor: SL.border }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = feat.color + '40';
                    el.style.background = '#263248';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = SL.border;
                    el.style.background = SL.panel;
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{ background: feat.colorBg, color: feat.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold mb-2 text-sm" style={{ color: SL.textPrim }}>{feat.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: SL.textMuted }}>{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="z-10 py-12 sm:py-16 border-t" style={{ borderColor: SL.border }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-bold border"
            style={{ background: 'rgba(28,62,53,0.15)', borderColor: 'rgba(16,185,129,0.22)', color: '#34d399' }}>
            <Leaf className="w-3 h-3" />
            <span>FIFA WORLD CUP 2026 · POWERED BY VenueOS AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: SL.textPrim }}>
            Ready to command the stadium?
          </h2>
          <p className="text-sm" style={{ color: SL.textSec }}>
            Sign in with your operator credentials or launch the guest preview to explore the full platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center"
              style={{ background: 'linear-gradient(135deg, #1c3e35, #10b981)', boxShadow: '0 8px 20px rgba(16,185,129,0.20)' }}
            >
              <span>Operator Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard/overview"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all border hover:-translate-y-0.5 w-full sm:w-auto justify-center"
              style={{ borderColor: SL.border, color: SL.textSec, background: 'rgba(30,41,59,0.50)' }}
            >
              <span>Guest Preview</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="z-10 border-t py-8 text-center" style={{ background: SL.base, borderColor: SL.border }}>
        <p className="text-xs font-medium" style={{ color: SL.textMuted }}>
          © 2026 FIFA World Cup Venue Operations Consortium · All rights reserved.
        </p>
        <p className="text-[10px] mt-1" style={{ color: SL.textMuted, opacity: 0.6 }}>
          Powered by VenueOS AI Engine · Groq Llama 3.3 · Firebase Cloud · Socket.IO
        </p>
      </footer>
    </div>
  );
};
export default Landing;

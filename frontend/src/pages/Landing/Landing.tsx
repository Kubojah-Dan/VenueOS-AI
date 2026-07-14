import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Activity,
  Users,
  Map,
  ArrowRight,
  Zap,
  Globe,
  Database,
  Terminal,
  Sun,
  Flame,
  UserPlus
} from 'lucide-react';

export const Landing: React.FC = () => {
  // Simulated realtime log terminal feed
  const [logs, setLogs] = useState<string[]>([
    'SYSTEM [09:12:01]: Initializing VenueOS telemetry ingestion node...',
    'SENSOR [09:12:02]: Calibrating Gate A-D ingress optical sensors...',
    'API [09:12:04]: OpenWeatherMap telemetry connected - Doha 32°C Clear',
    'DATABASE [09:12:05]: Firestore collections successfully bound.'
  ]);

  useEffect(() => {
    const events = [
      'CROWD [09:12:15]: Gate A flow rate spike detected (450 ppm)',
      'AI [09:12:22]: Re-routing queue models via North Walkways',
      'SUSTAINABILITY [09:12:35]: Solar contribution peaked at 38.6%',
      'INCIDENT [09:12:48]: Category: Medical reported at Gate C Concourse',
      'API [09:13:02]: Football-Data match index synchronized successfully',
      'SECURITY [09:13:14]: Volunteer dispatched to Gate C - ETA 2.5m',
      'AI [09:13:20]: Broadcaster trigger: "P.A. Announcement Queue Re-route"'
    ];

    let cursor = 0;
    const timer = setInterval(() => {
      setLogs((prev) => [...prev.slice(-5), events[cursor]]);
      cursor = (cursor + 1) % events.length;
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#070b0d] text-gray-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* GLOWING AMBIENT GRADIENTS (Premium Vercel-style background glow) */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] aspect-square rounded-full bg-forest-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      
      {/* GRID OVERLAY */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />

      {/* NAVBAR */}
      <header className="flex h-16 items-center justify-between border-b border-gray-800/40 bg-[#070b0d]/75 backdrop-blur-md px-6 md:px-12 z-50 sticky top-0">
        <div className="flex items-center space-x-2">
          <img src="/logos/logo.png" alt="VenueOS AI Logo" className="w-8 h-8 rounded-lg object-contain border border-gray-800" />
          <div>
            <span className="text-sm font-bold tracking-tight text-forest-400 block leading-none">VenueOS AI</span>
            <span className="text-[9px] text-gray-500 font-semibold tracking-wider uppercase">World Cup Console</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/dashboard/overview"
            className="px-4 py-1.5 bg-forest-500 hover:bg-forest-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-forest-500/15 transition-all"
          >
            Launch Console
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 text-center z-10 space-y-12">
        
        {/* PROTOCOL HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 py-1 bg-forest-500/10 border border-forest-500/20 text-forest-400 rounded-full text-[10px] font-bold"
        >
          <Globe className="w-3.5 h-3.5 animate-spin-slow text-forest-400" />
          <span>FIFA WORLD CUP 2026 ACTIVE SECURITY SPECIFICATION</span>
        </motion.div>

        {/* HERO TITLE */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-6xl font-bold tracking-tight text-white leading-tight"
          >
            The Intelligent Operating System <br />
            <span className="bg-gradient-to-r from-forest-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              for Smart Stadiums
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            An event-driven intelligence hub mapping crowd kinetics, automating medical dispatch logs, visualizing micro-grid solar consumption, and running context-aware AI support agents.
          </motion.p>
        </div>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center space-x-4"
        >
          <Link
            to="/dashboard/overview"
            className="flex items-center space-x-2 px-6 py-3 bg-forest-500 hover:bg-forest-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-forest-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <span>Launch Operator Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all"
          >
            Operational Pillars
          </a>
        </motion.div>

        {/* SHOWCASE PLATFORM MOCKUP AND LIVE STREAM */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl mx-auto pt-6 text-left"
        >
          {/* LEFT PANEL: VISUAL STADIUM CONSOLE */}
          <div className="lg:col-span-3 border border-white/10 bg-[#0c1214] rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col space-y-4">
            <div className="absolute inset-0 bg-gradient-to-tr from-forest-500/5 to-transparent pointer-events-none" />
            
            {/* Header console mock */}
            <div className="flex justify-between items-center pb-2 border-b border-white/5 text-[9px] font-bold text-gray-500">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-gray-300">LUSAIL OPERATIONS CORE</span>
              </div>
              <span>SECURITY LEVEL: CLASS-A</span>
            </div>

            {/* Grid display inside console */}
            <div className="grid grid-cols-3 gap-3 flex-1">
              <div className="bg-[#11191c] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Total Occupancy</span>
                <span className="text-xl font-bold text-forest-400 block mt-1">78,912</span>
                <span className="text-[8px] text-emerald-500 font-semibold block">98.6% Capacity reached</span>
              </div>
              <div className="bg-[#11191c] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Security Dispatches</span>
                <span className="text-xl font-bold text-amber-500 block mt-1">02 / Active</span>
                <span className="text-[8px] text-gray-400 font-semibold block">Queue C & Food Court A</span>
              </div>
              <div className="bg-[#11191c] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Renewable Power</span>
                <span className="text-xl font-bold text-teal-400 block mt-1">38.6% Solar</span>
                <span className="text-[8px] text-teal-500 font-semibold block">Grid feed backup ready</span>
              </div>
            </div>

            {/* Simulated Map View mock */}
            <div className="h-28 bg-[#11191c]/50 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-grid opacity-30" />
              <div className="w-16 h-16 rounded-full border border-forest-500/20 bg-forest-500/5 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-forest-500/40 bg-forest-500/10 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-forest-400"></span>
                </div>
              </div>
              <span className="absolute bottom-2 right-3 text-[8px] font-mono text-gray-500">25.4208° N, 51.4886° E</span>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE TELEMETRY STREAM TERMINAL */}
          <div className="lg:col-span-2 border border-white/10 bg-[#0c1214] rounded-2xl p-4 shadow-2xl flex flex-col space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-forest-400" />
                <span className="text-[10px] font-bold text-gray-300">TELEMETRY INGESTION STREAM</span>
              </div>
              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-bold rounded">LIVE FEED</span>
            </div>

            <div className="flex-1 bg-[#090e0f] rounded-xl p-3 border border-white/5 text-[9px] text-gray-400 space-y-2 overflow-y-auto max-h-[220px]">
              {logs.map((log, idx) => {
                let color = 'text-gray-400';
                if (log.startsWith('SENSOR')) color = 'text-blue-400';
                if (log.startsWith('API')) color = 'text-teal-400';
                if (log.startsWith('AI')) color = 'text-purple-400';
                if (log.startsWith('INCIDENT')) color = 'text-red-400';
                if (log.startsWith('SUSTAINABILITY')) color = 'text-emerald-400';

                return (
                  <div key={idx} className={`${color} leading-normal`}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

      </main>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="bg-[#0b1012] border-t border-gray-800/40 py-20 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-bold text-forest-400 uppercase tracking-widest">System Pillars</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white">Full Stadium Control Suite</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#0c1214] border border-white/5 rounded-2xl p-6 hover:border-forest-500/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-forest-500/10 flex items-center justify-center text-forest-400 mb-4 group-hover:bg-forest-500 group-hover:text-white transition-all">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white mb-2">Crowd Telemetry & Routing</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Sensing gate queue thresholds and predicting transit bottlenecks. Updates wayfinding maps dynamically to optimize flow velocities.
              </p>
            </div>

            <div className="bg-[#0c1214] border border-white/5 rounded-2xl p-6 hover:border-forest-500/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white mb-2">Incident Dispatch Center</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Log medical, security, or facility dispatches. Dynamic maps track incident zones and output AI mitigation scripts instantly.
              </p>
            </div>

            <div className="bg-[#0c1214] border border-white/5 rounded-2xl p-6 hover:border-forest-500/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4 group-hover:bg-teal-500 group-hover:text-white transition-all">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white mb-2">Event-Driven Automation</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Upload CSV or Excel schedules, match results, or solar logs. All databases, dashboards, and AI suggestions sync in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800/40 bg-[#070b0d] py-12 text-center text-xs text-gray-500 z-10 space-y-1">
        <p>&copy; 2026 FIFA World Cup Venue Operations Consortium. All rights reserved.</p>
        <p className="text-[10px] text-gray-600 font-medium">Powered by VenueOS AI Engine (Groq Llama 3.3 / Firebase Cloud Admin SDK)</p>
      </footer>

    </div>
  );
};
export default Landing;

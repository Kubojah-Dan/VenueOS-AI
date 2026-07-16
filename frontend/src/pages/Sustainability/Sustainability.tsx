import React, { useState } from 'react';
import { useApp } from '../../app/providers';
import { API_URL } from '../../config';
import { Leaf, Zap, Droplet, Trash2, Sparkles, CheckSquare, Square, RefreshCw, Trophy, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

interface EcoAction {
  id: string;
  label: string;
  points: number;
  offsetKg: number;
  ticked: boolean;
}

export const Sustainability: React.FC = () => {
  const { sustainability } = useApp();

  // Spectator Gamification checklist
  const [actions, setActions] = useState<EcoAction[]>([
    { id: 'act1', label: 'Took Metro Train to Lusail Stadium', points: 40, offsetKg: 3.2, ticked: true },
    { id: 'act2', label: 'Recycled plastics/cans at Smart Bin', points: 15, offsetKg: 0.5, ticked: false },
    { id: 'act3', label: 'Walked or used step-free routing', points: 20, offsetKg: 1.0, ticked: true },
    { id: 'act4', label: 'Purchased plant-based food concourse', points: 25, offsetKg: 1.8, ticked: false },
    { id: 'act5', label: 'Used water refill stations', points: 10, offsetKg: 0.4, ticked: false }
  ]);

  // AI Sustainability Coach state
  const [aiTip, setAiTip] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const toggleAction = (id: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, ticked: !a.ticked } : a));
  };

  // Calculations
  const totalPoints = actions.reduce((acc, curr) => acc + (curr.ticked ? curr.points : 0), 0);
  const totalOffset = Number(actions.reduce((acc, curr) => acc + (curr.ticked ? curr.offsetKg : 0), 0).toFixed(1));

  // Determine Badge based on points
  const getBadge = (pts: number) => {
    if (pts >= 80) return { name: 'Carbon Crusher Pro', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25' };
    if (pts >= 40) return { name: 'Eco Explorer', color: 'text-blue-500 bg-blue-500/10 border-blue-500/25' };
    return { name: 'Green Recruit', color: 'text-gray-400 bg-gray-100 dark:bg-graphite-800 border-gray-200' };
  };

  const activeBadge = getBadge(totalPoints);

  // Transit split representation
  const transitData = Object.entries(sustainability.transportModes).map(([mode, pct]) => ({
    name: mode === 'busShuttle' ? 'Shuttle Bus' : mode === 'personalCar' ? 'Private Car' : mode.toUpperCase(),
    percentage: pct
  }));

  const sustainabilityTips = [
    { title: 'LED Floodlight Regulation', text: 'Stadium lighting arrays are regulated dynamically. Dimming zones are configured for unoccupied seating sections, saving 140 kW grid demand.' },
    { title: 'Chiller Load Shedding', text: 'Concourse air chillers are shifted to recycled water buffers during peak arrivals, reducing grid stress by 18.5%.' },
    { title: 'Greywater Reclamation', text: 'Rainwater collector cells are redirecting 42% reclaimed greywater to toilet flush fixtures in Sectors North and South.' }
  ];

  // Request custom AI coaching
  const handleGetAICoach = async () => {
    setIsGenerating(true);
    setAiTip('CONSULTING ECO AI AGENT IN REAL TIME...');

    try {
      const activeActionsStr = actions.filter(a => a.ticked).map(a => a.label).join(', ');
      const query = `You are a friendly Stadium Eco-Coach at World Cup 2026.
The fan has logged these green actions today: [${activeActionsStr || 'None yet'}].
They currently have earned ${totalPoints} points and offset ${totalOffset} kg of CO2.
Suggest 2 personalized sustainability tips to reduce their carbon footprint further during the match.
Keep your response under 50 words and extremely encouraging.`;

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, role: 'Fan' })
      });

      if (res.ok) {
        const data = await res.json();
        setAiTip(data.response.trim());
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      setAiTip('Tip: Opt for public transport loops like the Metro Red Line to avoid emissions, and utilize recycling smart bins in the main concourse.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* SUSTAINABILITY SUBHEADER */}
      <div className="flex justify-between items-center premium-card p-4">
        <div>
          <h2 className="text-base font-bold text-gray-850 dark:text-white">Stadium Grid Telemetry & Ecological Metrics</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Real-time smart grid tracking, water reclamation, and spectator transportation choices</p>
        </div>
      </div>

      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SOLAR PROGRESS CARD */}
        <div className="premium-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Renewable Solar Grid</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-gray-800 dark:text-white">{sustainability.solarContributionPercent}%</span>
            <span className="text-[10px] text-gray-400 font-semibold block">Solar array contribution to main grid</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-graphite-850 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full"
              style={{ width: `${sustainability.solarContributionPercent}%` }}
            ></div>
          </div>
        </div>

        {/* WATER RECLAIM CARD */}
        <div className="premium-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Water Conservation</span>
            <Droplet className="w-4 h-4 text-blue-500" />
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-gray-800 dark:text-white">{sustainability.reclaimedWaterPercent}%</span>
            <span className="text-[10px] text-gray-400 font-semibold block">Reclaimed water for secondary flush routes</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-graphite-850 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${sustainability.reclaimedWaterPercent}%` }}
            ></div>
          </div>
        </div>

        {/* WASTE RECOVERY CARD */}
        <div className="premium-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Waste Recycled</span>
            <Trash2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-gray-800 dark:text-white">{sustainability.recyclingRatePercent}%</span>
            <span className="text-[10px] text-gray-400 font-semibold block">Organic waste routed to local compost</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-graphite-850 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${sustainability.recyclingRatePercent}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* GAMIFIED GREEN FAN SCORECARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SCORECARD CHECKLIST */}
        <div className="lg:col-span-2 premium-card p-5 space-y-4">
          <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Green Fan Scorecard</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Tally actions below to offset carbon footprint in real time</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>{totalPoints} Eco-Pts</span>
                <span className="text-[9px] text-gray-400 font-semibold block">Offsets: {totalOffset} kg CO₂</span>
              </div>
              <span className={`px-2.5 py-1.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider flex items-center space-x-1 ${activeBadge.color}`}>
                <Trophy className="w-3 h-3" />
                <span>{activeBadge.name}</span>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {actions.map((act) => (
              <div
                key={act.id}
                onClick={() => toggleAction(act.id)}
                className="flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:bg-gray-55/40 dark:hover:bg-graphite-855/40 transition-colors"
                style={{ borderColor: 'var(--border-default)', background: 'var(--bg-panel)' }}
              >
                <div className="flex items-center space-x-3">
                  {act.ticked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-450 dark:text-gray-600" />
                  )}
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{act.label}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-emerald-500 block">+{act.points} pts</span>
                  <span className="text-[9px] text-gray-400 block font-semibold">Offset: -{act.offsetKg} kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI ECO-COACH */}
        <div className="premium-card p-5 space-y-4 flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, rgba(28,62,53,0.1) 0%, transparent 100%)' }}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>AI Sustainability Coach</h3>
            </div>
            <p className="text-[10px] text-gray-450 font-semibold leading-relaxed">
              Get personalized AI carbon reduction tactics based on your active fan scorecard behaviors today.
            </p>
            {aiTip && (
              <div className="p-3.5 rounded-xl border text-[11px] font-semibold leading-relaxed"
                style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
                {aiTip}
              </div>
            )}
          </div>

          <button
            onClick={handleGetAICoach}
            disabled={isGenerating}
            className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-forest-500 hover:bg-forest-600 text-white rounded-lg text-xs font-semibold shadow-premium transition-all disabled:opacity-50 mt-4"
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span>{isGenerating ? 'Analyzing Eco footprint...' : 'Request AI Eco-Tips'}</span>
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TRANSIT SPLITS CHART */}
        <div className="lg:col-span-2 premium-card p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Transit Distribution Splits (%)</h3>
            <p className="text-[10px] text-gray-400 font-semibold">Spectator transportation choice logged via ticket gateway transit checks</p>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                <Bar name="Spectators (%)" dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {transitData.map((entry, index) => {
                    const color = index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#ef4444';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI GRID STRATEGY PLAN */}
        <div className="premium-card p-5 space-y-4 relative overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Eco Strategy Briefings</h3>
            </div>
            
            <div className="space-y-4 text-xs font-medium">
              {sustainabilityTips.map((tip, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-lg border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-base)' }}>
                  <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>{tip.title}</span>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
export default Sustainability;

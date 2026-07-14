import React from 'react';
import { useApp } from '../../app/providers';
import { Leaf, Zap, Droplet, Trash2, ShieldAlert, Sparkles } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const Sustainability: React.FC = () => {
  const { sustainability } = useApp();

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

  return (
    <div className="space-y-6 font-sans">
      
      {/* SUSTAINABILITY SUBHEADER */}
      <div className="flex justify-between items-center bg-white dark:bg-graphite-900 p-4 rounded-xl border border-gray-150 dark:border-graphite-800 shadow-premium">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Stadium Grid Telemetry & Ecological Metrics</h2>
          <p className="text-xs text-gray-400 font-medium">Real-time smart grid tracking, water reclamation, and spectator transportation choices</p>
        </div>
      </div>

      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SOLAR PROGRESS CARD */}
        <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
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
        <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
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
        <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TRANSIT SPLITS CHART */}
        <div className="lg:col-span-2 bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Transit Distribution Splits (%)</h3>
            <p className="text-[10px] text-gray-400 font-medium">Spectator transportation choice logged via ticket gateway transit checks</p>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                <Bar name="Spectators (%)" dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {transitData.map((entry, index) => {
                    const color = index === 0 ? '#1c3e35' : index === 1 ? '#14b8a6' : '#3b82f6';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI GRID STRATEGY PLAN */}
        <div className="bg-forest-950 text-white border border-forest-800 rounded-xl p-5 shadow-premium space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-forest-900/30 rounded-full filter blur-xl"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
              <h3 className="text-xs font-bold text-forest-200 uppercase tracking-wider">Eco Strategy Briefings</h3>
            </div>
            
            <div className="space-y-4 text-xs font-medium text-forest-100">
              {sustainabilityTips.map((tip, idx) => (
                <div key={idx} className="space-y-1.5 p-3 bg-forest-900/40 rounded-lg border border-forest-800">
                  <span className="font-bold text-white block">{tip.title}</span>
                  <p className="text-[11px] leading-relaxed">{tip.text}</p>
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

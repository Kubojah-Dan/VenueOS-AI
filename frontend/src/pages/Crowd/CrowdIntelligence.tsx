import React from 'react';
import { useApp } from '../../app/providers';
import L from 'leaflet';
import { Users, ShieldAlert, ChevronRight, Activity, TrendingUp, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export const CrowdIntelligence: React.FC = () => {
  const { crowd } = useApp();

  React.useEffect(() => {
    const container = document.getElementById('map-crowd');
    if (!container) return;
    
    // Purge any existing leaflet instance properties
    if ((container as any)._leaflet_id) {
      (container as any)._leaflet_id = null;
    }
    
    const map = L.map('map-crowd', { scrollWheelZoom: false }).setView([25.4208, 51.4886], 17);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    const mockHeatzones = [
      { center: [25.4215, 51.4880] as [number, number], color: '#ef4444', radius: 45, label: 'Gate A Queue Jam' },
      { center: [25.4208, 51.4895] as [number, number], color: '#f59e0b', radius: 35, label: 'Gate B Heavy Arrivals' },
      { center: [25.4201, 51.4886] as [number, number], color: '#10b981', radius: 25, label: 'Gate C Light Inflow' },
      { center: [25.4206, 51.4880] as [number, number], color: '#ef4444', radius: 30, label: 'Food Court Food Hub 1 Spill' }
    ];

    mockHeatzones.forEach(zone => {
      L.circle(zone.center, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.4,
        radius: zone.radius
      }).addTo(map).bindPopup(`<span class="text-xs font-bold text-gray-800">${zone.label}</span>`);
    });

    return () => {
      map.remove();
    };
  }, [crowd]);

  // Custom tooltips with premium glassmorphism styling
  const CustomForecastTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-graphite-900/80 backdrop-blur-md border border-gray-250/20 dark:border-graphite-800 p-3.5 rounded-xl shadow-premium text-xs text-left space-y-1">
          <p className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">{payload[0].payload.time} Timeline</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} style={{ color: p.color }} className="font-semibold text-[11px]">
              {p.name}: <span className="font-bold">{p.value !== null ? `${p.value.toLocaleString()} Fans` : 'Pending Kickoff'}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* CROWD INTEL HEADER */}
      <div className="flex justify-between items-center premium-card p-5">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Crowd Telemetry & Bottleneck Predictions</h2>
          <p className="text-xs text-gray-400 dark:text-gray-550 font-semibold">Real-time gate ingress counts and perimeter sensor heat zones tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HEATMAP SCREEN PANEL */}
        <div className="lg:col-span-2 premium-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Crowd Heatmap Observation</h3>
              <p className="text-[10px] text-gray-405 dark:text-gray-500 font-semibold">Lusail Stadium perimeter circles indicating occupancy densities</p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[9px] font-bold rounded-full flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sensor Feeds Active</span>
            </span>
          </div>

          {/* LEAFLET MAP ELEMENT */}
          <div className="h-96 rounded-xl overflow-hidden relative border border-gray-150 dark:border-graphite-800 bg-gray-100 dark:bg-graphite-950">
            <div id="map-crowd" className="h-full w-full z-10" />
          </div>
        </div>

        {/* OCCUPANCY KPI CARD */}
        <div className="space-y-6">
          
          {/* CROWD STATS PANEL */}
          <div className="premium-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Live Occupancy Diagnostics</h3>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-2 border-b border-gray-150/15 dark:border-graphite-850/45 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Headcount Present</span>
                <span className="font-bold text-gray-800 dark:text-white">{crowd.totalOccupancy.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-150/15 dark:border-graphite-850/45 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Stall capacity limit</span>
                <span className="font-bold text-gray-800 dark:text-white">{crowd.maxCapacity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-150/15 dark:border-graphite-850/45 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Mean Flow Rate</span>
                <span className="font-bold text-gray-800 dark:text-white">{crowd.crowdFlowRatePpm} ppm</span>
              </div>
              <div className="flex justify-between items-center py-2 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Fill Ratio</span>
                <span className="font-black text-emerald-600 dark:text-emerald-500">{crowd.occupancyPercentage}%</span>
              </div>
            </div>
          </div>

          {/* SEC DIVISION METRICS WITH DETAILED PROGRESS BARS */}
          <div className="premium-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Sector Congestion Summary</h3>
            <div className="space-y-3">
              {crowd.sectors.map((sec, idx) => {
                const fillPercent = Math.round((sec.occupancy / sec.capacity) * 100);
                let barColor = 'bg-forest-500';
                if (sec.status === 'CONGESTED' || sec.status === 'CRITICAL') barColor = 'bg-red-500';
                if (sec.status === 'SLOW') barColor = 'bg-amber-500';

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700 dark:text-gray-200">{sec.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 font-semibold">{sec.occupancy.toLocaleString()} fans</span>
                        <span className={`px-1.5 py-0.25 rounded text-[8px] font-black tracking-wider uppercase ${
                          sec.status === 'CONGESTED' || sec.status === 'CRITICAL'
                            ? 'bg-red-500/10 text-red-500'
                            : sec.status === 'SLOW'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {sec.status}
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-gray-100 dark:bg-graphite-850 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${fillPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* FORECAST TIMELINE CHART */}
      <div className="premium-card p-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Spectator Occupancy Forecast (24h)</h3>
          <p className="text-[10px] text-gray-405 dark:text-gray-500 font-semibold">Comparison of actual arrival telemetry against pre-match AI simulation curves</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={crowd.predictedOccupancy || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1c3e35" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#1c3e35" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomForecastTooltip />} />
              <Area type="monotone" name="Actual Arrivals" dataKey="actual" stroke="#1c3e35" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
              <Area type="monotone" name="AI Prediction" dataKey="predicted" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} fillOpacity={1} fill="url(#colorPredicted)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
export default CrowdIntelligence;

import React from 'react';
import { useApp } from '../../app/providers';
import {
  Users,
  AlertTriangle,
  Zap,
  Clock,
  CloudSun,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Award,
  Calendar,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Link } from 'react-router-dom';

export const DashboardOverview: React.FC = () => {
  const { role, matches, crowd, sustainability, incidents, uploadHistory, weather, t, isConnected } = useApp();

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  
  // Find the primary match to highlight: LIVE first, then SCHEDULED, then FINISHED
  const liveMatch = matches.find(m => m.status === 'LIVE');
  const upcomingMatch = matches.find(m => m.status === 'SCHEDULED');
  const finishedMatch = matches.find(m => m.status === 'FINISHED');
  const primaryMatch = liveMatch || upcomingMatch || finishedMatch || (matches.length > 0 ? matches[0] : null);

  const finishedMatchCount = matches.filter(m => m.status === 'FINISHED').length;

  // Compile stats for charts
  const gateData = crowd.gates.map((g) => ({
    name: g.name.replace(' (North)', '').replace(' (East)', '').replace(' (South)', '').replace(' (West)', ''),
    wait: g.queueTimeMin,
    flow: g.flowRatePpm
  }));

  const systemStatus = activeIncidents.some(i => i.severity === 'CRITICAL')
    ? 'CRITICAL_ALERT'
    : activeIncidents.some(i => i.severity === 'HIGH')
    ? 'WARNING'
    : 'NOMINAL';

  const getStadiumLocation = (stadiumName: string) => {
    const s = String(stadiumName || '').toLowerCase();
    if (s.includes('mercedes') || s.includes('atlanta')) return 'Atlanta, Georgia, USA';
    if (s.includes('metlife')) return 'East Rutherford, NJ, USA';
    if (s.includes('sofi')) return 'Los Angeles, CA, USA';
    if (s.includes('azteca')) return 'Mexico City, Mexico';
    if (s.includes('bc place')) return 'Vancouver, BC, Canada';
    if (s.includes('bayt')) return 'Al Khor, QA';
    if (s.includes('janoub')) return 'Al Wakrah, QA';
    if (s.includes('khalifa') || s.includes('ali') || s.includes('education')) return 'Al Rayyan, QA';
    if (s.includes('lusail')) return 'Doha, QA';
    return 'Doha, QA'; // fallback default
  };

  // Custom tooltips with premium glassmorphism styling
  const CustomAreaTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-graphite-900/80 backdrop-blur-md border border-gray-250/20 dark:border-graphite-800 p-3.5 rounded-xl shadow-premium text-xs text-left space-y-1">
          <p className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">{payload[0].payload.time} Telemetry</p>
          <p className="text-forest-600 dark:text-emerald-500 font-extrabold">
            Solar: {payload[0].value} kW
          </p>
          <p className="text-gray-700 dark:text-gray-300 font-bold">
            Grid: {payload[1].value} kW
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-graphite-900/80 backdrop-blur-md border border-gray-250/20 dark:border-graphite-800 p-3.5 rounded-xl shadow-premium text-xs text-left space-y-1">
          <p className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">{payload[0].payload.name}</p>
          <p className="text-forest-500 dark:text-forest-400 font-bold text-[11px]">
            Queue Wait: <span className="text-gray-800 dark:text-white font-extrabold">{payload[0].value} mins</span>
          </p>
          <p className="text-[10px] text-gray-400 font-semibold">
            Flow Rate: {payload[0].payload.flow} ppm
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION WITH WEATHER & STATUS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 dark:bg-graphite-900/60 backdrop-blur-md p-4 rounded-xl border border-gray-150 dark:border-graphite-800 shadow-premium gap-4 relative z-10">
        <div>
          <h1 className="text-base font-bold text-gray-800 dark:text-white">{t('title')}</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {primaryMatch ? `${primaryMatch.stadium} ${t('subTitle')} - ${getStadiumLocation(primaryMatch.stadium)}` : `Lusail Stadium ${t('subTitle')} - Doha, QA`}
          </p>
        </div>
        <div className="flex items-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <CloudSun className="w-5 h-5 text-amber-500" />
            <div>
              <span className="font-semibold block text-gray-800 dark:text-gray-200">{weather.temp}°C {weather.condition}</span>
              <span className="text-[10px] text-gray-400">{weather.wind}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-graphite-800 pl-4">
            <Clock className="w-5 h-5 text-forest-500" />
            <div>
              <span className="font-semibold block text-gray-800 dark:text-gray-200">{t('weatherText')}</span>
              <span className="text-[10px] text-gray-400">{isConnected ? t('liveSync') : t('disconnect')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC MATCH SCOREBOARD WIDGET */}
      {primaryMatch ? (
        <div className={`rounded-2xl p-6 shadow-premium relative overflow-hidden text-white transition-all ${
          primaryMatch.status === 'LIVE' 
            ? 'bg-forest-500 border border-forest-600' 
            : primaryMatch.status === 'SCHEDULED' 
            ? 'bg-gradient-to-r from-slate-900 to-graphite-900 border border-graphite-850'
            : 'bg-gray-100 dark:bg-graphite-900 text-gray-700 dark:text-white border border-gray-200 dark:border-graphite-800'
        }`}>
          {primaryMatch.status === 'LIVE' && (
            <div className="absolute top-0 right-0 w-64 h-64 bg-forest-600 rounded-full filter blur-2xl opacity-40 translate-x-32 -translate-y-32"></div>
          )}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left Column: Match Details */}
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center space-x-2.5">
                {primaryMatch.status === 'LIVE' ? (
                  <span className="px-2 py-0.5 bg-red-500 text-white rounded text-[9px] font-extrabold tracking-wider animate-pulse uppercase">
                    Live In Progress
                  </span>
                ) : primaryMatch.status === 'SCHEDULED' ? (
                  <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded text-[9px] font-bold tracking-wider uppercase flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    <span>Upcoming Fixture</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-500/20 border border-gray-500/30 text-gray-400 rounded text-[9px] font-bold tracking-wider uppercase">
                    Match Finalized
                  </span>
                )}
                <span className="text-xs font-semibold text-gray-300 dark:text-gray-400">
                  {primaryMatch.group} • {primaryMatch.stadium}
                </span>
              </div>
              
              {/* Teams & Score Display */}
              <div className="flex items-center space-x-5 py-1">
                <span className="text-lg md:text-2xl font-black tracking-tight text-white">{primaryMatch.homeTeam}</span>
                {primaryMatch.status !== 'SCHEDULED' ? (
                  <span className={`text-2xl font-black px-4 py-1.5 rounded-xl tracking-widest border border-white/10 ${
                    primaryMatch.status === 'LIVE' ? 'bg-white/10 text-white' : 'bg-gray-250 dark:bg-graphite-800 text-gray-900 dark:text-white'
                  }`}>
                    {primaryMatch.homeScore} - {primaryMatch.awayScore}
                  </span>
                ) : (
                  <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-xl border border-blue-500/20 tracking-wider">
                    {new Date(primaryMatch.dateTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })} IST Kickoff
                  </span>
                )}
                <span className="text-lg md:text-2xl font-black tracking-tight text-white">{primaryMatch.awayTeam}</span>
              </div>
              
              {primaryMatch.status === 'LIVE' && (
                <p className="text-xs text-forest-100 font-medium">
                  Current Playtime: <span className="font-bold text-white">{primaryMatch.minute}' mins elapsed</span>
                </p>
              )}
              {primaryMatch.status === 'SCHEDULED' && (
                <p className="text-xs text-gray-400 font-medium">
                  Scheduled Kickoff: <span className="font-bold text-white">{new Date(primaryMatch.dateTime).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                </p>
              )}
            </div>

            {/* Right Column: Attendance / Capacity progress */}
            <div className={`border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 space-y-1.5 min-w-[220px] ${
              primaryMatch.status === 'LIVE' ? 'border-white/15' : 'border-gray-800'
            }`}>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Spectator Logistics
              </span>
              <div className="text-base font-bold text-white">
                {primaryMatch.status === 'LIVE' 
                  ? `${primaryMatch.attendance.toLocaleString()} Present`
                  : primaryMatch.status === 'FINISHED'
                  ? `${primaryMatch.attendance.toLocaleString()} Attended`
                  : 'Gates Opening in 2h'}
              </div>
              <div className={`w-full rounded-full h-1.5 ${primaryMatch.status === 'LIVE' ? 'bg-forest-600' : 'bg-gray-800'}`}>
                <div
                  className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${primaryMatch.status === 'SCHEDULED' ? 0 : (primaryMatch.attendance / crowd.maxCapacity) * 100}%` }}
                ></div>
              </div>
              <span className="text-[9px] text-gray-400 font-medium block">
                Stadum Capacity limit: {crowd.maxCapacity.toLocaleString()}
              </span>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-2xl p-6 text-center text-xs text-gray-400 font-medium shadow-premium">
          <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <span>No live or scheduled matches parsed in database feed.</span>
        </div>
      )}

      {/* LIVE KPIS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Spectators occupancy */}
        <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-4 flex items-center justify-between shadow-premium hover:shadow-premium-lg hover:border-forest-500/20 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Live Occupancy</span>
            <span className="text-xl font-bold block text-gray-800 dark:text-white">
              {crowd.totalOccupancy.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{crowd.occupancyPercentage}% capacity</span>
            </span>
          </div>
          <div className="w-10 h-10 bg-forest-500/10 text-forest-500 dark:text-forest-400 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Incidents alerts */}
        <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-4 flex items-center justify-between shadow-premium hover:shadow-premium-lg hover:border-forest-500/20 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Incidents</span>
            <span className={`text-xl font-bold block ${activeIncidents.length > 0 ? 'text-amber-500' : 'text-gray-800 dark:text-white'}`}>
              {activeIncidents.length}
            </span>
            <span className="text-[10px] text-gray-400 font-medium block">
              {activeIncidents.filter(i => i.severity === 'CRITICAL').length} Critical alerts active
            </span>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            activeIncidents.length > 0 
              ? 'bg-amber-500/10 text-amber-600 animate-pulse' 
              : 'bg-gray-100 text-gray-400 dark:bg-graphite-850'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Energy usage */}
        <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-4 flex items-center justify-between shadow-premium hover:shadow-premium-lg hover:border-forest-500/20 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Smart Grid Load</span>
            <span className="text-xl font-bold block text-gray-800 dark:text-white">
              {sustainability.liveEnergyUsageKw.toLocaleString()} kW
            </span>
            <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-500 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{sustainability.solarContributionPercent}% solar share</span>
            </span>
          </div>
          <div className="w-10 h-10 bg-teal-500/10 text-teal-500 dark:text-teal-400 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Solar Generation */}
        <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-4 flex items-center justify-between shadow-premium hover:shadow-premium-lg hover:border-forest-500/20 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Carbon Offsets</span>
            <span className="text-xl font-bold block text-gray-800 dark:text-white">
              {sustainability.carbonOffsetsKg.toLocaleString()} kg
            </span>
            <span className="text-[10px] text-gray-400 font-medium block">
              Recycling: {sustainability.recyclingRatePercent}% rate
            </span>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* STAKEHOLDER CONSOLE INSTRUCTIONS */}
      <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium">
        {role === 'Fan' && (
          <div className="text-xs space-y-1">
            <p className="font-semibold text-gray-700 dark:text-gray-300">👋 Welcome FIFA Fan!</p>
            <p className="text-gray-500 font-medium">
              We recommend using **Gate C** for entering the concourse as queue times are under **8 minutes**. Solar shuttle buses run every 5 minutes from Parking Alpha directly to Gate D (Wheelchair friendly).
            </p>
            <div className="pt-2 flex gap-4">
              <Link to="/dashboard/navigation" className="text-forest-500 font-bold hover:underline">View interactive stadium map &rarr;</Link>
              <Link to="/dashboard/ai-assistant" className="text-forest-500 font-bold hover:underline">Ask AI Assist &rarr;</Link>
            </div>
          </div>
        )}

        {role === 'Security' && (
          <div className="text-xs space-y-2">
            <p className="font-semibold text-red-600 dark:text-red-400 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Incident Command Directive</span>
            </p>
            <p className="text-gray-500 font-medium">
              Turnstile scanners at **Gate A** are offline. Shift crowd operations to secondary flow channels immediately. Crowd density warnings are active for Sector East.
            </p>
            <div className="pt-1 flex gap-4">
              <Link to="/dashboard/emergency" className="text-red-500 font-bold hover:underline">Launch Emergency Announce PA Panel &rarr;</Link>
              <Link to="/dashboard/operations" className="text-gray-700 dark:text-gray-300 font-bold hover:underline">Check live incident list &rarr;</Link>
            </div>
          </div>
        )}

        {role === 'Operations' && (
          <div className="text-xs space-y-1">
            <p className="font-semibold text-emerald-600 dark:text-emerald-500 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Facility Operations Console</span>
            </p>
            <p className="text-gray-500 font-medium">
              Solar reserves are at 38.6%, load-balancing cooling vents in Sector East. Ensure uploaded spreadsheets are validated in the Upload Center.
            </p>
            <div className="pt-2 flex gap-4">
              <Link to="/dashboard/upload-center" className="text-forest-500 font-bold hover:underline">Upload new telemetry files &rarr;</Link>
              <Link to="/dashboard/sustainability" className="text-forest-500 font-bold hover:underline">Sustainability power grid details &rarr;</Link>
            </div>
          </div>
        )}

        {role === 'Volunteer' && (
          <div className="text-xs space-y-1">
            <p className="font-semibold text-blue-500">🙋 Volunteer Lead Hub</p>
            <p className="text-gray-500 font-medium">
              Medical responder dispatch B is currently active at Section 102 assisting with heat exhaustion. Keep entry walkways clean and support spectator route guides.
            </p>
            <div className="pt-2 flex gap-4">
              <Link to="/dashboard/navigation" className="text-forest-500 font-bold hover:underline text-xs">Stadium Layout Map &rarr;</Link>
            </div>
          </div>
        )}
      </div>

      {/* DATA VISUALIZATIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: Grid Energy */}
        <div className="lg:col-span-2 bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Smart Grid Demand (kW)</h3>
              <p className="text-[10px] text-gray-400 font-medium">Energy consumption comparing local solar production with grid supply</p>
            </div>
            <div className="flex space-x-3 text-[9px] font-bold text-gray-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-forest-500"></span>
                <span>Grid Supply</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#14b8a6]"></span>
                <span>Solar Array</span>
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sustainability.historicalEnergy || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c3e35" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#1c3e35" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area type="monotone" name="Grid Power" dataKey="gridKw" stroke="#1c3e35" strokeWidth={2} fillOpacity={1} fill="url(#colorGrid)" />
                <Area type="monotone" name="Solar Array" dataKey="solarKw" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorSolar)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Gate Congestion wait times */}
        <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Gate Waiting Times</h3>
            <p className="text-[10px] text-gray-400 font-medium">Active queue length at stadium entries in minutes</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar name="Wait Time (m)" dataKey="wait" radius={[4, 4, 0, 0]}>
                  {gateData.map((entry, index) => {
                    const color = entry.wait > 20 ? '#ef4444' : entry.wait > 10 ? '#f59e0b' : '#1c3e35';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* RECENT DATASET UPLOADS LOGS */}
      <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Telemetry Upload Feed</h3>
            <p className="text-[10px] text-gray-400 font-medium">Automatic system status log of files processed via the Ingestion Engine</p>
          </div>
          <Link to="/dashboard/upload-center" className="text-xs font-bold text-forest-500 dark:text-forest-400 flex items-center hover:underline space-x-1">
            <span>Upload Center</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400">
            <thead>
              <tr className="border-b border-gray-100 dark:border-graphite-800 text-[10px] uppercase font-bold text-gray-400">
                <th className="py-2.5">Filename</th>
                <th className="py-2.5">Schema Type</th>
                <th className="py-2.5">Records</th>
                <th className="py-2.5">Upload Date</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {uploadHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No custom datasets ingested yet. Initialize via the Upload Center.
                  </td>
                </tr>
              ) : (
                uploadHistory.slice(0, 3).map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 dark:border-graphite-850 hover:bg-gray-50/50 dark:hover:bg-graphite-850/50">
                    <td className="py-3 font-semibold text-gray-800 dark:text-gray-300">{item.fileName}</td>
                    <td className="py-3 font-medium text-gray-600 dark:text-gray-400">{item.fileType}</td>
                    <td className="py-3">{item.parsedRecords} items</td>
                    <td className="py-3">{new Date(item.uploadedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        item.status === 'SUCCESS'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500'
                          : item.status === 'ERROR'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default DashboardOverview;

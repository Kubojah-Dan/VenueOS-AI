import React, { useState } from 'react';
import { useApp } from '../../app/providers';
import { Settings as SetIcon, Shield, Bell, Key, Moon, Sun, Laptop } from 'lucide-react';

export const Settings: React.FC = () => {
  const { theme, toggleTheme, apiStatus, highContrast, toggleHighContrast, fontSize, changeFontSize } = useApp();
  
  const [operatorName, setOperatorName] = useState('Shifty Director');
  const [operatorId, setOperatorId] = useState('OPS-WC2026-09');
  
  // Notification states
  const [notifyIncidents, setNotifyIncidents] = useState(true);
  const [notifyCrowds, setNotifyCrowds] = useState(true);
  const [notifySustainability, setNotifySustainability] = useState(false);

  const apiIntegrations = [
    { name: 'FIFA World Cup 2026 Match Feed', status: apiStatus.footballData },
    { name: 'football-data.org League DB', status: apiStatus.footballData },
    { name: 'OpenWeatherMap Weather API', status: apiStatus.openWeather },
    { name: 'Firebase Live Cloud DB Sync', status: apiStatus.firebase },
    { name: 'Google Maps Wayfinding Tiles', status: apiStatus.googleMaps }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Shift settings updated successfully.');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* SETTINGS SUBHEADER */}
      <div className="flex justify-between items-center bg-white dark:bg-graphite-900 p-4 rounded-xl border border-gray-150 dark:border-graphite-800 shadow-premium">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">OS Settings & Shift Configurations</h2>
          <p className="text-xs text-gray-400 font-medium">Verify API keys, adjust dark/light interfaces, and edit dispatcher profile listings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PROFILE & INTEGRATIONS */}
        <div className="lg:col-span-2 bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-6">
          
          {/* PROFILE EDITOR */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4.5 h-4.5 text-forest-500" />
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Operator Profile</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Shift Director Name</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-white dark:bg-graphite-950 border border-gray-200 dark:border-graphite-850 p-2.5 rounded-lg text-xs text-gray-850 dark:text-gray-200"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Operator Badge ID</label>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full bg-white dark:bg-graphite-950 border border-gray-200 dark:border-graphite-850 p-2.5 rounded-lg text-xs text-gray-850 dark:text-gray-200"
                  disabled
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-lg text-xs font-semibold shadow-premium transition-all"
            >
              Save Profile Settings
            </button>
          </form>

          {/* INTEGRATIONS MONITOR */}
          <div className="space-y-4 pt-6 border-t" style={{ borderColor: 'var(--border-default)' }}>
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-forest-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>External API Integrations</h3>
            </div>

            <div className="space-y-2.5">
              {apiIntegrations.map((api, idx) => {
                const s = api.status;
                const isConnected = s === 'CONNECTED';
                const isError = s.startsWith('ERROR');
                const isNA = s === 'N/A';
                const label = isConnected ? 'Connected' : isError ? 'Error' : isNA ? 'N/A' : s === 'CONNECTING' ? 'Connecting...' : s === 'DEGRADED' ? 'Degraded' : 'No API Key';
                const colors = isConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : isError
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : isNA
                  ? 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                return (
                  <div key={idx} className="flex justify-between items-center text-xs px-3 py-2.5 rounded-xl border"
                    style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-default)' }}>
                    <div>
                      <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>{api.name}</span>
                      <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Status as of last poll</span>
                    </div>
                    <span className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${colors}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : isError ? 'bg-red-500' : 'bg-amber-400'}`} />
                      <span>{label}</span>
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Statuses update every 3–10 minutes when the backend polls external APIs. Set API keys in your <code className="font-mono">.env</code> file to activate real connections.
            </p>
          </div>

        </div>

        {/* NOTIFICATIONS & THEME SETTINGS */}
        <div className="space-y-6">
          
          {/* THEME TOGGLER */}
          <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
            <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Visual Interface Mode</h3>
            
            <div className="flex space-x-2">
              <button
                onClick={() => { if(theme === 'dark') toggleTheme(); }}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 ${
                  theme === 'light'
                    ? 'bg-forest-500 text-white border-forest-500'
                    : 'bg-white dark:bg-graphite-950 border-gray-200 dark:border-graphite-850 text-gray-500'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </button>
              
              <button
                onClick={() => { if(theme === 'light') toggleTheme(); }}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 ${
                  theme === 'dark'
                    ? 'bg-forest-500 text-white border-forest-500'
                    : 'bg-white dark:bg-graphite-950 border-gray-200 dark:border-graphite-850 text-gray-500'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* ACCESSIBILITY SETTINGS */}
          <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
            <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Accessibility Controls</h3>
            
            <div className="space-y-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <div className="flex justify-between items-center">
                <span>High Contrast Under Sunlight</span>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={toggleHighContrast}
                  className="rounded border-gray-300 text-forest-500 focus:ring-forest-500 w-4 h-4"
                  aria-label="Toggle high contrast visibility mode"
                />
              </div>

              <div className="space-y-1.5">
                <span className="block mb-1">Text Scaling Options</span>
                <div className="flex space-x-1.5">
                  {(['standard', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => changeFontSize(sz)}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                        fontSize === sz
                          ? 'bg-forest-500 text-white border-forest-500'
                          : 'bg-white dark:bg-graphite-950 border-gray-200 dark:border-graphite-850 text-gray-500'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TELEMETRY NOTIFICATIONS */}
          <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-4.5 h-4.5 text-forest-500" />
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Shift Notifications</h3>
            </div>

            <div className="space-y-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <div className="flex justify-between items-center">
                <span>Active Incident Sirens</span>
                <input
                  type="checkbox"
                  checked={notifyIncidents}
                  onChange={(e) => setNotifyIncidents(e.target.checked)}
                  className="rounded border-gray-300 text-forest-500 focus:ring-forest-500 w-4 h-4"
                />
              </div>

              <div className="flex justify-between items-center">
                <span>Gate Ingress Congestion Warns</span>
                <input
                  type="checkbox"
                  checked={notifyCrowds}
                  onChange={(e) => setNotifyCrowds(e.target.checked)}
                  className="rounded border-gray-300 text-forest-500 focus:ring-forest-500 w-4 h-4"
                />
              </div>

              <div className="flex justify-between items-center">
                <span>Solar Grid Battery Alerts</span>
                <input
                  type="checkbox"
                  checked={notifySustainability}
                  onChange={(e) => setNotifySustainability(e.target.checked)}
                  className="rounded border-gray-300 text-forest-500 focus:ring-forest-500 w-4 h-4"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default Settings;

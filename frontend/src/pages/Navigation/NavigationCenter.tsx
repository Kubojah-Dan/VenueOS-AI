import React from 'react';
import L from 'leaflet';
import { MapPin, Navigation as NavIcon, Train, Bus, Info } from 'lucide-react';

export const NavigationCenter: React.FC = () => {

  React.useEffect(() => {
    const container = document.getElementById('map-navigation');
    if (!container) return;

    if ((container as any)._leaflet_id) {
      (container as any)._leaflet_id = null;
    }

    const map = L.map('map-navigation', { scrollWheelZoom: false }).setView([25.4208, 51.4886], 16);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    const mapPoints = [
      { position: [25.4208, 51.4886] as [number, number], color: '#1c3e35', label: 'Lusail Stadium Main Pitch' },
      { position: [25.4225, 51.4870] as [number, number], color: '#3b82f6', label: 'Metro Qetaifan Terminal' },
      { position: [25.4215, 51.4910] as [number, number], color: '#10b981', label: 'VIP Parking Lot Alpha' },
      { position: [25.4190, 51.4865] as [number, number], color: '#f59e0b', label: 'Bus Shuttle Bay Beta' }
    ];

    mapPoints.forEach(pt => {
      L.circleMarker(pt.position, {
        radius: 10,
        color: pt.color,
        fillColor: pt.color,
        fillOpacity: 0.8
      }).addTo(map).bindPopup(`<span class="text-xs font-bold text-gray-800">${pt.label}</span>`);
    });

    return () => {
      map.remove();
    };
  }, []);

  const routesList = [
    { id: 'r1', from: 'Lusail Metro Station', to: 'Gate A (North)', timeMin: 10, status: 'CLEAR', mode: 'Walkway' },
    { id: 'r2', from: 'Parking Lot Alpha', to: 'Gate B (East)', timeMin: 5, status: 'EXPRESS', mode: 'Shuttle VIP' },
    { id: 'r3', from: 'Rideshare Hub C', to: 'Gate C (South)', timeMin: 18, status: 'SLOW', mode: 'Concourse Walk' },
    { id: 'r4', from: 'Parking Lot Beta', to: 'Gate D (West)', timeMin: 8, status: 'CLEAR', mode: 'Accessible Path' }
  ];

  const transitSchedules = [
    { line: 'Metro Red Line', target: 'M1 - Lusail Qetaifan', frequency: '2 mins', status: 'ON_TIME' },
    { line: 'Shuttle Express A', target: 'Parking Alpha Loop', frequency: '5 mins', status: 'ON_TIME' },
    { line: 'Shuttle Express B', target: 'Parking Beta / West Gate', frequency: '6 mins', status: 'DELAYED' }
  ];

  const parkingSpaces = [
    { name: 'Parking Lot Alpha', capacity: 2500, occupied: 2100, status: 'FULL' },
    { name: 'Parking Lot Beta', capacity: 1800, occupied: 950, status: 'SPACES' },
    { name: 'Rideshare Lot C', capacity: 500, occupied: 420, status: 'BUSY' }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center premium-card p-5">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Transit Logistics & Wayfinding Map</h2>
          <p className="text-xs text-gray-400 dark:text-gray-550 font-semibold">Shuttle dispatch timers, parking inventory tracking, and walking routes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INTERACTIVE VENUE MAP */}
        <div className="lg:col-span-2 premium-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Wayfinding Dashboard</h3>
              <p className="text-[10px] text-gray-450 dark:text-gray-500 font-semibold">Real-time coordinates of transit hubs and stadium routes</p>
            </div>
            <div className="flex space-x-3 text-[10px] font-bold">
              <span className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-gray-500">Transit</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-gray-500">Parking</span></span>
            </div>
          </div>

          <div className="h-96 rounded-xl overflow-hidden relative border border-gray-150 dark:border-graphite-800 bg-gray-100 dark:bg-graphite-950">
            <div id="map-navigation" className="h-full w-full z-10" />
          </div>
        </div>

        {/* TRANSIT & PARKING SIDEPANELS */}
        <div className="space-y-6">
          
          {/* DEPARTURE TIMETABLE */}
          <div className="premium-card p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <Train className="w-5 h-5 text-forest-500" />
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Live Transit Timetable</h3>
            </div>
            <div className="space-y-3">
              {transitSchedules.map((tr, idx) => (
                <div key={idx} className="p-3 bg-gray-50/50 dark:bg-graphite-850/50 rounded-xl border border-gray-150/30 dark:border-graphite-800/30 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-gray-750 dark:text-gray-300 block">{tr.line}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{tr.target}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-gray-800 dark:text-gray-200 block">{tr.frequency}</span>
                    <span className={`text-[8.5px] font-extrabold uppercase ${tr.status === 'ON_TIME' ? 'text-emerald-600' : 'text-amber-500 animate-pulse'}`}>
                      {tr.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PARKING SPACE COUNTER */}
          <div className="premium-card p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <Bus className="w-5 h-5 text-forest-500" />
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Parking Inventory</h3>
            </div>
            <div className="space-y-3">
              {parkingSpaces.map((pk, idx) => {
                const fillPct = Math.round((pk.occupied / pk.capacity) * 100);
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-700 dark:text-gray-300 font-bold">{pk.name}</span>
                      <span className="text-gray-400 font-bold">{pk.occupied.toLocaleString()} / {pk.capacity.toLocaleString()}</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-gray-100 dark:bg-graphite-850 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${fillPct > 90 ? 'bg-red-500' : fillPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${fillPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* WALKING ROUTES TABLE */}
      <div className="premium-card p-5 space-y-4">
        <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Wayfinding Route States</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400">
            <thead>
              <tr className="border-b border-gray-150 dark:border-graphite-800 text-[10px] uppercase font-bold text-gray-400 pb-1.5">
                <th className="py-2.5 px-3">Route From</th>
                <th className="py-2.5 px-3">Destination Gate</th>
                <th className="py-2.5 px-3">Average Transit Time</th>
                <th className="py-2.5 px-3">Accessibility Path</th>
                <th className="py-2.5 px-3">Traffic Density</th>
              </tr>
            </thead>
            <tbody>
              {routesList.map((route) => (
                <tr key={route.id} className="border-b border-gray-150/20 dark:border-graphite-850/20 hover:bg-gray-55/50 dark:hover:bg-graphite-855/50">
                  <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-300">{route.from}</td>
                  <td className="py-3 px-3 text-gray-600 dark:text-gray-405 font-semibold">{route.to}</td>
                  <td className="py-3 px-3 font-extrabold text-gray-700 dark:text-gray-200">{route.timeMin} mins</td>
                  <td className="py-3 px-3 font-semibold text-gray-400">{route.mode}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      route.status === 'CLEAR'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : route.status === 'EXPRESS'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-red-500/10 text-red-500 animate-pulse'
                    }`}>
                      {route.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default NavigationCenter;

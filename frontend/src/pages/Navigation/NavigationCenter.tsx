import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation as NavIcon, Train, Bus, Info, Check, Eye } from 'lucide-react';

interface RouteItem {
  id: string;
  from: string;
  to: string;
  timeMin: number;
  status: 'CLEAR' | 'EXPRESS' | 'SLOW';
  mode: string;
  coordinates: [number, number][];
}

export const NavigationCenter: React.FC = () => {
  const [activeRouteId, setActiveRouteId] = useState<string>('r1');
  const mapRef = useRef<L.Map | null>(null);
  const pathLayerRef = useRef<L.Polyline | null>(null);
  const startMarkerRef = useRef<L.CircleMarker | null>(null);
  const endMarkerRef = useRef<L.CircleMarker | null>(null);

  const routesList: RouteItem[] = [
    {
      id: 'r1',
      from: 'Lusail Metro Station',
      to: 'Gate A (North)',
      timeMin: 10,
      status: 'CLEAR',
      mode: 'Walkway',
      coordinates: [
        [25.4225, 51.4870], // Metro Station
        [25.4230, 51.4880], // Path turn
        [25.4220, 51.4892], // Inner Ring
        [25.4215, 51.4890]  // Gate A
      ]
    },
    {
      id: 'r2',
      from: 'Parking Lot Alpha',
      to: 'Gate B (East)',
      timeMin: 5,
      status: 'EXPRESS',
      mode: 'Shuttle VIP',
      coordinates: [
        [25.4215, 51.4910], // VIP Parking Lot Alpha
        [25.4205, 51.4900], // Path mid
        [25.4208, 51.4886]  // Gate B
      ]
    },
    {
      id: 'r3',
      from: 'Rideshare Hub C',
      to: 'Gate C (South)',
      timeMin: 18,
      status: 'SLOW',
      mode: 'Concourse Walk',
      coordinates: [
        [25.4180, 51.4870], // Rideshare Hub C
        [25.4190, 51.4875], // Walk pathway
        [25.4198, 51.4886]  // Gate C
      ]
    },
    {
      id: 'r4',
      from: 'Parking Lot Beta',
      to: 'Gate D (West)',
      timeMin: 8,
      status: 'CLEAR',
      mode: 'Accessible Path',
      coordinates: [
        [25.4190, 51.4865], // Bus Shuttle Bay Beta
        [25.4200, 51.4870], // Smooth ramp
        [25.4208, 51.4886]  // Gate D
      ]
    }
  ];

  const mapPoints = [
    { position: [25.4208, 51.4886] as [number, number], color: '#10b981', label: 'Lusail Stadium Main Pitch' },
    { position: [25.4225, 51.4870] as [number, number], color: '#3b82f6', label: 'Metro Qetaifan Terminal' },
    { position: [25.4215, 51.4910] as [number, number], color: '#f59e0b', label: 'VIP Parking Lot Alpha' },
    { position: [25.4190, 51.4865] as [number, number], color: '#ef4444', label: 'Bus Shuttle Bay Beta' }
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

  // Map Initialization
  useEffect(() => {
    const container = document.getElementById('map-navigation');
    if (!container) return;

    if ((container as any)._leaflet_id) {
      (container as any)._leaflet_id = null;
    }

    const map = L.map('map-navigation', { scrollWheelZoom: false }).setView([25.4208, 51.4886], 15);
    mapRef.current = map;

    // Dark-adapted Map tiles using CartoDB Dark Matter for Dark mode compatibility
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    // Initial landmarks markers
    mapPoints.forEach(pt => {
      L.circleMarker(pt.position, {
        radius: 8,
        color: pt.color,
        fillColor: pt.color,
        fillOpacity: 0.95,
        weight: 2
      }).addTo(map).bindPopup(`<span class="text-xs font-bold text-gray-800">${pt.label}</span>`);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Polyline Path Layer on Route Selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing layers
    if (pathLayerRef.current) {
      map.removeLayer(pathLayerRef.current);
    }
    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
    }
    if (endMarkerRef.current) {
      map.removeLayer(endMarkerRef.current);
    }

    const activeRoute = routesList.find(r => r.id === activeRouteId);
    if (!activeRoute || activeRoute.coordinates.length < 2) return;

    // Create Path polyline
    const pathColor = activeRoute.status === 'CLEAR' ? '#10b981' : activeRoute.status === 'EXPRESS' ? '#3b82f6' : '#ef4444';
    
    const polyline = L.polyline(activeRoute.coordinates, {
      color: pathColor,
      weight: 5,
      opacity: 0.8,
      dashArray: activeRoute.status === 'SLOW' ? '10, 10' : undefined,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    pathLayerRef.current = polyline;

    // Add Pulsing Start & End Markers
    const startCoord = activeRoute.coordinates[0];
    const endCoord = activeRoute.coordinates[activeRoute.coordinates.length - 1];

    const startMarker = L.circleMarker(startCoord, {
      radius: 7,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 1,
      weight: 3
    }).addTo(map).bindPopup(`<span class="text-xs font-bold text-gray-800">Start: ${activeRoute.from}</span>`);

    const endMarker = L.circleMarker(endCoord, {
      radius: 7,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 1,
      weight: 3
    }).addTo(map).bindPopup(`<span class="text-xs font-bold text-gray-800">Destination: ${activeRoute.to}</span>`);

    startMarkerRef.current = startMarker;
    endMarkerRef.current = endMarker;

    // Pan map to fit the route bounds
    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

  }, [activeRouteId]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center premium-card p-5">
        <div>
          <h2 className="text-base font-bold text-gray-850 dark:text-white">Transit Logistics & Interactive Wayfinding Map</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Shuttle dispatch timers, parking inventory tracking, and dynamic interactive routing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INTERACTIVE VENUE MAP */}
        <div className="lg:col-span-2 premium-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Wayfinding Dashboard</h3>
              <p className="text-[10px] text-gray-450 dark:text-gray-500 font-semibold">Select a route from the table below to render pathing and overlays</p>
            </div>
            <div className="flex space-x-3 text-[10px] font-bold">
              <span className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-gray-500">Transit Terminal</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-gray-500">Stadium Entrance</span></span>
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
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Active Route States (Click row to calculate wayfinding)</h3>
          <span className="text-[10px] text-emerald-500 font-extrabold flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>Click any route row to map dynamic overlay pathing</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400">
            <thead>
              <tr className="border-b border-gray-150 dark:border-graphite-800 text-[10px] uppercase font-bold text-gray-400 pb-1.5">
                <th className="py-2.5 px-3">Route From</th>
                <th className="py-2.5 px-3">Destination Gate</th>
                <th className="py-2.5 px-3">Average Transit Time</th>
                <th className="py-2.5 px-3">Accessibility Path</th>
                <th className="py-2.5 px-3">Traffic Density</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {routesList.map((route) => (
                <tr
                  key={route.id}
                  onClick={() => setActiveRouteId(route.id)}
                  className={`border-b border-gray-150/20 dark:border-graphite-850/20 hover:bg-gray-55/50 dark:hover:bg-graphite-855/50 cursor-pointer transition-colors ${
                    activeRouteId === route.id ? 'bg-forest-500/10 dark:bg-forest-500/20' : ''
                  }`}
                >
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
                  <td className="py-3 px-3 text-right">
                    <button
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeRouteId === route.id
                          ? 'bg-forest-500 text-white'
                          : 'bg-gray-100 dark:bg-graphite-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {activeRouteId === route.id ? 'Active Route' : 'Plot Route'}
                    </button>
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

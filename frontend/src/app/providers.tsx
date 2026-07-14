import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export type UserRole = 'Fan' | 'Operations' | 'Security' | 'Volunteer';

interface Match {
  id: string;
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'LIVE' | 'SCHEDULED' | 'FINISHED';
  minute: number;
  stadium: string;
  attendance: number;
  group: string;
  dateTime: string;
}

interface Incident {
  id: string;
  category: 'Security' | 'Medical' | 'Facilities' | 'Crowds' | 'Transport';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  location: string;
  status: 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CRITICAL';
  reportedAt: string;
  assignedTeam: string;
  actions: string;
  coordinates: { x: number; y: number };
}

interface Sustainability {
  liveEnergyUsageKw: number;
  peakEnergyUsageKw: number;
  solarContributionPercent: number;
  waterConsumptionLiters: number;
  reclaimedWaterPercent: number;
  carbonEmissionKg: number;
  carbonOffsetsKg: number;
  wasteGeneratedTons: number;
  recyclingRatePercent: number;
  transportModes: {
    metro: number;
    busShuttle: number;
    rideshare: number;
    personalCar: number;
  };
  historicalEnergy: Array<{ time: string; gridKw: number; solarKw: number }>;
}

interface Crowd {
  totalOccupancy: number;
  maxCapacity: number;
  occupancyPercentage: number;
  crowdFlowRatePpm: number;
  sectors: Array<{ name: string; occupancy: number; capacity: number; status: string }>;
  gates: Array<{ name: string; queueTimeMin: number; flowRatePpm: number; status: string }>;
  predictedOccupancy: Array<{ time: string; actual: number | null; predicted: number }>;
}

interface UploadHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  parsedRecords: number;
  status: 'SUCCESS' | 'ERROR' | 'PROCESSING';
  uploadedAt: string;
  errorMessage?: string;
  aiInsights?: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isConnected: boolean;
  matches: Match[];
  incidents: Incident[];
  sustainability: Sustainability;
  crowd: Crowd;
  uploadHistory: UploadHistoryItem[];
  addIncidentLocal: (incident: any) => void;
  triggerRefresh: () => Promise<void>;
  notifications: string[];
  clearNotifications: () => void;
  weather: { temp: number; condition: string; wind: string };
  apiStatus: {
    footballData: string;
    openWeather: string;
    firebase: string;
    googleMaps: string;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('Operations');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  // State caches
  const [matches, setMatches] = useState<Match[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sustainability, setSustainability] = useState<Sustainability>({
    liveEnergyUsageKw: 1200,
    peakEnergyUsageKw: 2000,
    solarContributionPercent: 30,
    waterConsumptionLiters: 100000,
    reclaimedWaterPercent: 40,
    carbonEmissionKg: 4000,
    carbonOffsetsKg: 1500,
    wasteGeneratedTons: 3.5,
    recyclingRatePercent: 60,
    transportModes: { metro: 60, busShuttle: 20, rideshare: 10, personalCar: 10 },
    historicalEnergy: []
  });
  const [crowd, setCrowd] = useState<Crowd>({
    totalOccupancy: 60000,
    maxCapacity: 80000,
    occupancyPercentage: 75,
    crowdFlowRatePpm: 400,
    sectors: [],
    gates: [],
    predictedOccupancy: []
  });
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [weather, setWeather] = useState<{ temp: number; condition: string; wind: string }>({
    temp: 32,
    condition: 'Clear',
    wind: 'Wind: N 12km/h'
  });
  const [apiStatus, setApiStatus] = useState({
    footballData: 'SIMULATED',
    openWeather: 'SIMULATED',
    firebase: 'SIMULATED',
    googleMaps: 'SIMULATED'
  });

  // Toggle Theme helper
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (socket) {
      socket.emit('join-role', newRole);
    }
  };

  // Fetch initial REST data
  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/dashboard/overview');
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches);
        setIncidents(data.incidents);
        setSustainability(data.sustainability);
        setCrowd(data.crowd);
        if (data.stats && data.stats.weather) {
          setWeather(data.stats.weather);
        }
        if (data.stats && data.stats.apiStatus) {
          setApiStatus(data.stats.apiStatus);
        }
      }
      const historyRes = await fetch('http://localhost:3001/api/upload-history');
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setUploadHistory(historyData);
      }
    } catch (err) {
      console.warn('Dashboard server offline. Operating in simulation mode.');
    }
  };

  const triggerRefresh = async () => {
    await fetchData();
  };

  // Setup WebSocket listeners
  useEffect(() => {
    fetchData();

    const socketUrl = 'http://localhost:3001';
    const s = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true
    });

    s.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to VenueOS Socket Engine.');
      s.emit('join-role', role);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from VenueOS Socket Engine.');
    });

    // Real-time synchronization event hooks
    s.on('matches-updated', (data: Match[]) => {
      setMatches(data);
      addNotification('Football matches scorecard updated.');
    });

    s.on('incidents-updated', (data: Incident[]) => {
      setIncidents(data);
      const active = data.filter((i) => i.status !== 'RESOLVED');
      if (active.length > 0) {
        addNotification(`Security Alert: New ${active[0].severity} Incident in ${active[0].location}.`);
      }
    });

    s.on('sustainability-updated', (data: Sustainability) => {
      setSustainability(data);
      addNotification('Power grid and sustainability metrics updated.');
    });

    s.on('crowd-updated', (data: Crowd) => {
      setCrowd(data);
      addNotification('Gate queue occupancy forecasts recalculated.');
    });

    s.on('upload-status', (data: UploadHistoryItem) => {
      setUploadHistory((prev) => {
        const index = prev.findIndex((u) => u.id === data.id);
        if (index !== -1) {
          const next = [...prev];
          next[index] = data;
          return next;
        }
        return [data, ...prev];
      });
      if (data.status === 'SUCCESS') {
        addNotification(`File "${data.fileName}" processed successfully.`);
      } else if (data.status === 'ERROR') {
        addNotification(`File "${data.fileName}" failed processing.`);
      }
    });

      s.on('weather-updated', (data: any) => {
        setWeather(data);
        addNotification(`Local stadium weather updated: ${data.temp}°C.`);
      });

      setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const addNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev].slice(0, 8));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addIncidentLocal = (incident: any) => {
    setIncidents((prev) => [incident, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        theme,
        toggleTheme,
        isConnected,
        matches,
        incidents,
        sustainability,
        crowd,
        uploadHistory,
        addIncidentLocal,
        triggerRefresh,
        notifications,
        clearNotifications,
        weather,
        apiStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '../config';

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

const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation Sidebar
    overview: 'Overview',
    operations: 'Operations Center',
    crowd: 'Crowd Intelligence',
    navigation: 'Navigation Center',
    assistant: 'AI Assistant',
    upload: 'Upload Center',
    emergency: 'Emergency Center',
    accessibility: 'Accessibility Center',
    sustainability: 'Sustainability',
    reports: 'Reports',
    settings: 'Settings',

    // Core Dashboard Layout
    title: 'Stadium Operations Command',
    liveSync: 'Live Sync Active',
    disconnect: 'Disconnected',
    signOut: 'Sign Out',
    roleLabel: 'Role',

    // Accessibility Center
    escortRequest: 'Request Escort Assistance',
    facilityStatus: 'Facility Status Monitoring',
    languageAssistance: 'Language Vocal Assistance',
    escortProfile: 'Escort Support Profile',
    seatingSection: 'Target Sector / Seating Section',
    dispatchButton: 'Request Escort Support',
    activeLabel: 'Active',

    // Emergency Center
    riskIndex: 'Stadium Risk Index',
    severeIncidents: 'Severe Incidents',
    respondersDispatched: 'Responders Dispatched',
    paScriptGen: 'Megaphone Alert PA Script Generator',
    coreDispatch: 'Core Dispatch Lines',
    evacDirectives: 'Evacuation Directives',

    // Operations Center
    activeTickets: 'Active Command Tickets',
    closedArchives: 'Closed Archives',
    staffRoster: 'Active Staff Roster',
    decisionSupport: 'Active Decision Support',
    suggestedMitigation: 'Suggested Mitigation Workflows'
  },
  es: {
    // Navigation Sidebar
    overview: 'Resumen',
    operations: 'Centro de Operaciones',
    crowd: 'Inteligencia de Multitudes',
    navigation: 'Centro de Navegación',
    assistant: 'Asistente de IA',
    upload: 'Centro de Carga',
    emergency: 'Centro de Emergencia',
    accessibility: 'Centro de Accesibilidad',
    sustainability: 'Sostenibilidad',
    reports: 'Informes',
    settings: 'Configuración',

    // Core Dashboard Layout
    title: 'Comando de Operaciones del Estadio',
    liveSync: 'Sincronización en Vivo Activa',
    disconnect: 'Desconectado',
    signOut: 'Cerrar Sesión',
    roleLabel: 'Rol',

    // Accessibility Center
    escortRequest: 'Solicitar Asistencia de Escolta',
    facilityStatus: 'Monitoreo de Estado de Instalaciones',
    languageAssistance: 'Asistencia Vocal de Idiomas',
    escortProfile: 'Perfil de Soporte de Escolta',
    seatingSection: 'Sector de Destino / Sección de Asiento',
    dispatchButton: 'Solicitar Asistencia Rápida',
    activeLabel: 'Activo',

    // Emergency Center
    riskIndex: 'Índice de Riesgo del Estadio',
    severeIncidents: 'Incidentes Graves',
    respondersDispatched: 'Socorristas Despachados',
    paScriptGen: 'Generador de Guiones PA Megáfono',
    coreDispatch: 'Líneas de Despacho Central',
    evacDirectives: 'Directivas de Evacuación',

    // Operations Center
    activeTickets: 'Tickets de Comando Activos',
    closedArchives: 'Archivos Cerrados',
    staffRoster: 'Lista de Personal Activa',
    decisionSupport: 'Soporte de Decisión Activo',
    suggestedMitigation: 'Flujos de Mitigación Sugeridos'
  },
  ar: {
    // Navigation Sidebar
    overview: 'نظرة عامة',
    operations: 'مركز العمليات',
    crowd: 'استخبارات الحشود',
    navigation: 'مركز الملاحة',
    assistant: 'مساعد الذكاء الاصطناعي',
    upload: 'مركز التحميل',
    emergency: 'مركز الطوارئ',
    accessibility: 'مركز إمكانية الوصول',
    sustainability: 'الاستدامة',
    reports: 'التقارير',
    settings: 'الإعدادات',

    // Core Dashboard Layout
    title: 'قيادة عمليات الاستاد',
    liveSync: 'مزامنة مباشرة نشطة',
    disconnect: 'غير متصل',
    signOut: 'تسجيل الخروج',
    roleLabel: 'الدور',

    // Accessibility Center
    escortRequest: 'طلب مساعدة مرافق',
    facilityStatus: 'مراقبة حالة المرافق',
    languageAssistance: 'مساعدة اللغات الصوتية',
    escortProfile: 'ملف تعريف دعم المرافق',
    seatingSection: 'القطاع المستهدف / قسم المقاعد',
    dispatchButton: 'طلب مساعدة سريعة',
    activeLabel: 'نشط',

    // Emergency Center
    riskIndex: 'مؤشر مخاطر الاستاد',
    severeIncidents: 'الحوادث الخطيرة',
    respondersDispatched: 'تم إرسال المستجيبين',
    paScriptGen: 'مولد نصوص إنذار مكبر الصوت',
    coreDispatch: 'خطوط الإرسال الأساسية',
    evacDirectives: 'توجيهات الإخلاء',

    // Operations Center
    activeTickets: 'تذاكر القيادة النشطة',
    closedArchives: 'الأرشيف المغلق',
    staffRoster: 'قائمة الموظفين النشطين',
    decisionSupport: 'دعم القرار النشط',
    suggestedMitigation: 'سير عمل التخفيف المقترح'
  },
  fr: {
    // Navigation Sidebar
    overview: 'Aperçu',
    operations: 'Centre d’Opérations',
    crowd: 'Intelligence des Foules',
    navigation: 'Centre de Navegation',
    assistant: 'Assistant IA',
    upload: 'Centre de Téléchargement',
    emergency: 'Centre d’Urgence',
    accessibility: 'Centre d’Accessibilité',
    sustainability: 'Durabilité',
    reports: 'Rapports',
    settings: 'Paramètres',

    // Core Dashboard Layout
    title: 'Commandement des Opérations du Stade',
    liveSync: 'Synchronisation Active',
    disconnect: 'Déconnecté',
    signOut: 'Déconnexion',
    roleLabel: 'Rôle',

    // Accessibility Center
    escortRequest: 'Demander Assistance d’Accompagnement',
    facilityStatus: 'Surveillance de l’État des Installations',
    languageAssistance: 'Assistance Vocale Multilingue',
    escortProfile: 'Profil d’Assistance d’Accompagnement',
    seatingSection: 'Secteur Cible / Section de Sièges',
    dispatchButton: 'Demander Assistance Rapide',
    activeLabel: 'Actif',

    // Emergency Center
    riskIndex: 'Indice de Risque du Stade',
    severeIncidents: 'Incidents Graves',
    respondersDispatched: 'Secouristes Déployés',
    paScriptGen: 'Générateur de Scripts PA Mégaphone',
    coreDispatch: 'Lignes de Dispatch de Base',
    evacDirectives: 'Directives d’Évacuation',

    // Operations Center
    activeTickets: 'Tickets de Commandement Actifs',
    closedArchives: 'Archives Clôturées',
    staffRoster: 'Liste du Personnel Actif',
    decisionSupport: 'Aide à la Décision Active',
    suggestedMitigation: 'Flux de Mitigation Suggérés'
  }
};

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
  language: 'en' | 'es' | 'ar' | 'fr';
  setLanguage: (lang: 'en' | 'es' | 'ar' | 'fr') => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('Operations');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [language, setLanguage] = useState<'en' | 'es' | 'ar' | 'fr'>('en');

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

  const t = (key: string): string => {
    const dict = translations[language] || translations['en'];
    return dict[key] || key;
  };

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
      const res = await fetch(`${API_URL}/api/dashboard/overview`);
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
      const historyRes = await fetch(`${API_URL}/api/upload-history`);
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

    const socketUrl = SOCKET_URL;
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
      setIsConnected(true); // Treat reconnects gracefully
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
      // Suppress logging alerts for telemetry simulation fluctuations to prevent log spams
    });

    s.on('crowd-updated', (data: Crowd) => {
      setCrowd(data);
      // Suppress logging alerts for telemetry simulation fluctuations to prevent log spams
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
      addNotification(`File upload status synchronized: ${data.fileName} (${data.status}).`);
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
        apiStatus,
        language,
        setLanguage,
        t
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

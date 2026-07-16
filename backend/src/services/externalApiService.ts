import db, { Match } from '../database/db';
import wsService from './websocketService';
import { isFirebaseInitialized } from '../config/firebase';

const stadiumMap: Record<string, string> = {
  '1': 'Lusail Stadium',
  '2': 'Al Bayt Stadium',
  '3': 'Al Janoub Stadium',
  '4': 'Ahmad Bin Ali Stadium',
  '5': 'Khalifa International Stadium',
  '6': 'Education City Stadium',
  '7': 'Mercedes-Benz Stadium (Atlanta Stadium)',
  '8': 'SoFi Stadium',
  '9': 'MetLife Stadium',
  '10': 'BC Place',
  '11': 'Estadio Azteca',
  '12': 'Hard Rock Stadium',
  '13': 'Gillette Stadium',
  '14': 'Arrowhead Stadium',
  '15': 'NRG Stadium',
  '16': 'Lincoln Financial Field'
};

const stadiumTimezoneOffsets: Record<string, number> = {
  '1': 3, // Doha, QA (UTC+3)
  '2': 3,
  '3': 3,
  '4': 3,
  '5': 3,
  '6': 3,
  '7': -4, // Atlanta, USA (EDT is UTC-4)
  '8': -7, // Los Angeles, USA (PDT is UTC-7)
  '9': -4, // New York, USA (EDT is UTC-4)
  '10': -7, // Vancouver, Canada (PDT is UTC-7)
  '11': -6, // Mexico City, Mexico (CST is UTC-6)
  '12': -4, // Miami, USA (EDT is UTC-4)
  '13': -4, // Boston, USA (EDT is UTC-4)
  '14': -5, // Kansas City, USA (CDT is UTC-5)
  '15': -5, // Houston, USA (CDT is UTC-5)
  '16': -4  // Philadelphia, USA (EDT is UTC-4)
};

class ExternalApiService {
  private weatherInterval: NodeJS.Timeout | null = null;
  private matchesInterval: NodeJS.Timeout | null = null;
  private telemetryInterval: NodeJS.Timeout | null = null;

  // Real-time Weather cache
  private currentWeather = {
    temp: 32,
    condition: 'Clear',
    wind: 'N 12km/h'
  };

  // Real API connection statuses
  private apiStatus = {
    footballData: 'CONNECTING',
    openWeather: 'CONNECTING',
    firebase: 'CONNECTING',
    googleMaps: 'N/A'
  };

  public getApiStatus() {
    return { ...this.apiStatus };
  }

  public initialize() {
    console.log('Initializing Real-time API Polling (Weather & Match Data)...');
    
    // Set firebase status from config
    this.apiStatus.firebase = isFirebaseInitialized ? 'CONNECTED' : 'DEGRADED';
    
    // Poll immediately on boot
    this.pollWeather();
    this.pollMatches();

    // Weather updates every 10 minutes (600000 ms)
    this.weatherInterval = setInterval(() => this.pollWeather(), 600000);

    // Football-data updates every 3 minutes (180000 ms)
    this.matchesInterval = setInterval(() => this.pollMatches(), 180000);

    // Background telemetry simulator to slightly fluctuate crowd/energy parameters every 5s
    this.telemetryInterval = setInterval(() => this.simulateLiveTelemetry(), 5000);
  }

  public getCurrentWeather() {
    return this.currentWeather;
  }

  private async pollWeather() {
    const key = process.env.OPENWEATHERMAP_API_KEY;
    if (!key) {
      console.log('No Weather API Key. Using Doha climate defaults.');
      this.apiStatus.openWeather = 'NO_KEY';
      return;
    }

    try {
      const lat = 25.4208;
      const lon = 51.4886;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json() as any;
        
        this.currentWeather = {
          temp: Math.round(data.main?.temp || 32),
          condition: data.weather?.[0]?.main || 'Clear',
          wind: `Wind: ${data.wind?.cardinal || 'N'} ${Math.round((data.wind?.speed || 3.3) * 3.6)}km/h`
        };

        this.apiStatus.openWeather = 'CONNECTED';
        console.log(`Weather updated: ${this.currentWeather.temp}°C, ${this.currentWeather.condition}`);
        wsService.broadcast('weather-updated', this.currentWeather);
      } else {
        this.apiStatus.openWeather = `ERROR_${response.status}`;
        console.warn(`Weather API returned status: ${response.status}`);
      }
    } catch (err) {
      this.apiStatus.openWeather = 'ERROR';
      console.error('Failed to query weather API:', err);
    }
  }

  private async pollMatches() {
    try {
      console.log('Polling World Cup 2026 matches from worldcup26.ir...');
      this.apiStatus.footballData = 'CONNECTING';
      const response = await fetch('https://worldcup26.ir/get/games');
      if (response.ok) {
        const data = await response.json() as any;
        const apiGames = data.games || [];

        if (apiGames.length > 0) {
          this.apiStatus.footballData = 'CONNECTED';
          console.log(`Successfully fetched ${apiGames.length} matches from worldcup26.ir.`);

          const normalizedMatches: Match[] = apiGames.map((m: any, idx: number) => {
            let status: 'LIVE' | 'SCHEDULED' | 'FINISHED' = 'SCHEDULED';
            const elapsed = String(m.time_elapsed || '').toLowerCase();
            const isFinished = String(m.finished || '').toUpperCase() === 'TRUE' || elapsed === 'finished';

            if (isFinished) {
              status = 'FINISHED';
            } else if (elapsed === 'live' || (!isNaN(Number(elapsed)) && Number(elapsed) > 0)) {
              status = 'LIVE';
            }

            let minute = 0;
            if (status === 'FINISHED') {
              minute = 90;
            } else if (status === 'LIVE') {
              minute = parseInt(elapsed) || 45;
            }

            let dateTime = new Date().toISOString();
            if (m.local_date) {
              try {
                // Parse format MM/DD/YYYY HH:MM to valid ISO Date in UTC
                const [datePart, timePart] = m.local_date.split(' ');
                const [month, day, year] = datePart.split('/');
                const [hour, minuteVal] = timePart.split(':');
                
                const stadiumId = String(m.stadium_id || '1');
                const offsetHours = stadiumTimezoneOffsets[stadiumId] ?? 0;
                
                // Parse local timestamp as UTC millisecond baseline
                const localUTC = Date.UTC(
                  parseInt(year),
                  parseInt(month) - 1,
                  parseInt(day),
                  parseInt(hour),
                  parseInt(minuteVal)
                );
                
                // Subtract offset to get absolute UTC time
                const utcTime = localUTC - (offsetHours * 60 * 60 * 1000);
                dateTime = new Date(utcTime).toISOString();
              } catch (e) {
                // Ignore parse errors, fallback to default ISO Date
              }
            }

            const stadiumIdStr = String(m.stadium_id || '');
            const stadiumName = stadiumMap[stadiumIdStr] || (m.stadium_id ? `Stadium ${m.stadium_id}` : 'Lusail Stadium');

            return {
              id: `wc-${m.id || idx}`,
              matchNumber: idx + 1,
              homeTeam: m.home_team_name_en || 'Home TBD',
              awayTeam: m.away_team_name_en || 'Away TBD',
              homeScore: parseInt(m.home_score) || 0,
              awayScore: parseInt(m.away_score) || 0,
              status,
              minute,
              stadium: stadiumName,
              attendance: status === 'FINISHED' ? 78912 : status === 'LIVE' ? 72000 : 0,
              group: m.type === 'group' ? `Group ${m.group}` : (m.type || 'FIFA World Cup').toUpperCase(),
              dateTime
            };
          });

          // Overwrite local db matches
          db.setMatches(normalizedMatches);

          // Broadcast updates
          wsService.broadcast('matches-updated', db.getMatches());
          return;
        }
      } else {
        this.apiStatus.footballData = `ERROR_${response.status}`;
        console.warn(`worldcup26.ir returned status: ${response.status}. Attempting secondary source...`);
      }
    } catch (err) {
      this.apiStatus.footballData = 'ERROR';
      console.warn('Failed to query primary worldcup26.ir API. Falling back to secondary sources:', err);
    }

    // Fallback back to Football-Data API (if token exists)
    const token = process.env.FOOTBALL_DATA_API_KEY;
    if (!token) {
      console.log('No Football Match API Key for secondary fallback. Retaining current matches.');
      return;
    }

    try {
      const url = 'https://api.football-data.org/v4/matches';
      const response = await fetch(url, {
        headers: { 'X-Auth-Token': token }
      });

      if (response.ok) {
        const data = await response.json() as any;
        const apiMatches = data.matches || [];

        if (apiMatches.length === 0) {
          console.log('No live matches today on football-data.org.');
          return;
        }

        this.apiStatus.footballData = 'CONNECTED';
        console.log(`Successfully fetched ${apiMatches.length} matches from Football-Data API.`);

        const normalizedMatches: Match[] = apiMatches.map((m: any, idx: number) => {
          let status: 'LIVE' | 'SCHEDULED' | 'FINISHED' = 'SCHEDULED';
          if (m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'LIVE') {
            status = 'LIVE';
          } else if (m.status === 'FINISHED') {
            status = 'FINISHED';
          }

          const minute = m.minute || (status === 'LIVE' ? 45 : 0);

          return {
            id: `api-${m.id}`,
            matchNumber: idx + 1,
            homeTeam: m.homeTeam?.name || 'Home TBD',
            awayTeam: m.awayTeam?.name || 'Away TBD',
            homeScore: m.score?.fullTime?.home !== null ? m.score.fullTime.home : 0,
            awayScore: m.score?.fullTime?.away !== null ? m.score.fullTime.away : 0,
            status,
            minute,
            stadium: m.venue || 'Lusail Stadium',
            attendance: status === 'FINISHED' ? 75000 : status === 'LIVE' ? 71000 : 0,
            group: m.competition?.name || 'FIFA World Cup',
            dateTime: m.utcDate || new Date().toISOString()
          };
        });

        db.setMatches(normalizedMatches);
        wsService.broadcast('matches-updated', db.getMatches());
      }
    } catch (err) {
      console.error('Failed to query secondary matches API:', err);
    }
  }

  private simulateLiveTelemetry() {
    try {
      const crowd = db.getCrowd();
      const sustainability = db.getSustainability();
      
      if (!crowd || !sustainability) return;

      // 1. Fluctuate Crowd parameters
      const diff = Math.floor(Math.random() * 81) - 40; // -40 to +40 spectators
      crowd.totalOccupancy = Math.max(1000, Math.min(crowd.maxCapacity, crowd.totalOccupancy + diff));
      crowd.occupancyPercentage = Math.round((crowd.totalOccupancy / crowd.maxCapacity) * 1000) / 10;
      
      crowd.crowdFlowRatePpm = Math.max(50, Math.min(1000, crowd.crowdFlowRatePpm + (Math.floor(Math.random() * 21) - 10)));
      
      // Fluctuate gate queue wait times
      if (crowd.gates && crowd.gates.length > 0) {
        crowd.gates = crowd.gates.map((g: any) => {
          const qDiff = Math.floor(Math.random() * 3) - 1; // -1, 0, +1 min
          const newQ = Math.max(1, Math.min(60, g.queueTimeMin + qDiff));
          let status = 'NORMAL';
          if (newQ > 30) status = 'CRITICAL';
          else if (newQ > 15) status = 'SLOW';
          return { ...g, queueTimeMin: newQ, status };
        });
      }

      // Fluctuate sector occupancy numbers
      if (crowd.sectors && crowd.sectors.length > 0) {
        crowd.sectors = crowd.sectors.map((s: any) => {
          const sDiff = Math.floor(Math.random() * 51) - 25;
          const newOcc = Math.max(0, Math.min(s.capacity, s.occupancy + sDiff));
          const pct = newOcc / s.capacity;
          let status = 'NORMAL';
          if (pct > 0.9) status = 'CRITICAL';
          else if (pct > 0.8) status = 'CONGESTED';
          else if (pct > 0.6) status = 'SLOW';
          return { ...s, occupancy: newOcc, status };
        });
      }

      // 2. Fluctuate Sustainability parameters
      const energyDiff = Math.floor(Math.random() * 31) - 15; // -15 to +15 kW
      sustainability.liveEnergyUsageKw = Math.max(800, Math.min(3000, sustainability.liveEnergyUsageKw + energyDiff));
      
      const solarDiff = Math.floor(Math.random() * 3) - 1; // -1% to +1%
      sustainability.solarContributionPercent = Math.max(10, Math.min(90, sustainability.solarContributionPercent + solarDiff));
      
      // Accumulate water liters consumed
      sustainability.waterConsumptionLiters += Math.floor(Math.random() * 15) + 5; // 5-20 liters
      
      // Save changes back to our DB cache
      db.updateCrowd(crowd);
      db.updateSustainability(sustainability);

      // Broadcast changes to active frontend pages via WebSockets
      wsService.broadcast('crowd-updated', crowd);
      wsService.broadcast('sustainability-updated', sustainability);

    } catch (e) {
      console.warn('Failed to update live telemetry simulation:', e);
    }
  }

  public shutdown() {
    if (this.weatherInterval) clearInterval(this.weatherInterval);
    if (this.matchesInterval) clearInterval(this.matchesInterval);
    if (this.telemetryInterval) clearInterval(this.telemetryInterval);
  }
}

export const externalApiService = new ExternalApiService();
export default externalApiService;

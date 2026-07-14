import db, { Match } from '../database/db';
import wsService from './websocketService';

class ExternalApiService {
  private weatherInterval: NodeJS.Timeout | null = null;
  private matchesInterval: NodeJS.Timeout | null = null;

  // Real-time Weather cache
  private currentWeather = {
    temp: 32,
    condition: 'Clear',
    wind: 'N 12km/h'
  };

  public initialize() {
    console.log('Initializing Real-time API Polling (Weather & Match Data)...');
    
    // Poll immediately on boot
    this.pollWeather();
    this.pollMatches();

    // Weather updates every 10 minutes (600000 ms)
    this.weatherInterval = setInterval(() => this.pollWeather(), 600000);

    // Football-data updates every 3 minutes (180000 ms)
    this.matchesInterval = setInterval(() => this.pollMatches(), 180000);
  }

  public getCurrentWeather() {
    return this.currentWeather;
  }

  private async pollWeather() {
    const key = process.env.OPENWEATHERMAP_API_KEY;
    if (!key) {
      console.log('No Weather API Key. Using Doha climate defaults.');
      return;
    }

    try {
      // Coordinate coordinates for Lusail Stadium
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

        console.log(`Weather updated: ${this.currentWeather.temp}°C, ${this.currentWeather.condition}`);
        
        // Broadcast weather changes
        wsService.broadcast('weather-updated', this.currentWeather);
      } else {
        console.warn(`Weather API returned status: ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to query weather API:', err);
    }
  }

  private async pollMatches() {
    try {
      console.log('Polling World Cup 2026 matches from worldcup26.ir...');
      const response = await fetch('https://worldcup26.ir/get/games');
      if (response.ok) {
        const data = await response.json() as any;
        const apiGames = data.games || [];

        if (apiGames.length > 0) {
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
                // Parse format MM/DD/YYYY HH:MM to valid ISO Date
                const [datePart, timePart] = m.local_date.split(' ');
                const [month, day, year] = datePart.split('/');
                dateTime = `${year}-${month}-${day}T${timePart}:00.000Z`;
              } catch (e) {
                // Ignore parse errors, fallback to default ISO Date
              }
            }

            return {
              id: `wc-${m.id || idx}`,
              matchNumber: idx + 1,
              homeTeam: m.home_team_name_en || 'Home TBD',
              awayTeam: m.away_team_name_en || 'Away TBD',
              homeScore: parseInt(m.home_score) || 0,
              awayScore: parseInt(m.away_score) || 0,
              status,
              minute,
              stadium: m.stadium_id === '1' ? 'Lusail Stadium' : `Stadium ${m.stadium_id || 'Alpha'}`,
              attendance: status === 'FINISHED' ? 78912 : status === 'LIVE' ? 72000 : 0,
              group: m.type === 'group' ? `Group ${m.group}` : (m.type || 'FIFA World Cup'),
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
        console.warn(`worldcup26.ir returned status: ${response.status}. Attempting secondary source...`);
      }
    } catch (err) {
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

  public shutdown() {
    if (this.weatherInterval) clearInterval(this.weatherInterval);
    if (this.matchesInterval) clearInterval(this.matchesInterval);
  }
}

export const externalApiService = new ExternalApiService();
export default externalApiService;

import * as fs from 'fs';
import * as path from 'path';
import { firestoreDb, realtimeDb, isFirebaseInitialized } from '../config/firebase';

// Interfaces for our collections
export interface Match {
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

export interface Incident {
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

export interface Sustainability {
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

export interface CrowdSector {
  name: string;
  occupancy: number;
  capacity: number;
  status: 'NORMAL' | 'SLOW' | 'CONGESTED' | 'CRITICAL';
}

export interface CrowdGate {
  name: string;
  queueTimeMin: number;
  flowRatePpm: number;
  status: 'NORMAL' | 'SLOW' | 'CRITICAL';
}

export interface Crowd {
  totalOccupancy: number;
  maxCapacity: number;
  occupancyPercentage: number;
  crowdFlowRatePpm: number;
  sectors: CrowdSector[];
  gates: CrowdGate[];
  predictedOccupancy: Array<{ time: string; actual: number | null; predicted: number }>;
}

export interface UploadHistoryItem {
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

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'Operations' | 'Security' | 'Volunteer' | 'Fan';
}

export interface SchemaDB {
  matches: Match[];
  incidents: Incident[];
  sustainability: Sustainability;
  crowd: Crowd;
  uploadHistory: UploadHistoryItem[];
  users: User[];
}

class DatabaseManager {
  private dbPath = path.join(__dirname, '../../data/stadium_db.json');
  private data: SchemaDB | null = null;

  public async init() {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize with defaults first
    this.restoreDefaults();

    if (fs.existsSync(this.dbPath)) {
      try {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(fileContent);
        if (!this.data!.users) {
          this.data!.users = [];
        }
      } catch (err) {
        console.error('Failed reading local stadium cache. Proceeding with default values.');
      }
    }

    if (isFirebaseInitialized && firestoreDb) {
      try {
        console.log('Synchronizing Firestore and Realtime DB state with Local Cache...');

        // 1. Sync Matches from Firestore
        const matchesSnapshot = await firestoreDb.collection('matches').get();
        if (!matchesSnapshot.empty) {
          const list: Match[] = [];
          matchesSnapshot.forEach((doc) => list.push(doc.data() as Match));
          this.data!.matches = list;
          console.log(`Synced ${list.length} matches from Firestore.`);
        } else {
          // Bootstrap Firestore matches
          for (const m of this.data!.matches) {
            await firestoreDb.collection('matches').doc(m.id).set(m);
          }
          console.log('Bootstrapped Firestore matches collection.');
        }

        // 2. Sync Incidents from Firestore
        const incidentsSnapshot = await firestoreDb.collection('incidents').get();
        if (!incidentsSnapshot.empty) {
          const list: Incident[] = [];
          incidentsSnapshot.forEach((doc) => list.push(doc.data() as Incident));
          // Sort by reportedAt descending
          list.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
          this.data!.incidents = list;
          console.log(`Synced ${list.length} incidents from Firestore.`);
        } else {
          for (const inc of this.data!.incidents) {
            await firestoreDb.collection('incidents').doc(inc.id).set(inc);
          }
        }

        // 3. Sync Sustainability
        const sustainDoc = await firestoreDb.collection('sustainability').doc('live_stats').get();
        if (sustainDoc.exists) {
          this.data!.sustainability = sustainDoc.data() as Sustainability;
          console.log('Synced sustainability metrics from Firestore.');
        } else {
          await firestoreDb.collection('sustainability').doc('live_stats').set(this.data!.sustainability);
        }

        // 4. Sync Crowd from Realtime DB
        if (realtimeDb) {
          const crowdSnap = await realtimeDb.ref('crowd').once('value');
          if (crowdSnap.exists()) {
            this.data!.crowd = crowdSnap.val() as Crowd;
            console.log('Synced crowd metrics from Realtime Database.');
          } else {
            await realtimeDb.ref('crowd').set(this.data!.crowd);
          }
        }

        // 5. Sync Users from Firestore
        const usersSnapshot = await firestoreDb.collection('users').get();
        if (!usersSnapshot.empty) {
          const list: User[] = [];
          usersSnapshot.forEach((doc) => list.push(doc.data() as User));
          this.data!.users = list;
          console.log(`Synced ${list.length} users from Firestore.`);
        }

      } catch (err) {
        console.error('Firebase DB sync warning (continuing with local cache):', err);
      }
    }
  }

  private restoreDefaults() {
    const rootDir = path.join(__dirname, '../../../');
    const loadSample = (filename: string): any => {
      const p = path.join(rootDir, 'datasets/sample', filename);
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
      return null;
    };

    const matches = loadSample('matches.json') || [];
    const incidents = loadSample('incidents.json') || [];
    const sustainability = loadSample('sustainability.json') || {
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
    };
    const crowd = loadSample('crowd.json') || {
      totalOccupancy: 60000,
      maxCapacity: 80000,
      occupancyPercentage: 75.0,
      crowdFlowRatePpm: 400,
      sectors: [],
      gates: [],
      predictedOccupancy: []
    };

    this.data = {
      matches,
      incidents,
      sustainability,
      crowd,
      uploadHistory: [],
      users: []
    };
  }

  private save() {
    if (!this.data) return;
    
    // Save to local cache first
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed writing to local stadium cache:', err);
    }

    // Sync to Firebase asynchronously in background
    if (isFirebaseInitialized && firestoreDb) {
      try {
        // Sync sustainability
        firestoreDb.collection('sustainability').doc('live_stats').set(this.data.sustainability).catch(err => {});
        
        // Sync crowd to Realtime Database
        if (realtimeDb) {
          realtimeDb.ref('crowd').set(this.data.crowd).catch(err => {});
        }
      } catch (err) {
        console.error('Firebase save error:', err);
      }
    }
  }

  // Matches Collection
  public getMatches(): Match[] {
    return this.data?.matches || [];
  }

  public updateMatch(match: Match) {
    if (!this.data) return;
    const index = this.data.matches.findIndex((m) => m.id === match.id);
    if (index !== -1) {
      this.data.matches[index] = match;
    } else {
      this.data.matches.push(match);
    }
    this.save();

    if (isFirebaseInitialized && firestoreDb) {
      firestoreDb.collection('matches').doc(match.id).set(match).catch(err => {});
    }
  }

  public setMatches(matches: Match[]) {
    if (!this.data) return;
    this.data.matches = matches;
    this.save();

    if (isFirebaseInitialized && firestoreDb) {
      for (const m of matches) {
        firestoreDb.collection('matches').doc(m.id).set(m).catch(err => {});
      }
    }
  }

  // Incidents Collection
  public getIncidents(): Incident[] {
    return this.data?.incidents || [];
  }

  public addIncident(incident: Incident) {
    if (!this.data) return;
    this.data.incidents.unshift(incident);
    this.save();

    if (isFirebaseInitialized && firestoreDb) {
      firestoreDb.collection('incidents').doc(incident.id).set(incident).catch(err => {});
    }
  }

  public updateIncident(incident: Incident) {
    if (!this.data) return;
    const index = this.data.incidents.findIndex((i) => i.id === incident.id);
    if (index !== -1) {
      this.data.incidents[index] = incident;
      this.save();

      if (isFirebaseInitialized && firestoreDb) {
        firestoreDb.collection('incidents').doc(incident.id).set(incident).catch(err => {});
      }
    }
  }

  // Sustainability Collection
  public getSustainability(): Sustainability {
    return this.data?.sustainability || {
      liveEnergyUsageKw: 0,
      peakEnergyUsageKw: 0,
      solarContributionPercent: 0,
      waterConsumptionLiters: 0,
      reclaimedWaterPercent: 0,
      carbonEmissionKg: 0,
      carbonOffsetsKg: 0,
      wasteGeneratedTons: 0,
      recyclingRatePercent: 0,
      transportModes: { metro: 0, busShuttle: 0, rideshare: 0, personalCar: 0 },
      historicalEnergy: []
    };
  }

  public updateSustainability(sustainability: Sustainability) {
    if (!this.data) return;
    this.data.sustainability = sustainability;
    this.save();
  }

  // Crowd Collection
  public getCrowd(): Crowd {
    return this.data?.crowd || {
      totalOccupancy: 0,
      maxCapacity: 80000,
      occupancyPercentage: 0,
      crowdFlowRatePpm: 0,
      sectors: [],
      gates: [],
      predictedOccupancy: []
    };
  }

  public updateCrowd(crowd: Crowd) {
    if (!this.data) return;
    this.data.crowd = crowd;
    this.save();
  }

  // Upload History Collection
  public getUploadHistory(): UploadHistoryItem[] {
    return this.data?.uploadHistory || [];
  }

  public addUploadHistory(item: UploadHistoryItem) {
    if (!this.data) return;
    this.data.uploadHistory.unshift(item);
    this.save();

    if (isFirebaseInitialized && firestoreDb) {
      firestoreDb.collection('upload_history').doc(item.id).set(item).catch(err => {});
    }
  }

  public updateUploadHistory(item: UploadHistoryItem) {
    if (!this.data) return;
    const index = this.data.uploadHistory.findIndex((h) => h.id === item.id);
    if (index !== -1) {
      this.data.uploadHistory[index] = item;
      this.save();

      if (isFirebaseInitialized && firestoreDb) {
        firestoreDb.collection('upload_history').doc(item.id).set(item).catch(err => {});
      }
    }
  }

  // Users Collection
  public getUsers(): User[] {
    return this.data?.users || [];
  }

  public addUser(user: User) {
    if (!this.data) return;
    if (!this.data.users) this.data.users = [];
    this.data.users.push(user);
    this.save();

    if (isFirebaseInitialized && firestoreDb) {
      firestoreDb.collection('users').doc(user.id).set(user).catch(err => {});
    }
  }
}

export const db = new DatabaseManager();
export default db;

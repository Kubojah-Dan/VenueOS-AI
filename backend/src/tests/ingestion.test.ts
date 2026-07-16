// Mock modules directly in test file for correct Jest hoisting
jest.mock('../config/firebase', () => ({
  firestoreDb: null,
  realtimeDb: null,
  isFirebaseInitialized: false
}));

jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockImplementation(() => {
            return {
              [Symbol.asyncIterator]: function* () {
                yield { choices: [{ delta: { content: 'mock' } }] };
              }
            };
          })
        }
      }
    };
  });
});

import ingestionService from '../services/ingestionService';
import db from '../database/db';

describe('IngestionService Tests', () => {
  beforeEach(async () => {
    await db.init();
  });

  test('should return compiled stats with match info, crowd, incidents, and sustainability', () => {
    const stats = ingestionService.getCompiledStats();
    
    expect(stats).toBeDefined();
    expect(stats.crowd).toBeDefined();
    expect(typeof stats.crowd.occupancy).toBe('number');
    expect(typeof stats.crowd.capacity).toBe('number');
    expect(stats.incidents).toBeDefined();
    expect(typeof stats.incidents.activeCount).toBe('number');
  });

  test('should detect correct schema structure', () => {
    const matchRow = { homeTeam: 'Argentina', awayTeam: 'France', matchNumber: 1 };
    const incidentRow = { severity: 'HIGH', incident: 'Medical Alert', location: 'Gate C' };
    const sustainabilityRow = { energy: 1200, solar: 30 };
    const crowdRow = { occupancy: 60000, flowrate: 400 };

    expect((ingestionService as any).detectSchema([matchRow])).toBe('matches');
    expect((ingestionService as any).detectSchema([incidentRow])).toBe('incidents');
    expect((ingestionService as any).detectSchema([sustainabilityRow])).toBe('sustainability');
    expect((ingestionService as any).detectSchema([crowdRow])).toBe('crowd');
    expect((ingestionService as any).detectSchema([{ unknown: 'x' }])).toBe('generic');
  });
});

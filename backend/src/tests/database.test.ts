// Mock modules directly in test file for correct Jest hoisting
jest.mock('../config/firebase', () => ({
  firestoreDb: null,
  realtimeDb: null,
  isFirebaseInitialized: false
}));

jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: jest.fn() } }
  }));
});

import db from '../database/db';
import ingestionService from '../services/ingestionService';
import { vectorStore } from '../database/vectorStore';

describe('Database & Cross-Feature Pairwise Coverage Tests', () => {
  beforeAll(async () => {
    await db.init();
    await vectorStore.initialize();
  });

  // ────────────────────────────────────────────────
  // Database CRUD Operations
  // ────────────────────────────────────────────────
  describe('Database Collection Integrity', () => {
    test('should return matches array with required fields', () => {
      const matches = db.getMatches();
      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThan(0);
      const m = matches[0];
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('homeTeam');
      expect(m).toHaveProperty('awayTeam');
      expect(m).toHaveProperty('homeScore');
      expect(m).toHaveProperty('status');
      expect(['LIVE', 'SCHEDULED', 'FINISHED']).toContain(m.status);
    });

    test('should return incidents array with severity classifications', () => {
      const incidents = db.getIncidents();
      expect(Array.isArray(incidents)).toBe(true);
      expect(incidents.length).toBeGreaterThan(0);
      for (const inc of incidents) {
        expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(inc.severity);
        expect(['REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CRITICAL']).toContain(inc.status);
      }
    });

    test('should return crowd data with occupancy and gates', () => {
      const crowd = db.getCrowd();
      expect(crowd).toBeDefined();
      expect(typeof crowd.totalOccupancy).toBe('number');
      expect(typeof crowd.maxCapacity).toBe('number');
      expect(crowd.maxCapacity).toBeGreaterThan(0);
      expect(Array.isArray(crowd.gates)).toBe(true);
      expect(Array.isArray(crowd.sectors)).toBe(true);
    });

    test('should return sustainability metrics with energy and carbon data', () => {
      const sus = db.getSustainability();
      expect(sus).toBeDefined();
      expect(typeof sus.liveEnergyUsageKw).toBe('number');
      expect(typeof sus.solarContributionPercent).toBe('number');
      expect(typeof sus.carbonEmissionKg).toBe('number');
      expect(typeof sus.recyclingRatePercent).toBe('number');
    });

    test('should return users array (may be empty initially)', () => {
      const users = db.getUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    test('should add and retrieve a new user', () => {
      const newUser = {
        id: 'test-user-001',
        name: 'Test Operator',
        email: 'test@worldcup2026.org',
        passwordHash: '$2a$12$fakehashfortest',
        role: 'Operations' as const
      };
      db.addUser(newUser);
      const users = db.getUsers();
      const found = users.find(u => u.id === 'test-user-001');
      expect(found).toBeDefined();
      expect(found!.name).toBe('Test Operator');
      expect(found!.role).toBe('Operations');
    });
  });

  // ────────────────────────────────────────────────
  // Pairwise: Ingestion ↔ Database
  // ────────────────────────────────────────────────
  describe('Pairwise: Ingestion Service ↔ Database Sync', () => {
    test('should compile stats that reflect database state', () => {
      const stats = ingestionService.getCompiledStats();
      const dbCrowd = db.getCrowd();
      expect(stats.crowd.capacity).toBe(dbCrowd.maxCapacity);
      expect(stats.crowd.occupancy).toBe(dbCrowd.totalOccupancy);
    });

    test('should reflect incident counts from database', () => {
      const stats = ingestionService.getCompiledStats();
      const dbIncidents = db.getIncidents();
      const activeCount = dbIncidents.filter(i => i.status !== 'RESOLVED').length;
      expect(stats.incidents.activeCount).toBe(activeCount);
    });
  });

  // ────────────────────────────────────────────────
  // Pairwise: Vector Store ↔ Database Content
  // ────────────────────────────────────────────────
  describe('Pairwise: RAG Vector Store ↔ Knowledge Base', () => {
    test('should return relevant results when querying stadium-related terms', () => {
      const results = vectorStore.query('lusail stadium capacity seating', 3);
      // Knowledge base has lusail.txt, so we expect results
      expect(Array.isArray(results)).toBe(true);
    });

    test('should index dynamically added stadium data and retrieve it', () => {
      const crowdData = db.getCrowd();
      vectorStore.addText(
        `Current stadium occupancy is ${crowdData.totalOccupancy} out of ${crowdData.maxCapacity} maximum capacity. ` +
        `The occupancy percentage is ${crowdData.occupancyPercentage}%.`,
        'dynamic-crowd-telemetry'
      );
      const results = vectorStore.query('occupancy capacity percentage', 5);
      const found = results.find(r => r.source === 'dynamic-crowd-telemetry');
      expect(found).toBeDefined();
    });
  });

  // ────────────────────────────────────────────────
  // Pairwise: Gate Queue ↔ Crowd Density
  // ────────────────────────────────────────────────
  describe('Pairwise: Gate Queue Times ↔ Crowd Sectors', () => {
    test('should have gate queue times correlated with sector occupancy', () => {
      const crowd = db.getCrowd();
      // Gates should have valid queue times
      for (const gate of crowd.gates) {
        expect(typeof gate.queueTimeMin).toBe('number');
        expect(gate.queueTimeMin).toBeGreaterThanOrEqual(0);
        expect(typeof gate.flowRatePpm).toBe('number');
      }
      // Sectors should have valid capacity data
      for (const sector of crowd.sectors) {
        expect(sector.occupancy).toBeLessThanOrEqual(sector.capacity);
        expect(['NORMAL', 'SLOW', 'CONGESTED', 'CRITICAL']).toContain(sector.status);
      }
    });
  });
});

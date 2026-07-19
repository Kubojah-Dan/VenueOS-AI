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

import { vectorStore } from '../database/vectorStore';

describe('TF-IDF Cosine Similarity Vector Store', () => {
  beforeAll(async () => {
    // Initialize loads the knowledge-base directory
    await vectorStore.initialize();
  });

  test('should initialize without errors and index document chunks', async () => {
    // The knowledge-base has at least lusail.txt
    const results = vectorStore.query('stadium', 5);
    // There should be some results from the knowledge base
    expect(Array.isArray(results)).toBe(true);
  });

  test('should return scored results with text, source, and score fields', () => {
    const results = vectorStore.query('gate capacity evacuation', 3);
    for (const r of results) {
      expect(r).toHaveProperty('text');
      expect(r).toHaveProperty('source');
      expect(r).toHaveProperty('score');
      expect(typeof r.score).toBe('number');
      expect(r.score).toBeGreaterThan(0);
    }
  });

  test('should return empty results for empty query', () => {
    const results = vectorStore.query('', 3);
    expect(results).toEqual([]);
  });

  test('should return empty results for stopword-only query', () => {
    const results = vectorStore.query('the and is but or', 3);
    expect(results).toEqual([]);
  });

  test('should rank results by cosine similarity score in descending order', () => {
    const results = vectorStore.query('wheelchair accessibility ramps', 5);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  test('should allow dynamic text indexing via addText', () => {
    vectorStore.addText(
      'Emergency evacuation protocol alpha requires all spectators to exit via North Gate within 8 minutes.',
      'test-dynamic-source'
    );
    const results = vectorStore.query('emergency evacuation protocol alpha', 3);
    expect(results.length).toBeGreaterThan(0);
    const found = results.find((r) => r.source === 'test-dynamic-source');
    expect(found).toBeDefined();
    expect(found!.score).toBeGreaterThan(0);
  });

  test('should respect the limit parameter', () => {
    vectorStore.addText(
      'Solar panels on the stadium roof generate 40% of peak energy demand during daytime matches.',
      'test-solar-1'
    );
    vectorStore.addText(
      'Solar powered LED installations reduce grid dependency by channeling photovoltaic energy into lighting arrays.',
      'test-solar-2'
    );
    const results = vectorStore.query('solar energy panels', 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });

  test('should compute non-zero cosine similarity for semantically related queries', () => {
    vectorStore.addText(
      'The medical team is stationed near Gate B with defibrillators and first aid kits available.',
      'test-medical'
    );
    const results = vectorStore.query('first aid medical emergency', 3);
    const found = results.find((r) => r.source === 'test-medical');
    expect(found).toBeDefined();
    expect(found!.score).toBeGreaterThan(0.02);
  });
});

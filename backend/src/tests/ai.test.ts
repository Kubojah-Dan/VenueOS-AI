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
            const items = [
              { choices: [{ delta: { content: 'Gate Congestion warning script' } }] },
              { choices: [{ delta: { content: ' is generated successfully.' } }] }
            ];
            
            const iterator = {
              [Symbol.asyncIterator]: function* () {
                for (const item of items) {
                  yield item;
                }
              },
              [Symbol.iterator]: function* () {
                for (const item of items) {
                  yield item;
                }
              }
            };
            
            return iterator;
          })
        }
      }
    };
  });
});

import aiService from '../services/aiService';

describe('AIService Tests', () => {
  test('should return response using streaming completions when Groq is available', async () => {
    let chunks = '';
    let completed = false;

    await new Promise<void>((resolve) => {
      aiService.getStreamingResponse(
        'What is the wait time at Gate A?',
        'Security',
        [],
        (chunk) => {
          chunks += chunk;
        },
        (fullText) => {
          completed = true;
          expect(fullText).toBe(chunks);
          resolve();
        }
      );
    });

    expect(completed).toBe(true);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks).toContain('Gate Congestion');
  });

  test('should properly emulate active incidents for Operations/Security roles when offline/fallback', async () => {
    // Force groq to null to trigger emulator path
    const originalGroq = (aiService as any).groq;
    (aiService as any).groq = null;

    let chunks = '';
    let completed = false;
    
    await new Promise<void>((resolve) => {
      aiService.getStreamingResponse(
        'Show active security incidents',
        'Security',
        [],
        (chunk) => {
          chunks += chunk;
        },
        (fullText) => {
          completed = true;
          expect(fullText).toContain('Incident Report');
          resolve();
        }
      );
    });

    expect(completed).toBe(true);
    expect(chunks.length).toBeGreaterThan(0);
    
    // Restore groq instance
    (aiService as any).groq = originalGroq;
  });
});

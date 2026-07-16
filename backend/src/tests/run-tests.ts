import assert from 'assert';
import ingestionService from '../services/ingestionService';
import aiService from '../services/aiService';

// Custom lightweight test runner for backend services validation
async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING VENUEOS BACKEND UNIT TESTS...');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  const testCases = [
    {
      name: 'Ingestion Service - Statistics Calculation',
      fn: () => {
        const stats = ingestionService.getCompiledStats();
        assert.ok(stats, 'Should return compiled statistics object');
        assert.ok(stats.crowd, 'Stats should contain crowd object');
        assert.ok(typeof stats.crowd.capacity === 'number', 'crowd.capacity should be a number');
        assert.ok(stats.crowd.capacity > 0, 'crowd.capacity should be positive');
      }
    },
    {
      name: 'AI Service - getStreamingResponse Emulator Fallback Works',
      fn: async () => {
        let chunkReceived = false;
        let completeReceived = false;
        let responseContent = '';

        await aiService.getStreamingResponse(
          'What is the congestion state of Gates?',
          'Security',
          [],
          (chunk) => {
            chunkReceived = true;
            responseContent += chunk;
          },
          (fullText) => {
            completeReceived = true;
            assert.strictEqual(fullText, responseContent, 'Full text should match aggregated chunks');
          }
        );

        assert.ok(chunkReceived, 'Should stream chunks');
        assert.ok(completeReceived, 'Should fire completion handler');
      }
    },
    {
      name: 'AI Service - Incident Response Fallback Works',
      fn: async () => {
        let responseContent = '';

        await aiService.getStreamingResponse(
          'Show me active incidents and security alerts',
          'Security',
          [],
          (chunk) => {
            responseContent += chunk;
          },
          (fullText) => {
            // General verification that we get a response
            assert.ok(fullText.length > 0, 'AI response should not be empty');
          }
        );

        assert.ok(responseContent.length > 0, 'Response should not be empty');
      }
    }
  ];

  for (const t of testCases) {
    try {
      await t.fn();
      console.log(`✅ [PASS] ${t.name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${t.name}`);
      console.error(err.stack || err.message || err);
      failed++;
    }
  }

  console.log('====================================================');
  console.log(`📊 TESTS COMPLETE: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

// Globally mock Firebase Config
jest.mock('../config/firebase', () => ({
  firestoreDb: null,
  realtimeDb: null,
  isFirebaseInitialized: false
}));

// Globally mock Groq SDK
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

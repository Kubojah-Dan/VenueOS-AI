import { describe, test, expect } from 'vitest';
import { API_URL, SOCKET_URL } from '../config';

describe('Frontend API URL Normalization Config Tests', () => {
  test('should verify API_URL does not end with a trailing slash', () => {
    expect(API_URL).toBeDefined();
    expect(API_URL.endsWith('/')).toBe(false);
  });

  test('should verify SOCKET_URL does not end with a trailing slash', () => {
    expect(SOCKET_URL).toBeDefined();
    expect(SOCKET_URL.endsWith('/')).toBe(false);
  });
});

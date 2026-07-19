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

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aegisstadium-super-secret-key-FIFA2026';

describe('Authentication & Security Tests', () => {
  // ────────────────────────────────────────────────
  // bcryptjs Password Hashing
  // ────────────────────────────────────────────────
  describe('bcryptjs Password Hashing', () => {
    test('should hash a password with 12 salt rounds', () => {
      const password = 'password123';
      const hash = bcrypt.hashSync(password, 12);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2a$12$') || hash.startsWith('$2b$12$')).toBe(true);
    });

    test('should verify correct password against hash', () => {
      const password = 'securePassword!@#';
      const hash = bcrypt.hashSync(password, 12);
      expect(bcrypt.compareSync(password, hash)).toBe(true);
    });

    test('should reject incorrect password against hash', () => {
      const password = 'correctPassword';
      const wrong = 'wrongPassword';
      const hash = bcrypt.hashSync(password, 12);
      expect(bcrypt.compareSync(wrong, hash)).toBe(false);
    });

    test('should produce different hashes for the same password (salted)', () => {
      const password = 'samePassword';
      const hash1 = bcrypt.hashSync(password, 12);
      const hash2 = bcrypt.hashSync(password, 12);
      expect(hash1).not.toBe(hash2);
      // But both should verify correctly
      expect(bcrypt.compareSync(password, hash1)).toBe(true);
      expect(bcrypt.compareSync(password, hash2)).toBe(true);
    });
  });

  // ────────────────────────────────────────────────
  // JWT Token Signing & Verification
  // ────────────────────────────────────────────────
  describe('JWT HS256 Token Management', () => {
    test('should sign a token with HS256 algorithm', () => {
      const payload = { userId: 'user-123', email: 'test@worldcup2026.org', role: 'Operations' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should verify a token with strict HS256 algorithm enforcement', () => {
      const payload = { userId: 'user-456', email: 'security@worldcup2026.org', role: 'Security' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as any;
      expect(decoded.userId).toBe('user-456');
      expect(decoded.email).toBe('security@worldcup2026.org');
      expect(decoded.role).toBe('Security');
    });

    test('should reject a token signed with a different secret', () => {
      const payload = { userId: 'user-789' };
      const token = jwt.sign(payload, 'wrong-secret', { algorithm: 'HS256' });
      expect(() => {
        jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      }).toThrow();
    });

    test('should reject an expired token', () => {
      const payload = { userId: 'user-expired' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '0s', algorithm: 'HS256' });
      // Small delay to ensure expiry
      expect(() => {
        jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      }).toThrow(/expired/i);
    });

    test('should contain correct iat and exp claims', () => {
      const payload = { userId: 'user-claims' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as any;
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(3600); // 1 hour
    });
  });

  // ────────────────────────────────────────────────
  // Pairwise: bcrypt + JWT Integration
  // ────────────────────────────────────────────────
  describe('Pairwise: Registration → Authentication Flow', () => {
    test('should simulate full register → login → session verification flow', () => {
      // 1. Register: hash password
      const password = 'FIFA2026secure!';
      const passwordHash = bcrypt.hashSync(password, 12);

      // 2. Login: verify password
      const isValid = bcrypt.compareSync(password, passwordHash);
      expect(isValid).toBe(true);

      // 3. Issue session token
      const user = { userId: 'user-reg-001', email: 'fan@worldcup2026.org', role: 'Fan', name: 'Test Fan' };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d', algorithm: 'HS256' });

      // 4. Verify session token
      const session = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as any;
      expect(session.userId).toBe('user-reg-001');
      expect(session.role).toBe('Fan');
    });
  });
});

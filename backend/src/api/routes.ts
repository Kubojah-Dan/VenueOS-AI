import * as admin from 'firebase-admin';
import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { User } from '../database/db';
import ingestionService from '../services/ingestionService';
import aiService from '../services/aiService';
import externalApiService from '../services/externalApiService';
import { firebaseAuth } from '../config/firebase';

const JWT_SECRET = process.env.JWT_SECRET || 'aegisstadium-super-secret-key-FIFA2026';

const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 12);
};

const comparePassword = (password: string, hash: string): boolean => {
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
};

interface VerifiedUserPayload {
  uid: string;
  email: string;
  name?: string;
  role?: string;
}

const verifyAnyToken = async (req: Request): Promise<VerifiedUserPayload | null> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const idToken = authHeader.split(' ')[1];
  if (!idToken) return null;

  // 1. Attempt Firebase Admin token verification
  if (firebaseAuth) {
    try {
      const decoded = await firebaseAuth.verifyIdToken(idToken);
      if (decoded && decoded.email) {
        return {
          uid: decoded.uid,
          email: decoded.email,
          name: decoded.name || decoded.email.split('@')[0]
        };
      }
    } catch {
      // Fallback to local JWT verification below
    }
  }

  // 2. Fallback to local JWT verification
  try {
    const decoded = jwt.verify(idToken, JWT_SECRET, { algorithms: ['HS256'] }) as any;
    if (decoded && (decoded.email || decoded.userId)) {
      return {
        uid: decoded.userId || decoded.id || `user-jwt-${Math.random().toString(36).substring(2, 9)}`,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      };
    }
  } catch {
    // Neither token type valid
  }

  return null;
};

const routes = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// File Upload endpoint (supports CSV, XLS, XLSX, JSON, text, image, video)
routes.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const result = await ingestionService.processUpload(
      req.file.path,
      req.file.originalname,
      req.file.size,
      req.file.mimetype
    );

    // Remove temp file after processing
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(200).json({
      message: 'File uploaded and processed successfully.',
      data: result
    });
  } catch (err: any) {
    console.error('Upload route error:', err);
    return res.status(500).json({ error: err.message || 'Error processing uploaded file.' });
  }
});

// GET Dashboard Overview Metrics
routes.get('/dashboard/overview', (req: Request, res: Response) => {
  const stats = ingestionService.getCompiledStats();
  const matches = db.getMatches();
  const crowd = db.getCrowd();
  const sustainability = db.getSustainability();
  const incidents = db.getIncidents();
  const weather = externalApiService.getCurrentWeather();
  const apiStatus = externalApiService.getApiStatus();

  res.status(200).json({
    stats: {
      ...stats,
      weather,
      apiStatus
    },
    matches,
    crowd,
    sustainability,
    incidents
  });
});

// GET matches
routes.get('/matches', (req: Request, res: Response) => {
  res.status(200).json(db.getMatches());
});

// GET upload history
routes.get('/upload-history', (req: Request, res: Response) => {
  res.status(200).json(db.getUploadHistory());
});

// Incidents Routing
routes.get('/incidents', (req: Request, res: Response) => {
  res.status(200).json(db.getIncidents());
});

routes.post('/incidents', (req: Request, res: Response) => {
  const { category, severity, description, location, coordinates } = req.body;

  const newIncident = {
    id: `inc-${Math.random().toString(36).substr(2, 9)}`,
    category: category || 'Security',
    severity: severity || 'LOW',
    description: description || 'New manual report',
    location: location || 'Stadium Perimeter',
    status: 'REPORTED' as const,
    reportedAt: new Date().toISOString(),
    assignedTeam: 'Unassigned Responder',
    actions: 'Awaiting team assignment.',
    coordinates: coordinates || { x: 48.23, y: 16.37 }
  };

  db.addIncident(newIncident);
  res.status(201).json(newIncident);
});

routes.post('/incidents/resolve', (req: Request, res: Response): any => {
  const { id, actions } = req.body;
  const incidents = db.getIncidents();
  const incident = incidents.find((i) => i.id === id);

  if (incident) {
    incident.status = 'RESOLVED';
    incident.actions = actions || 'Resolved by dashboard command.';
    db.updateIncident(incident);
    return res.status(200).json(incident);
  } else {
    return res.status(404).json({ error: 'Incident not found' });
  }
});

routes.post('/ai/query', async (req: Request, res: Response): Promise<any> => {
  const { query, role, history } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query prompt string is required.' });
  }

  let textReceived = '';
  try {
    await aiService.getStreamingResponse(
      query,
      role || 'Fan',
      history || [],
      (chunk) => {
        textReceived += chunk;
      },
      () => {
        res.status(200).json({ response: textReceived });
      }
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing AI query' });
  }
});

// ==========================================
// AUTHENTICATION SYSTEM (Firebase + JWT Fallback)
// ==========================================

// POST /api/auth/register
routes.post('/auth/register', async (req: Request, res: Response): Promise<any> => {
  const { name, email, password, role } = req.body;

  // 1. Check if token authenticated (Firebase / JWT)
  const verified = await verifyAnyToken(req);
  const targetEmail = (verified?.email || email || '').toLowerCase();
  const targetName = verified?.name || name || targetEmail.split('@')[0] || 'Operator';
  const targetRole = role || verified?.role || 'Fan';

  if (!targetEmail) {
    return res.status(400).json({ error: 'All fields (name, email, password, role) are required.' });
  }

  const users = db.getUsers();
  const existingUser = users.find(u => u.email.toLowerCase() === targetEmail);
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: verified ? `user-firebase-${verified.uid}` : `user-${Math.random().toString(36).substring(2, 9)}`,
    name: targetName,
    email: targetEmail,
    passwordHash: password ? hashPassword(password) : hashPassword(Math.random().toString(36)),
    role: targetRole as any
  };

  db.addUser(newUser);

  const token = req.headers.authorization?.split(' ')[1] || jwt.sign(
    { userId: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// POST /api/auth/login
routes.post('/auth/login', async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  // 1. Try Token-based authentication (Firebase / JWT)
  const verified = await verifyAnyToken(req);
  if (verified && verified.email) {
    const users = db.getUsers();
    let user = users.find(u => u.email.toLowerCase() === verified.email.toLowerCase());
    if (!user) {
      user = {
        id: `user-firebase-${verified.uid}`,
        name: verified.name || verified.email.split('@')[0],
        email: verified.email.toLowerCase(),
        passwordHash: hashPassword(Math.random().toString(36)),
        role: (verified.role || 'Fan') as any
      };
      db.addUser(user);
    }

    const token = req.headers.authorization?.split(' ')[1] || jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }

  // 2. Direct email + password authentication fallback
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.toLowerCase();
  const users = db.getUsers();
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);

  // Check fallback operator credentials
  if (!user) {
    const fallbackPasswords: Record<string, string> = {
      'director@worldcup2026.org': 'password123',
      'security@worldcup2026.org': 'password123',
      'volunteer@worldcup2026.org': 'password123',
      'fan@worldcup2026.org': 'password123'
    };
    const fallbackRoles: Record<string, 'Operations' | 'Security' | 'Volunteer' | 'Fan'> = {
      'director@worldcup2026.org': 'Operations',
      'security@worldcup2026.org': 'Security',
      'volunteer@worldcup2026.org': 'Volunteer',
      'fan@worldcup2026.org': 'Fan'
    };

    if (fallbackPasswords[cleanEmail] && fallbackPasswords[cleanEmail] === password) {
      const fallbackUser: User = {
        id: `user-fallback-${fallbackRoles[cleanEmail]}`,
        name: `${fallbackRoles[cleanEmail]} Shift Supervisor`,
        email: cleanEmail,
        passwordHash: hashPassword(password),
        role: fallbackRoles[cleanEmail]
      };

      const token = jwt.sign(
        { userId: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role, name: fallbackUser.name },
        JWT_SECRET,
        { expiresIn: '7d', algorithm: 'HS256' }
      );

      return res.status(200).json({
        token,
        user: { id: fallbackUser.id, name: fallbackUser.name, email: fallbackUser.email, role: fallbackUser.role }
      });
    }

    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (!comparePassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );

  res.status(200).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// POST /api/auth/google (Federated Identity Provider)
routes.post('/auth/google', async (req: Request, res: Response): Promise<any> => {
  const verified = await verifyAnyToken(req);
  const { name, email, role } = req.body;
  const targetEmail = (verified?.email || email || '').toLowerCase();
  const targetName = verified?.name || name || targetEmail.split('@')[0] || 'Google User';
  const targetRole = role || verified?.role || 'Fan';

  if (!targetEmail) {
    return res.status(400).json({ error: 'Google email and name are required.' });
  }

  const users = db.getUsers();
  let user = users.find(u => u.email.toLowerCase() === targetEmail);

  if (!user) {
    user = {
      id: verified ? `user-firebase-${verified.uid}` : `user-google-${Math.random().toString(36).substring(2, 9)}`,
      name: targetName,
      email: targetEmail,
      passwordHash: hashPassword(Math.random().toString(36)),
      role: targetRole as any
    };
    db.addUser(user);
  }

  const token = req.headers.authorization?.split(' ')[1] || jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );

  res.status(200).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// GET /api/auth/me (Protected Profile Check)
routes.get('/auth/me', async (req: Request, res: Response): Promise<any> => {
  const verified = await verifyAnyToken(req);
  if (!verified || !verified.email) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or missing session token.' });
  }

  const email = verified.email.toLowerCase();
  const users = db.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email);

  if (user) {
    return res.status(200).json({ user });
  }

  return res.status(200).json({
    user: {
      id: `user-session-${verified.uid}`,
      name: verified.name || email.split('@')[0],
      email,
      role: verified.role || 'Fan'
    }
  });
});

export default routes;

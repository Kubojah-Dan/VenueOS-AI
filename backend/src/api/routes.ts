import * as admin from 'firebase-admin';
import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import bcrypt from 'bcryptjs';
import db, { User } from '../database/db';
import ingestionService from '../services/ingestionService';
import aiService from '../services/aiService';
import externalApiService from '../services/externalApiService';
import { firebaseAuth } from '../config/firebase';

const JWT_SECRET = process.env.JWT_SECRET || 'aegisstadium-super-secret-key-FIFA2026';

const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 12);
};

const verifyFirebaseIdToken = async (req: Request): Promise<admin.auth.DecodedIdToken | null> => {
  if (!firebaseAuth) return null;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const idToken = authHeader.split(' ')[1];

  try {
    return await firebaseAuth.verifyIdToken(idToken);
  } catch (err) {
    return null;
  }
};

const comparePassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
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

routes.post('/incidents/resolve', (req: Request, res: Response) => {
  const { id, actions } = req.body;
  const incidents = db.getIncidents();
  const incident = incidents.find((i) => i.id === id);

  if (incident) {
    incident.status = 'RESOLVED';
    incident.actions = actions || 'Resolved by dashboard command.';
    db.updateIncident(incident);
    res.status(200).json(incident);
  } else {
    res.status(404).json({ error: 'Incident not found' });
  }
});

// AI Chat query (non-streaming fallback, returns complete text)
routes.post('/chat', async (req: Request, res: Response) => {
  const { query, role, history } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query string is required' });
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
// AUTHENTICATION SYSTEM (JWT + Google + Firebase fallback)
// ==========================================

// POST /api/auth/register
routes.post('/auth/register', async (req: Request, res: Response): Promise<any> => {
  const decoded = await verifyFirebaseIdToken(req);
  if (!decoded || !decoded.email) {
    return res.status(401).json({ error: 'Invalid or missing Firebase ID token.' });
  }

  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Role is required for registration.' });
  }

  const email = decoded.email.toLowerCase();
  const name = decoded.name || decoded.email.split('@')[0];
  const users = db.getUsers();

  const existingUser = users.find(u => u.email.toLowerCase() === email);
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: `user-firebase-${decoded.uid}`,
    name,
    email,
    passwordHash: hashPassword(Math.random().toString(36)),
    role: role as any
  };

  db.addUser(newUser);

  const token = req.headers.authorization?.split(' ')[1] || '';

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
  const decoded = await verifyFirebaseIdToken(req);
  if (!decoded || !decoded.email) {
    return res.status(401).json({ error: 'Invalid or missing Firebase ID token.' });
  }

  const email = decoded.email.toLowerCase();
  const users = db.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email);

  if (!user) {
    return res.status(404).json({ error: 'User not found. Please register first.' });
  }

  const token = req.headers.authorization?.split(' ')[1] || '';

  res.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// POST /api/auth/google (Federated Identity Provider)
routes.post('/auth/google', async (req: Request, res: Response): Promise<any> => {
  const decoded = await verifyFirebaseIdToken(req);
  if (!decoded || !decoded.email) {
    return res.status(401).json({ error: 'Invalid or missing Firebase ID token.' });
  }

  const role = req.body.role || 'Fan';
  const email = decoded.email.toLowerCase();
  const name = decoded.name || decoded.email.split('@')[0];
  const users = db.getUsers();

  let user = users.find(u => u.email.toLowerCase() === email);

  if (!user) {
    user = {
      id: `user-firebase-${decoded.uid}`,
      name,
      email,
      passwordHash: hashPassword(Math.random().toString(36)),
      role: role as any
    };
    db.addUser(user);
  }

  const token = req.headers.authorization?.split(' ')[1] || '';

  res.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// GET /api/auth/me (Protected Profile Check)
routes.get('/auth/me', async (req: Request, res: Response): Promise<any> => {
  const decoded = await verifyFirebaseIdToken(req);
  if (!decoded || !decoded.email) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or missing Firebase ID token.' });
  }

  const email = decoded.email.toLowerCase();
  const users = db.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email);

  if (user) {
    return res.status(200).json({ user });
  }

  return res.status(200).json({
    user: {
      id: `user-firebase-${decoded.uid}`,
      name: decoded.name || email.split('@')[0],
      email,
      role: 'Fan'
    }
  });
});

export default routes;

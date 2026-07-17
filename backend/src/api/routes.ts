import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import jwt from 'jsonwebtoken';
import db, { User } from '../database/db';
import ingestionService from '../services/ingestionService';
import aiService from '../services/aiService';
import externalApiService from '../services/externalApiService';

const JWT_SECRET = process.env.JWT_SECRET || 'venueos-super-secret-key-FIFA2026';

const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
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
routes.post('/auth/register', (req: Request, res: Response): any => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields (name, email, password, role) are required.' });
  }

  const users = db.getUsers();
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    role: role as any
  };

  db.addUser(newUser);

  // Generate JWT Session Token
  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
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
routes.post('/auth/login', (req: Request, res: Response): any => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = db.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // Check custom hardcoded fallback users if database is empty or they use default credentials
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

    if (fallbackPasswords[email.toLowerCase()] && fallbackPasswords[email.toLowerCase()] === password) {
      const fallbackUser: User = {
        id: `user-fallback-${fallbackRoles[email.toLowerCase()]}`,
        name: `${fallbackRoles[email.toLowerCase()]} Shift Supervisor`,
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        role: fallbackRoles[email.toLowerCase()]
      };
      
      const token = jwt.sign(
        { userId: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role, name: fallbackUser.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.status(200).json({
        token,
        user: {
          id: fallbackUser.id,
          name: fallbackUser.name,
          email: fallbackUser.email,
          role: fallbackUser.role
        }
      });
    }

    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

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
routes.post('/auth/google', (req: Request, res: Response): any => {
  const { email, name, role } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Google email and name are required.' });
  }

  const users = db.getUsers();
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Register as new user via Google
    user = {
      id: `user-google-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(Math.random().toString(36)), // random fallback password
      role: (role || 'Fan') as any
    };
    db.addUser(user);
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

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
routes.get('/auth/me', (req: Request, res: Response): any => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Missing token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    res.status(200).json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized. Invalid session token.' });
  }
});

export default routes;

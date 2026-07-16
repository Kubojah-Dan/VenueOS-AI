import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import db from '../database/db';
import ingestionService from '../services/ingestionService';
import aiService from '../services/aiService';
import externalApiService from '../services/externalApiService';

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

export default routes;

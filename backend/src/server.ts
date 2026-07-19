import express from 'express';
import * as http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import apiRoutes from './api/routes';
import db from './database/db';
import vectorStore from './database/vectorStore';
import wsService from './services/websocketService';
import externalApiService from './services/externalApiService';

// Read Environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // disable CSP to avoid blocking Leaflet maps / sockets resources in production
}));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API mounting
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'OK', service: 'aegisstadium-ai-backend', timestamp: new Date().toISOString() });
});

// Initialize and Boot System Components
async function startServer() {
  try {
    // 1. Load database collections (local vs firebase)
    await db.init();

    // 2. Load static document embeddings into similarity database
    await vectorStore.initialize();

    // 3. Attach Socket.IO to the HTTP server
    wsService.initialize(server);

    // 4. Boot external polling integrations (Weather & Matches)
    externalApiService.initialize();

    // 4. Start listening
    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  AEGISSTADIUM AI - SMART STADIUM OPERATING SYSTEM  `);
      console.log(`  Running on: http://localhost:${PORT}             `);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Critical boot error in AegisStadium AI Server:', err);
    process.exit(1);
  }
}

startServer();

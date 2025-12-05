import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import { createServer } from 'http';
import { initSocket } from './services/socket.service.js';

// Routes
import briefsRoutes from './api/briefs.routes.js';
import postsRoutes from './api/posts.routes.js';
import contentRoutes from './api/content.routes.js';
import publishRoutes from './api/publish.routes.js';
import platformsRoutes from './api/platforms.routes.js';
import calendarRoutes from './api/calendar.routes.js';
import settingsRoutes from './api/settings.routes.js';
import quickPostRoutes from './api/quick-post.routes.js';
import analyticsRoutes from './api/analytics.routes.js';
import historyRoutes from './api/history.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize WebSocket
initSocket(httpServer);

// Create necessary directories
const uploadsDir = process.env.UPLOADS_DIR || './uploads';
const dataDir = join(dirname(process.env.DATABASE_PATH || './data/scheduler.db'), '../');
mkdirSync(uploadsDir, { recursive: true });
mkdirSync(dataDir, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/briefs', briefsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/publish', publishRoutes);
app.use('/api/platforms', platformsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/quick-post', quickPostRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/history', historyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   Social Scheduler Backend 🚀        ║
╚═══════════════════════════════════════╝

Server running on: http://localhost:${PORT}
WebSocket: ws://localhost:${PORT}
Environment: ${process.env.NODE_ENV || 'development'}

API Endpoints:
  POST   /api/briefs              - Create brief
  GET    /api/briefs              - List briefs
  POST   /api/briefs/:id/generate - Generate posts
  GET    /api/briefs/:id/posts    - Get posts
  
  PUT    /api/posts/:id           - Edit post
  POST   /api/posts/:id/approve   - Approve post
  POST   /api/posts/:id/publish   - Publish post
  POST   /api/posts/:id/status    - Callback from Make.com
  
  POST   /api/publish/brief/:id   - Publish all posts
  
  GET    /api/platforms           - List platforms
  PUT    /api/platforms/:id       - Update platform

Ready! 🎯
  `);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import tracksRouter from './routes/tracks.js';
import playlistRouter from './routes/playlist.js';
import { initWebSocketServer } from './websocket/server.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route - redirect to frontend or show API info
app.get('/', (req, res) => {
  res.json({
    message: 'Collaborative Playlist API',
    version: '1.0.0',
    endpoints: {
      tracks: '/api/tracks',
      playlist: '/api/playlist',
      health: '/health',
      websocket: 'ws://localhost:4000'
    },
    frontend: 'http://localhost:3000'
  });
});

// API Routes
app.use('/api/tracks', tracksRouter);
app.use('/api/playlist', playlistRouter);

// Initialize WebSocket server
initWebSocketServer(server);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready on ws://localhost:${PORT}`);
});

// Export for tests
export default app;


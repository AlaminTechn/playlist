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


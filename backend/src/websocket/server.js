import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

let wss = null;
const clients = new Map();

/**
 * Initialize WebSocket server
 */
export function initWebSocketServer(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    const clientId = uuidv4();
    clients.set(clientId, ws);
    
    console.log(`Client connected: ${clientId} (Total: ${clients.size})`);

    // Send welcome message
    sendToClient(ws, {
      type: 'connected',
      client_id: clientId,
      ts: new Date().toISOString(),
    });

    // Handle ping/pong for keepalive
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`Client disconnected: ${clientId} (Total: ${clients.size})`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      clients.delete(clientId);
    });

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        // Echo heartbeat
        if (message.type === 'ping') {
          sendToClient(ws, {
            type: 'pong',
            ts: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Mark as alive
    ws.isAlive = true;
  });

  // Heartbeat interval to keep connections alive
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // 30 seconds

  // Send periodic ping message
  const pingInterval = setInterval(() => {
    broadcast({
      type: 'ping',
      ts: new Date().toISOString(),
    });
  }, 25000); // 25 seconds

  // Cleanup on server shutdown
  process.on('SIGINT', () => {
    clearInterval(heartbeatInterval);
    clearInterval(pingInterval);
    wss.close();
  });

  return wss;
}

/**
 * Send message to a specific client
 */
function sendToClient(ws, message) {
  if (ws.readyState === ws.OPEN) {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message to client:', error);
    }
  }
}

/**
 * Broadcast message to all connected clients
 */
export function broadcast(message) {
  if (!wss) return;

  const payload = JSON.stringify(message);
  let sentCount = 0;

  wss.clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(payload);
        sentCount++;
      } catch (error) {
        console.error('Error broadcasting to client:', error);
      }
    }
  });

  return sentCount;
}

/**
 * Broadcast playlist event
 */
export function broadcastPlaylistEvent(type, data) {
  broadcast({
    type,
    ...data,
    ts: new Date().toISOString(),
  });
}


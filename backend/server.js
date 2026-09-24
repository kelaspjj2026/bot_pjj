require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');
const { seedData } = require('./config/seed');
const { PORT, BASE_PATH } = require('./config/constants');
const { initWA, closeWA } = require('./services/waService');
const { startScheduler } = require('./services/schedulerService');

const isVercel = process.env.VERCEL === '1';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://cswa.latifdev.com',
      'https://bot-pjj.vercel.app',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: `${BASE_PATH}/socket.io`
});

const SOCKET_PATH = `${BASE_PATH}/socket.io`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files — cache busting: browser tidak menyimpan cache lama
app.use(BASE_PATH, express.static(path.join(__dirname, 'frontend'), { maxAge: 0, etag: false }));

// Socket.io client library serving
app.get(`${SOCKET_PATH}/socket.io.js`, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'node_modules', 'socket.io', 'client-dist', 'socket.io.js'));
});

// API Routes
app.use(`${BASE_PATH}/api/matkul`, require('./routes/matkulRoutes'));
app.use(`${BASE_PATH}/api/jadwal`, require('./routes/jadwalRoutes'));
app.use(`${BASE_PATH}/api/pengumuman`, require('./routes/pengumumanRoutes'));
app.use(`${BASE_PATH}/api/tugas`, require('./routes/tugasRoutes'));
app.use(`${BASE_PATH}/api/mahasiswa`, require('./routes/mahasiswaRoutes'));
app.use(`${BASE_PATH}/api/rangkuman`, require('./routes/rangkumanRoutes'));
app.use(`${BASE_PATH}/api/settings`, require('./routes/settingsRoutes'));
app.use(`${BASE_PATH}/api/dashboard`, require('./routes/dashboardRoutes'));
app.use(`${BASE_PATH}/api/sync`, require('./routes/syncRoutes'));
app.use(`${BASE_PATH}/api/titip-absen`, require('./routes/titipAbsenRoutes'));

// Health check
app.get(`${BASE_PATH}/health`, (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for non-API routes
app.get(`${BASE_PATH}*`, (req, res) => {
  if (req.path.startsWith(`${BASE_PATH}/api/`) || req.path.startsWith(SOCKET_PATH)) {
    return res.status(404).json({ error: 'Endpoint tidak ditemukan' });
  }
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('[Socket] Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('[Socket] Client disconnected:', socket.id);
  });
});

// Expose io and SOCKET_PATH for waService
global.io = io;
global.SOCKET_PATH = SOCKET_PATH;

// Vercel: export app for serverless
if (isVercel) {
  let initialized = false;
  const ensureInit = async () => {
    if (!initialized) {
      await connectDB();
      await seedData();
      initialized = true;
    }
  };
  app.use(async (req, res, next) => {
    try {
      await ensureInit();
    } catch (err) {
      console.error('[Vercel] Init error:', err.message);
    }
    next();
  });
  module.exports = app;
} else {
  // Local / Docker: start full server
  const start = async () => {
    await connectDB();
    await seedData();
    await initWA(io);
    startScheduler();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Bot WhatsApp PJJ berjalan di port ${PORT}`);
      console.log(`[Server] BASE_PATH: ${BASE_PATH}`);
      console.log(`[Server] URL: http://localhost:${PORT}${BASE_PATH}`);
      console.log(`[Server] Socket.IO path: ${SOCKET_PATH}`);
    });
  };

  start().catch((err) => {
    console.error('[Server] Fatal error:', err);
    process.exit(1);
  });

  // Graceful shutdown — tangkap SIGTERM & SIGINT sebelum container berhenti
  const gracefulShutdown = async (signal) => {
    console.log(`[Server] Received ${signal}, shutting down gracefully...`);
    try {
      await closeWA();
      console.log('[Server] WA connection closed, session files preserved');
    } catch (err) {
      console.error('[Server] Error during shutdown:', err.message);
    }
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
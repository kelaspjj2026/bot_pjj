const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

// Middleware: log setiap request sync masuk ke terminal/docker log
const syncLogger = (req, res, next) => {
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  const timestamp = new Date().toISOString();
  console.log(`[Sync] Incoming ${req.method} ${req.originalUrl} from ${clientIP} at ${timestamp}`);
  if (req.body && typeof req.body === 'object') {
    const itemCount = Array.isArray(req.body) ? req.body.length : (req.body.data ? req.body.data.length : 1);
    console.log(`[Sync] Payload: ${itemCount} item(s)`);
  }
  next();
};

router.use(syncLogger);

router.post('/mahasiswa', syncController.syncMahasiswa);
router.post('/pengumuman', syncController.syncPengumuman);
router.post('/tugas', syncController.syncTugas);
router.post('/rangkuman', syncController.syncRangkuman);
router.post('/titip-absen', syncController.syncTitipAbsen);

module.exports = router;

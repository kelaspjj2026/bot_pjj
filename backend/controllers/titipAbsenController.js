const { TitipAbsen } = require('../models');

// Helper: dapatkan waktu WIB dari Date object
const getWIBDate = (date) => {
  return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
};

// Helper: parse timestamp string ke Date object (UTC) — SELALU interpret sebagai WIB (UTC+7)
// Mendukung format: "M/D/YYYY HH:mm:ss", "DD/MM/YYYY, HH:mm:ss", "YYYY-MM-DD HH:mm:ss", ISO string
const parseTimestamp = (timestamp) => {
  if (!timestamp) return null;
  const str = String(timestamp).trim();

  // 1. ISO format dengan T: "2026-09-23T22:38:57" — treat sebagai WIB, geser -7 jam ke UTC
  if (str.includes('T')) {
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) return new Date(d.getTime() - 7 * 60 * 60 * 1000);
    } catch (_) {}
  }

  // 2. Format dengan dash: "YYYY-MM-DD HH:mm:ss"
  const dashMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
  if (dashMatch) {
    try {
      const [, year, month, day, hour, minute, second] = dashMatch;
      return new Date(Date.UTC(
        parseInt(year), parseInt(month) - 1, parseInt(day),
        parseInt(hour) - 7, parseInt(minute), parseInt(second)
      ));
    } catch (_) {}
  }

  // 3. Format dengan slash: "M/D/YYYY HH:mm:ss" atau "DD/MM/YYYY, HH:mm:ss"
  if (str.includes('/')) {
    try {
      const cleaned = str.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
      const parts = cleaned.split(' ');
      const dateParts = parts[0].split('/');
      const timeParts = (parts[1] || '00:00:00').split(':');
      const p0 = parseInt(dateParts[0], 10);
      const p1 = parseInt(dateParts[1], 10);
      const year = parseInt(dateParts[2], 10);
      const hour = parseInt(timeParts[0], 10);
      const minute = parseInt(timeParts[1], 10);
      const second = parseInt(timeParts[2] || 0, 10);
      let month, day;
      if (p0 > 12) { day = p0; month = p1; }
      else if (p1 > 12) { month = p0; day = p1; }
      else { month = p0; day = p1; }
      return new Date(Date.UTC(year, month - 1, day, hour - 7, minute, second));
    } catch (_) {}
  }

  // 4. Fallback: gunakan native Date parser
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  } catch (_) {}

  return null;
};

// Helper: Active Absence Window (WIB) — sama dengan syncController
const getActiveAbsenceWindow = () => {
  const nowWIB = getWIBDate(new Date());
  const hour = nowWIB.getHours();
  const minute = nowWIB.getMinutes();
  const nowMinutes = hour * 60 + minute;

  const SIX_PM = 18 * 60;
  const SEVEN_AM = 7 * 60;

  let windowStart, windowEnd;

  if (nowMinutes >= SIX_PM) {
    windowStart = new Date(nowWIB);
    windowStart.setHours(18, 0, 0, 0);
    windowEnd = new Date(nowWIB);
    windowEnd.setDate(windowEnd.getDate() + 1);
    windowEnd.setHours(7, 0, 0, 0);
  } else if (nowMinutes < SEVEN_AM) {
    windowStart = new Date(nowWIB);
    windowStart.setDate(windowStart.getDate() - 1);
    windowStart.setHours(18, 0, 0, 0);
    windowEnd = new Date(nowWIB);
    windowEnd.setHours(7, 0, 0, 0);
  } else {
    windowStart = new Date(nowWIB);
    windowStart.setDate(windowStart.getDate() - 1);
    windowStart.setHours(18, 0, 0, 0);
    windowEnd = new Date(nowWIB);
    windowEnd.setHours(7, 0, 0, 0);
  }

  return { windowStart, windowEnd };
};

// GET /bot/api/titip-absen — hanya data dalam Active Absence Window
exports.getAll = async (req, res) => {
  try {
    const { windowStart, windowEnd } = getActiveAbsenceWindow();

    // Ambil semua data, lalu filter in-memory karena timestamp disimpan sebagai string
    const allData = await TitipAbsen.find();
    const filtered = allData.filter(doc => {
      const ts = parseTimestamp(doc.timestamp);
      if (!ts) return false;
      const tsWIB = getWIBDate(ts);
      return tsWIB >= windowStart && tsWIB < windowEnd;
    });

    // Sort by timestamp descending
    filtered.sort((a, b) => {
      const tsA = parseTimestamp(a.timestamp);
      const tsB = parseTimestamp(b.timestamp);
      return (tsB ? tsB.getTime() : 0) - (tsA ? tsA.getTime() : 0);
    });

    res.json({
      success: true,
      data: filtered,
      window: {
        start: windowStart.toISOString(),
        end: windowEnd.toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await TitipAbsen.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    const io = global.io;
    if (io) io.emit('titip_absen:updated', { count: -1 });

    res.json({ success: true, message: 'Berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearAll = async (req, res) => {
  try {
    const result = await TitipAbsen.deleteMany({});

    const io = global.io;
    if (io) io.emit('titip_absen:updated', { count: 0 });

    res.json({ success: true, message: `Semua data titip absen dihapus (${result.deletedCount} record)` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

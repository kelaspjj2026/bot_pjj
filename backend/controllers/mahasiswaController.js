const { Mahasiswa } = require('../models');
const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOAD_DIR } = require('../config/constants');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Helper: ekstrak 5 digit terakhir NIM
const getNimSuffix = (nim) => parseInt(String(nim).split('.').pop() || '0', 10);

// Helper: sort & re-index seluruh data mahasiswa by NIM suffix
const sortAndReindexMahasiswa = async () => {
  const allData = await Mahasiswa.find();
  const sorted = allData.sort((a, b) => getNimSuffix(a.nim) - getNimSuffix(b.nim));
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].nomor !== i + 1) {
      await Mahasiswa.findByIdAndUpdate(sorted[i]._id, { nomor: i + 1 });
    }
  }
  return sorted.length;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls', '.csv'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File harus berformat .xlsx, .xls, atau .csv'));
    }
  },
}).single('file');

exports.uploadMiddleware = upload;

exports.getAll = async (req, res) => {
  try {
    // Sort by NIM suffix ascending + re-index
    await sortAndReindexMahasiswa();
    const data = await Mahasiswa.find().sort({ nomor: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await Mahasiswa.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await Mahasiswa.create(req.body);

    // Re-index semua data berdasarkan NIM suffix
    await sortAndReindexMahasiswa();

    // Sync ke Google Sheets (non-blocking)
    const { syncMahasiswaUpdate } = require('../services/gasSyncService');
    syncMahasiswaUpdate(data);

    // Emit Socket.IO untuk real-time dashboard update
    const io = global.io;
    if (io) io.emit('mahasiswa:updated', data);

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await Mahasiswa.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan' });

    // Re-index semua data berdasarkan NIM suffix
    await sortAndReindexMahasiswa();

    // Sync ke Google Sheets (non-blocking)
    const { syncMahasiswaUpdate } = require('../services/gasSyncService');
    syncMahasiswaUpdate(data);

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await Mahasiswa.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan' });

    // Re-index semua data berdasarkan NIM suffix
    await sortAndReindexMahasiswa();

    // Sync ke Google Sheets (non-blocking)
    const { syncMahasiswaDelete } = require('../services/gasSyncService');
    syncMahasiswaDelete(data);

    res.json({ success: true, message: 'Berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.importExcel = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'File tidak ditemukan' });

    try {
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const requiredHeaders = ['nomor', 'nama', 'nim', 'wa'];
      const fileHeaders = Object.keys(rows[0] || {}).map(h => h.toLowerCase().trim());
      const hasAllHeaders = requiredHeaders.every(h => fileHeaders.includes(h));

      if (!hasAllHeaders) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: `Header file harus: ${requiredHeaders.join(', ')}`,
        });
      }

      let imported = 0;
      let skipped = 0;

      for (const row of rows) {
        const nomor = row.nomor;
        const nama = row.nama;
        const nim = String(row.nim || '').trim();
        const wa = String(row.wa || '').trim();

        if (!nim || !nama || !wa) {
          skipped++;
          continue;
        }

        try {
          await Mahasiswa.findOneAndUpdate(
            { nim },
            { nomor, nama, nim, wa },
            { upsert: true, new: true, runValidators: true }
          );
          imported++;
        } catch {
          skipped++;
        }
      }

      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        message: `Import selesai: ${imported} berhasil, ${skipped} dilewati`,
        imported,
        skipped,
      });
    } catch (err) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ success: false, message: err.message });
    }
  });
};

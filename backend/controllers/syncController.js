const { Mahasiswa, Matkul, Pengumuman, Tugas, Rangkuman, TitipAbsen } = require('../models');

// Helper: ekstrak 5 digit terakhir NIM
const getNimSuffix = (nim) => parseInt(String(nim).split('.').pop() || '0', 10);

// Helper: check if NIM is valid (flexible multi-tab: A prefix + 2 digits . 4 digits . 5 digits)
const isValidNIM = (nim) => {
  if (!nim) return false;
  const str = String(nim).trim();
  if (str.length < 10 || str.length > 20) return false;
  if (/\s/.test(str)) return false;
  if (/[^A-Za-z0-9.]/.test(str)) return false;
  return /^A\d{2}\.\d{4}\.\d{5}$/i.test(str);
};

// Helper: check if row is header/empty/garbage
const isHeaderOrEmpty = (item, requiredFields) => {
  if (!item || typeof item !== 'object') return true;
  const headerKeywords = ['nama', 'judul', 'matkul', 'isi', 'nim', 'no', 'nomor', 'name', 'nim/nama', 'daftar', 'data'];
  for (const field of requiredFields) {
    const val = String(item[field] || '').trim().toLowerCase();
    if (!val) return true;
    if (headerKeywords.includes(val)) return true;
    if (val.length < 2) return true;
  }
  return false;
};

// Helper: sort & re-index semua mahasiswa berdasarkan suffix NIM
const sortAndReindexMahasiswa = async () => {
  const allDocs = await Mahasiswa.find();
  const allSorted = allDocs.sort((a, b) => getNimSuffix(a.nim) - getNimSuffix(b.nim));
  for (let i = 0; i < allSorted.length; i++) {
    if (allSorted[i].nomor !== i + 1) {
      await Mahasiswa.findByIdAndUpdate(allSorted[i]._id, { nomor: i + 1 });
    }
  }
  return allSorted;
};

// Helper: format nomor WhatsApp ke standar Indonesia (08xxx / 628xxx)
const formatWhatsAppNumber = (val) => {
  let num = String(val || '').replace(/[^0-9]/g, '').trim();
  if (!num) return '';
  // Normalisasi: hilangkan leading 62 atau +62
  if (num.startsWith('62')) {
    num = '0' + num.substring(2);
  }
  // Pastikan diawali 0 untuk format lokal
  if (!num.startsWith('0')) {
    num = '0' + num;
  }
  return num;
};

// POST /api/sync/mahasiswa — flex parsing, per-item try-catch, upsert, sort, re-index
exports.syncMahasiswa = async (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  const timestamp = new Date().toISOString();
  console.log(`[Sync] === MAHASISWA SYNC REQUEST from ${clientIP} at ${timestamp} ===`);

  const payload = req.body;

  // Flexible parsing: terima array langsung, {data: [...]}, atau {rows: [...]}
  let dataArray = [];
  if (Array.isArray(payload)) {
    dataArray = payload;
  } else if (payload && Array.isArray(payload.data)) {
    dataArray = payload.data;
  } else if (payload && Array.isArray(payload.rows)) {
    dataArray = payload.rows;
  } else if (payload && typeof payload === 'object') {
    if (payload.nim && isValidNIM(String(payload.nim))) {
      dataArray = [payload];
    }
  }

  if (!dataArray.length) {
    return res.status(400).json({ success: false, message: 'Payload kosong atau format tidak dikenali' });
  }

  const uniqueMap = new Map();
  let filtered = 0;
  let invalid = 0;
  let duplicated = 0;

  for (const item of dataArray) {
    try {
      const nim = String(item.nim || item.NIM || '').trim();
      const nama = String(item.nama || item.NAMA || item.name || '').trim();
      // Flexible WhatsApp field mapping: wa, WA, whatsapp, phone, no_wa, nomor_wa, no.wa
      const waRaw = String(item.wa || item.WA || item.whatsapp || item.phone || item.no_wa || item.nomor_wa || item['no.wa'] || '').trim();
      const wa = formatWhatsAppNumber(waRaw);
      const nomor = Number(item.nomor || item.no || 0);

      if (!nim || !nama) { filtered++; continue; }
      if (['nama', 'nomor', 'no', 'nim', 'judul', 'name'].includes(nama.toLowerCase())) { filtered++; continue; }
      if (!isValidNIM(nim)) { invalid++; continue; }
      if (uniqueMap.has(nim)) { duplicated++; continue; }

      uniqueMap.set(nim, { nama, nim, wa, nomor });
    } catch (itemErr) {
      console.warn('[Sync] Mahasiswa item skip:', itemErr.message);
      filtered++;
    }
  }

  const sorted = Array.from(uniqueMap.values()).sort((a, b) => getNimSuffix(a.nim) - getNimSuffix(b.nim));

  let upserted = 0;
  let upsertErrors = 0;
  for (const item of sorted) {
    try {
      await Mahasiswa.findOneAndUpdate(
        { nim: item.nim },
        { $set: item },
        { upsert: true, new: true }
      );
      upserted++;
    } catch (upsertErr) {
      console.error('[Sync] Mahasiswa upsert error:', item.nim, upsertErr.message);
      upsertErrors++;
    }
  }

  const allSorted = await sortAndReindexMahasiswa();

  const io = global.io;
  if (io) io.emit('mahasiswa:updated', { count: allSorted.length });

  const summary = `Mahasiswa: ${upserted} upserted, ${allSorted.length} total, ${filtered} filtered, ${invalid} invalid NIM, ${duplicated} duplicated, ${upsertErrors} upsert errors`;
  console.log(`[Sync] ${summary}`);
  console.log(`[Sync] === SYNC COMPLETE from ${clientIP} - ${upserted} records processed ===`);
  res.json({
    success: true,
    message: `${upserted} mahasiswa berhasil disinkronkan`,
    count: upserted,
    total: allSorted.length,
    filtered,
    invalid,
    duplicated,
    upsertErrors
  });
};

// POST /api/sync/pengumuman — skip headers, upsert/update
exports.syncPengumuman = async (req, res) => {
  try {
    const payload = req.body;
    const dataArray = Array.isArray(payload) ? payload : (payload.data || []);

    if (!dataArray.length) {
      return res.status(400).json({ success: false, message: 'Payload kosong' });
    }

    let synced = 0;
    let skipped = 0;
    for (const item of dataArray) {
      // Skip header/empty
      if (isHeaderOrEmpty(item, ['judul'])) { skipped++; continue; }

      const judul = String(item.judul || '').trim();
      if (!judul || judul.length < 2) { skipped++; continue; }

      // Handle repeat_days: bisa string koma atau array
      let repeatDays = [];
      if (Array.isArray(item.repeat_days)) {
        repeatDays = item.repeat_days;
      } else if (typeof item.repeat_days === 'string' && item.repeat_days.trim()) {
        repeatDays = item.repeat_days.split(',').map(s => s.trim()).filter(Boolean);
      }

      await Pengumuman.findOneAndUpdate(
        { judul },
        {
          judul,
          isi: String(item.isi || '').trim(),
          is_recurring: item.is_recurring === true || item.is_recurring === 'true',
          schedule_time: String(item.schedule_time || '').trim(),
          repeat_days: repeatDays,
          is_active: item.is_active !== false && item.is_active !== 'false',
          target_group_ids: Array.isArray(item.target_group_ids) ? item.target_group_ids : []
        },
        { upsert: true, new: true }
      );
      synced++;
    }

    const io = global.io;
    if (io) io.emit('pengumuman:updated', { count: synced });

    console.log(`[Sync] Pengumuman: ${synced} synced, ${skipped} skipped`);
    res.json({ success: true, message: `${synced} pengumuman berhasil disinkronkan`, count: synced, skipped });
  } catch (err) {
    console.error('[Sync] Pengumuman error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/sync/tugas — skip headers, fallback matkul
exports.syncTugas = async (req, res) => {
  try {
    const payload = req.body;
    const dataArray = Array.isArray(payload) ? payload : (payload.data || []);

    if (!dataArray.length) {
      return res.status(400).json({ success: false, message: 'Payload kosong' });
    }

    // Cache fallback matkul
    let fallbackMatkul = null;

    let synced = 0;
    let skipped = 0;
    let fallbackUsed = 0;
    for (const item of dataArray) {
      // Skip header/empty
      if (isHeaderOrEmpty(item, ['judul'])) { skipped++; continue; }

      const judul = String(item.judul || '').trim();
      if (!judul || judul.length < 2) { skipped++; continue; }

      // Cari matkul by nama
      let matkulId = null;
      const namaMatkul = String(item.matkul || item.nama_matkul || '').trim();
      if (namaMatkul) {
        const escaped = namaMatkul.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const matkul = await Matkul.findOne({ nama: { $regex: new RegExp(`^${escaped}$`, 'i') } });
        if (matkul) matkulId = matkul._id;
      }

      // Fallback: gunakan matkul pertama jika tidak ditemukan
      if (!matkulId) {
        if (!fallbackMatkul) fallbackMatkul = await Matkul.findOne().sort({ nama: 1 });
        if (fallbackMatkul) {
          matkulId = fallbackMatkul._id;
          fallbackUsed++;
          console.warn(`[Sync] Tugas "${judul}": matkul "${namaMatkul}" tidak ditemukan, fallback ke "${fallbackMatkul.nama}"`);
        } else {
          skipped++;
          continue;
        }
      }

      const deadline = item.deadline ? new Date(item.deadline) : new Date();
      const status = item.status || 'aktif';

      await Tugas.findOneAndUpdate(
        { judul, matkul_id: matkulId },
        {
          matkul_id: matkulId,
          judul,
          deskripsi: String(item.deskripsi || '').trim(),
          deadline,
          status
        },
        { upsert: true, new: true }
      );
      synced++;
    }

    const io = global.io;
    if (io) io.emit('tugas:updated', { count: synced });

    console.log(`[Sync] Tugas: ${synced} synced, ${skipped} skipped, ${fallbackUsed} fallback`);
    res.json({ success: true, message: `${synced} tugas berhasil disinkronkan`, count: synced, skipped, fallbackUsed });
  } catch (err) {
    console.error('[Sync] Tugas error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/sync/rangkuman — skip headers, fallback matkul
exports.syncRangkuman = async (req, res) => {
  try {
    const payload = req.body;
    const dataArray = Array.isArray(payload) ? payload : (payload.data || []);

    if (!dataArray.length) {
      return res.status(400).json({ success: false, message: 'Payload kosong' });
    }

    // Cache fallback matkul
    let fallbackMatkul = null;

    let synced = 0;
    let skipped = 0;
    let fallbackUsed = 0;
    for (const item of dataArray) {
      // Skip header/empty
      if (isHeaderOrEmpty(item, ['judul'])) { skipped++; continue; }

      const judul = String(item.judul || '').trim();
      if (!judul || judul.length < 2) { skipped++; continue; }

      // Cari matkul by nama
      let matkulId = null;
      const namaMatkul = String(item.matkul || item.nama_matkul || '').trim();
      if (namaMatkul) {
        const escaped = namaMatkul.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const matkul = await Matkul.findOne({ nama: { $regex: new RegExp(`^${escaped}$`, 'i') } });
        if (matkul) matkulId = matkul._id;
      }

      // Fallback: gunakan matkul pertama jika tidak ditemukan
      if (!matkulId) {
        if (!fallbackMatkul) fallbackMatkul = await Matkul.findOne().sort({ nama: 1 });
        if (fallbackMatkul) {
          matkulId = fallbackMatkul._id;
          fallbackUsed++;
          console.warn(`[Sync] Rangkuman "${judul}": matkul "${namaMatkul}" tidak ditemukan, fallback ke "${fallbackMatkul.nama}"`);
        } else {
          skipped++;
          continue;
        }
      }

      await Rangkuman.findOneAndUpdate(
        { judul, matkul_id: matkulId },
        {
          matkul_id: matkulId,
          judul,
          isi: String(item.isi || '').trim(),
          tugas_tambahan: String(item.tugas_tambahan || '').trim(),
          gdoc_link: String(item.gdoc_link || '').trim()
        },
        { upsert: true, new: true }
      );
      synced++;
    }

    const io = global.io;
    if (io) io.emit('rangkuman:updated', { count: synced });

    console.log(`[Sync] Rangkuman: ${synced} synced, ${skipped} skipped, ${fallbackUsed} fallback`);
    res.json({ success: true, message: `${synced} rangkuman berhasil disinkronkan`, count: synced, skipped, fallbackUsed });
  } catch (err) {
    console.error('[Sync] Rangkuman error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper: dapatkan waktu WIB dari Date object
const getWIBDate = (date) => {
  return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
};

// Helper: parse timestamp string ke Date object (UTC) — SELALU interpret sebagai WIB (UTC+7)
// Mendukung format:
//   "M/D/YYYY HH:mm:ss"     (contoh: "9/23/2026 22:38:57")
//   "DD/MM/YYYY, HH:mm:ss"  (contoh: "23/09/2026, 22:38:57")
//   "YYYY-MM-DD HH:mm:ss"   (contoh: "2026-09-23 22:38:57")
//   ISO dengan T             (contoh: "2026-09-23T22:38:57")
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

// Helper: Active Absence Window (WIB)
// - Jam sekarang >= 18:00 → Window: Hari Ini 18:00 s.d. Besok 07:00
// - Jam sekarang < 07:00 → Window: Kemarin 18:00 s.d. Hari Ini 07:00
// - Jam sekarang 07:00–17:59 → Window: Kemarin 18:00 s.d. Hari Ini 07:00 (siklus malam sebelumnya)
const getActiveAbsenceWindow = () => {
  const nowWIB = getWIBDate(new Date());
  const hour = nowWIB.getHours();
  const minute = nowWIB.getMinutes();
  const nowMinutes = hour * 60 + minute; // total menit dari 00:00

  const SIX_PM = 18 * 60;  // 1080 menit
  const SEVEN_AM = 7 * 60;  // 420 menit

  let windowStart, windowEnd;

  if (nowMinutes >= SIX_PM) {
    // Sekarang >= 18:00 → Window: Hari Ini 18:00 s.d. Besok 07:00
    windowStart = new Date(nowWIB);
    windowStart.setHours(18, 0, 0, 0);
    windowEnd = new Date(nowWIB);
    windowEnd.setDate(windowEnd.getDate() + 1);
    windowEnd.setHours(7, 0, 0, 0);
  } else if (nowMinutes < SEVEN_AM) {
    // Sekarang < 07:00 → Window: Kemarin 18:00 s.d. Hari Ini 07:00
    windowStart = new Date(nowWIB);
    windowStart.setDate(windowStart.getDate() - 1);
    windowStart.setHours(18, 0, 0, 0);
    windowEnd = new Date(nowWIB);
    windowEnd.setHours(7, 0, 0, 0);
  } else {
    // Sekarang 07:00–17:59 → Window: Kemarin 18:00 s.d. Hari Ini 07:00 (siklus teraktif)
    windowStart = new Date(nowWIB);
    windowStart.setDate(windowStart.getDate() - 1);
    windowStart.setHours(18, 0, 0, 0);
    windowEnd = new Date(nowWIB);
    windowEnd.setHours(7, 0, 0, 0);
  }

  return { windowStart, windowEnd };
};

// Helper: cek apakah timestamp berada di dalam active absence window
const isInsideAbsenceWindow = (timestampStr, windowStart, windowEnd) => {
  const ts = parseTimestamp(timestampStr);
  if (!ts) return false;
  const tsWIB = getWIBDate(ts);
  return tsWIB >= windowStart && tsWIB < windowEnd;
};

// POST /api/sync/titip-absen — filter oleh Active Absence Window, match NIM ke Mahasiswa
exports.syncTitipAbsen = async (req, res) => {
  try {
    const payload = req.body;
    const dataArray = Array.isArray(payload) ? payload : (payload.data || []);

    if (!dataArray.length) {
      return res.status(400).json({ success: false, message: 'Payload kosong' });
    }

    // Dapatkan active absence window
    const { windowStart, windowEnd } = getActiveAbsenceWindow();
    console.log(`[Sync] TitipAbsen Active Window: ${windowStart.toISOString()} — ${windowEnd.toISOString()}`);

    let synced = 0;
    let skipped = 0;
    let filteredTime = 0;

    for (const item of dataArray) {
      try {
        const timestamp = String(item.timestamp || '').trim();
        const nim = String(item.nim || item.NIM || '').trim();
        const password = String(item.password || '').trim();
        const matrikulasi = String(item.matrikulasi || '').trim();

        if (!timestamp || !nim) { skipped++; continue; }

        // === DEBUG: log input, parsed result, dan filter result ===
        const parsedDate = parseTimestamp(timestamp);
        const isInside = parsedDate ? isInsideAbsenceWindow(timestamp, windowStart, windowEnd) : false;
        console.log('DEBUG TITIP ABSEN INPUT:', item.timestamp, '-> PARSED:', parsedDate ? parsedDate.toISOString() : 'NULL', '-> IS_INSIDE:', isInside);

        // === FILTER WAKTU: hanya simpan jika timestamp DI DALAM active window ===
        if (!isInside) {
          filteredTime++;
          const tsParsed = parseTimestamp(timestamp);
          const tsDisplay = tsParsed ? getWIBDate(tsParsed).toLocaleString('id-ID') : timestamp;
          console.log(`[Sync] TitipAbsen "${nim}" difilter — timestamp ${tsDisplay} di luar window`);
          continue;
        }

        // Match NIM ke collection Mahasiswa untuk ambil nama
        let nama = '';
        try {
          const mhs = await Mahasiswa.findOne({ nim });
          if (mhs) nama = mhs.nama;
        } catch (_) {}

        // Upsert berdasarkan kombinasi nim + timestamp (replace jika duplikat)
        await TitipAbsen.findOneAndUpdate(
          { nim, timestamp },
          { nim, nama, timestamp, password, matrikulasi },
          { upsert: true, new: true }
        );
        synced++;
      } catch (itemErr) {
        console.error('[Sync] TitipAbsen item error:', itemErr.message);
        skipped++;
      }
    }

    // Bersihkan data lama di luar window (cleanup otomatis)
    const windowStartStr = windowStart.toISOString();
    const windowEndStr = windowEnd.toISOString();
    try {
      // Convert semua timestamp di DB ke Date, lalu hapus yang di luar window
      const allData = await TitipAbsen.find();
      let cleaned = 0;
      for (const doc of allData) {
        const tsDate = parseTimestamp(doc.timestamp);
        if (tsDate) {
          const tsWIB = getWIBDate(tsDate);
          if (tsWIB < windowStart || tsWIB >= windowEnd) {
            await TitipAbsen.findByIdAndDelete(doc._id);
            cleaned++;
          }
        }
      }
      if (cleaned > 0) console.log(`[Sync] TitipAbsen: ${cleaned} data lama di luar window dihapus`);
    } catch (cleanErr) {
      console.warn('[Sync] TitipAbsen cleanup error:', cleanErr.message);
    }

    const io = global.io;
    if (io) io.emit('titip_absen:updated', { count: synced });

    console.log(`[Sync] TitipAbsen: ${synced} synced, ${skipped} skipped, ${filteredTime} filtered (di luar window)`);
    res.json({
      success: true,
      message: `${synced} titip absen berhasil disinkronkan`,
      count: synced,
      skipped,
      filteredTime,
      window: {
        start: windowStart.toISOString(),
        end: windowEnd.toISOString()
      }
    });
  } catch (err) {
    console.error('[Sync] TitipAbsen error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

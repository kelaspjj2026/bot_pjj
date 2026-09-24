const { CronJob } = require('cron');
const { Jadwal, Matkul, Tugas, Settings, Pengumuman, PengumumanLog } = require('../models');
const { sendMessageToGroups, getWAStatus } = require('./waService');

const HARI_MAP = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

// Timezone helper: dapatkan waktu Jakarta (WIB = UTC+7)
const getJakartaNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

// Normalisasi format jam AM/PM ke 24-jam standar "HH:mm"
const normalizeTo24Hour = (timeStr) => {
  if (!timeStr) return timeStr;
  const str = String(timeStr).trim();

  // Jika sudah format 24-jam (HH:mm tanpa AM/PM), kembalikan langsung
  if (/^\d{1,2}:\d{2}$/.test(str)) {
    const [h, m] = str.split(':').map(Number);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // Format AM/PM: "09:00 PM", "9:00 PM", "09:00PM", "9:00AM"
  const ampmMatch = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  }

  // Fallback: coba parse langsung
  const [h, m] = str.split(':').map(Number);
  if (!isNaN(h) && !isNaN(m)) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  return str;
};

const getSetting = async (key, defaultValue) => {
  const setting = await Settings.findOne({ key });
  return setting?.value ?? defaultValue;
};

const startScheduler = () => {
  // Track reminder sudah terkirim hari ini agar tidak duplikat
  const sentReminders = new Map(); // key: "hari-jamMulai" -> true

  // Reset tracking setiap tengah malam
  const resetJob = new CronJob('0 0 * * *', () => {
    sentReminders.clear();
    console.log('[Scheduler] Reminder tracking reset');
  });
  resetJob.start();

  // Reminder kuliah - setiap menit cek jadwal
  const jobReminderKuliah = new CronJob('*/1 * * * *', async () => {
    try {
      const now = getJakartaNow();
      const today = HARI_MAP[now.getDay()];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const offsetMinutes = await getSetting('reminder_offset_minutes', 10);
      const jadwals = await Jadwal.find({ hari: today }).populate('matkul_id');

      // Get fallback target groups from settings
      let fallbackGroups = [];
      try {
        const targetSetting = await Settings.findOne({ key: 'target_groups' });
        if (targetSetting?.value?.length) fallbackGroups = targetSetting.value;
      } catch (_) {}

      for (const j of jadwals) {
        if (!j.jam_mulai || !j.matkul_id) continue;

        const [jMulaiH, jMulaiM] = j.jam_mulai.split(':').map(Number);
        const jadwalMinutes = jMulaiH * 60 + jMulaiM;
        const minutesUntil = jadwalMinutes - currentMinutes;

        // Cek apakah sudah waktunya (0 <= selisih <= offset) dan belum terkirim
        const reminderKey = `${today}-${j.jam_mulai}`;
        if (minutesUntil >= 0 && minutesUntil <= offsetMinutes && !sentReminders.has(reminderKey)) {
          sentReminders.set(reminderKey, true);

          const gmeet = j.gmeet_link || j.matkul_id.gmeet_link || 'Tidak ada link';
          const waGroup = j.wa_group_link || 'Tidak ada link WAG';
          const msg = `🔔 *Pengingat Kuliah (${minutesUntil} menit lagi)*\n\n` +
            `📚 ${j.matkul_id.nama}\n` +
            `🕐 Jam: ${j.jam_mulai} - ${j.jam_selesai}\n` +
            `👩‍🏫 Dosen: ${j.matkul_id.dosen || '-'}\n` +
            `📹 Google Meet: ${gmeet}\n` +
            `💬 WA Group: ${waGroup}`;

          const targetGroups = j.wa_group_link ? [j.wa_group_link] : fallbackGroups;
          if (targetGroups.length > 0) {
            console.log(`[Scheduler] Mengirim reminder kuliah "${j.matkul_id.nama}" (${minutesUntil}m lagi) ke ${targetGroups.length} grup`);
            await sendMessageToGroups(targetGroups, msg, { logType: 'schedule_kuliah' });
          } else {
            console.warn(`[Scheduler] Reminder "${j.matkul_id.nama}" skip: tidak ada grup target`);
          }
        }
      }
    } catch (err) {
      console.error('[Scheduler] Error reminder kuliah:', err.message);
    }
  });
  jobReminderKuliah.start();

  // Pengumuman otomatis Titip Absen - setiap menit cek schedule
  const jobTitipAbsen = new CronJob('*/1 * * * *', async () => {
    try {
      const now = getJakartaNow();
      const today = HARI_MAP[now.getDay()];
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const pengumumans = await Pengumuman.find({
        is_active: true,
        is_recurring: true,
        repeat_days: today,
      });

      for (const p of pengumumans) {
        const normalizedScheduleTime = normalizeTo24Hour(p.schedule_time);
        if (normalizedScheduleTime === currentHHMM) {
          await sendMessageToGroups(p.target_group_ids, `📢 *${p.judul}*\n\n${p.isi}`, { 
            logType: 'pengumuman_recurring', 
            pengumumanId: p._id 
          });
        }
      }
    } catch (err) {
      console.error('[Scheduler] Error pengumuman:', err.message);
    }
  });
  jobTitipAbsen.start();

  // Reminder tugas H-3 - cek sesuai jam setting
  const jobReminderTugasH3 = new CronJob('0 * * * *', async () => {
    await runTaskReminder('h3', 3, '📌 3 HARI LAGI (H-3)');
  });
  jobReminderTugasH3.start();

  // Reminder tugas H-1 - cek sesuai jam setting
  const jobReminderTugasH1 = new CronJob('0 * * * *', async () => {
    await runTaskReminder('h1', 1, '⏰ BESOK (H-1)');
  });
  jobReminderTugasH1.start();

  // Reminder tugas H-0 - cek sesuai jam setting
  const jobReminderTugasH0 = new CronJob('0 * * * *', async () => {
    await runTaskReminder('h0', 0, '⏰ HARI INI (H-0)');
  });
  jobReminderTugasH0.start();

  console.log('[Scheduler] Semua cron job aktif');
};

const runTaskReminder = async (type, daysOffset, label) => {
  try {
    if (!getWAStatus().connected) return;

    const now = getJakartaNow();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const settingKey = `reminder_h${type}_time`;
    const reminderTime = normalizeTo24Hour(await getSetting(settingKey, '08:00'));

    if (currentHHMM !== reminderTime) return;

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysOffset);

    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const tugasList = await Tugas.find({
      status: 'aktif',
      deadline: { $gte: startOfDay, $lte: endOfDay },
    }).populate('matkul_id', 'nama');

    for (const t of tugasList) {
      const deadlineStr = new Date(t.deadline).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
      const msg = `${label} *Deadline Tugas*\n\n` +
        `📚 Mata Kuliah: ${t.matkul_id?.nama || '-'}\n` +
        `📌 Judul: ${t.judul}\n` +
        `📋 Deskripsi: ${t.deskripsi || '-'}\n` +
        `⏰ Deadline: ${deadlineStr}`;

      const { Jadwal: JadwalModel } = require('../models');
      const jadwals = await JadwalModel.find({ matkul_id: t.matkul_id._id });
      const groupIds = [...new Set(jadwals.map(j => j.wa_group_link).filter(Boolean))];

      if (groupIds.length > 0) {
        await sendMessageToGroups(groupIds, msg, { logType: 'schedule_tugas', pengumumanId: t._id });
      }
    }
  } catch (err) {
    console.error(`[Scheduler] Error reminder tugas ${type}:`, err.message);
  }
};

module.exports = { startScheduler };
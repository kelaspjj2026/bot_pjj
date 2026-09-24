const { Matkul, Jadwal, Tugas, Pengumuman, Settings, Rangkuman } = require('../models');

const HARI_MAP = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
const HARI_LABEL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Timezone helper: dapatkan waktu Jakarta (WIB = UTC+7)
const getJakartaNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

const isAllowedGroup = async (groupId) => {
  const setting = await Settings.findOne({ key: 'allowed_groups' });
  if (!setting || !setting.value || !setting.value.length) return true;
  return setting.value.includes(groupId);
};

const isAdminGroup = async (groupId) => {
  const setting = await Settings.findOne({ key: 'admin_group' });
  if (!setting || !setting.value) return false;
  return setting.value === groupId;
};

const handleMessage = async (sock, msg) => {
  try {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return;

    if (!(await isAllowedGroup(chatId))) return;

    const rawText = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
    if (!rawText) return;

    const text = rawText.replace(/^\//, '').toLowerCase();

    if (text === 'halo' || text === 'help' || text === 'bantuan' || text === 'hai' || text === 'info' || text === 'menu') {
      const menu = `📋 Menu Bantuan Bot PJJ Informatika

Perintah yang tersedia:
* jadwal — Lihat jadwal hari ini
* jadwal [hari] — Lihat jadwal hari tertentu
* tugas — Lihat tugas aktif
* pengumuman — Lihat pengumuman terbaru
* rangkuman — Lihat rangkuman materi & Google Docs
* matkul — Daftar mata kuliah
* status — Cek status koneksi bot
* help / bantuan / halo / hai / info / menu — Tampilan menu ini

Contoh:
jadwal Senin
rangkuman Bahasa Indonesia
info tugas

_Awalan / (slash) juga didukung: /jadwal, /tugas, /rangkuman, /help_`;
      await sock.sendMessage(chatId, { text: menu });
      return;
    }

    if (text === 'jadwal' || text === 'info jadwal') {
      const nowJkt = getJakartaNow();
      const today = HARI_MAP[nowJkt.getDay()];
      const jadwals = await Jadwal.find({ hari: today }).populate('matkul_id', 'nama dosen gmeet_link');
      if (!jadwals.length) {
        await sock.sendMessage(chatId, { text: '📅 Tidak ada jadwal kuliah hari ini.' });
        return;
      }
      let msg = `📅 *Jadwal Kuliah Hari Ini (${HARI_LABEL[nowJkt.getDay()]})*\n\n`;
      jadwals.forEach((j, i) => {
        msg += `${i + 1}. *${j.matkul_id?.nama || '-'}*\n`;
        msg += `   🕐 ${j.jam_mulai} - ${j.jam_selesai}\n`;
        msg += `   👩‍🏫 ${j.matkul_id?.dosen || '-'}\n`;
        msg += `   📹 ${j.gmeet_link || j.matkul_id?.gmeet_link || '-'}\n\n`;
      });
      await sock.sendMessage(chatId, { text: msg });
      return;
    }

    if (text.startsWith('jadwal ')) {
      const dayInput = text.replace('jadwal ', '').trim();
      if (!HARI_MAP.includes(dayInput)) {
        await sock.sendMessage(chatId, { text: '❌ Gunakan: jadwal senin/minggu/dst' });
        return;
      }
      const jadwals = await Jadwal.find({ hari: dayInput }).populate('matkul_id', 'nama dosen gmeet_link');
      if (!jadwals.length) {
        await sock.sendMessage(chatId, { text: `📅 Tidak ada jadwal kuliah hari ${dayInput}.` });
        return;
      }
      const dayIdx = HARI_MAP.indexOf(dayInput);
      let msg = `📅 *Jadwal Kuliah ${HARI_LABEL[dayIdx]}*\n\n`;
      jadwals.forEach((j, i) => {
        msg += `${i + 1}. *${j.matkul_id?.nama || '-'}*\n`;
        msg += `   🕐 ${j.jam_mulai} - ${j.jam_selesai}\n`;
        msg += `   👩‍🏫 ${j.matkul_id?.dosen || '-'}\n`;
        msg += `   📹 ${j.gmeet_link || j.matkul_id?.gmeet_link || '-'}\n\n`;
      });
      await sock.sendMessage(chatId, { text: msg });
      return;
    }

    if (text === 'tugas' || text === 'info tugas') {
      const tugasList = await Tugas.find({ status: 'aktif' }).populate('matkul_id', 'nama').sort({ deadline: 1 });
      if (!tugasList.length) {
        await sock.sendMessage(chatId, { text: '📝 Tidak ada tugas aktif saat ini.' });
        return;
      }
      let msg = `📝 *Daftar Tugas Aktif*\n\n`;
      tugasList.forEach((t, i) => {
        const deadline = new Date(t.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
        msg += `${i + 1}. *${t.judul}*\n`;
        msg += `   📚 Matkul: ${t.matkul_id?.nama || '-'}\n`;
        msg += `   📋 Deskripsi: ${t.deskripsi || '-'}\n`;
        msg += `   ⏰ Deadline: ${deadline}\n\n`;
      });
      await sock.sendMessage(chatId, { text: msg });
      return;
    }

    if (text === 'pengumuman') {
      const pList = await Pengumuman.find({ is_active: true }).sort({ createdAt: -1 }).limit(5);
      if (!pList.length) {
        await sock.sendMessage(chatId, { text: '📢 Tidak ada pengumuman saat ini.' });
        return;
      }
      let msg = `📢 *Pengumuman Terbaru*\n\n`;
      pList.forEach((p, i) => {
        msg += `${i + 1}. *${p.judul}*\n   ${p.isi}\n\n`;
      });
      await sock.sendMessage(chatId, { text: msg });
      return;
    }

    if (text === 'matkul') {
      const matkuls = await Matkul.find().sort({ nama: 1 });
      if (!matkuls.length) {
        await sock.sendMessage(chatId, { text: '📚 Belum ada mata kuliah terdaftar.' });
        return;
      }
      let msg = `📚 *Daftar Mata Kuliah*\n\n`;
      matkuls.forEach((m, i) => {
        msg += `${i + 1}. *${m.nama}* (${m.kode})\n   👩‍🏫 ${m.dosen || '-'} | ${m.sks || 0} SKS\n\n`;
      });
      await sock.sendMessage(chatId, { text: msg });
      return;
    }

    if (text === 'status') {
      const { getWAStatus } = require('../services/waService');
      const status = getWAStatus();
      const emoji = status.connected ? '🟢' : '🔴';
      await sock.sendMessage(chatId, {
        text: `${emoji} *Status Bot*\n\nKoneksi: ${status.status}\nBot: ${status.connected ? 'Online' : 'Offline'}`,
      });
      return;
    }

    // /rangkuman command — filter pertemuan/index & tanggal (sort ASCENDING)
    if (text === 'rangkuman' || text.startsWith('rangkuman ')) {
      const rawQuery = text.replace(/^rangkuman\s*/, '').trim();

      // Parse: extract trailing number as pertemuan index
      let matkulQuery = rawQuery;
      let pertemuanIndex = null;
      const numMatch = rawQuery.match(/^(.+?)\s+(\d+)$/);
      if (numMatch) {
        matkulQuery = numMatch[1].trim();
        pertemuanIndex = parseInt(numMatch[2], 10);
      }

      // Handle pure number query without matkul name
      if (/^\d+$/.test(rawQuery)) {
        pertemuanIndex = parseInt(rawQuery, 10);
        matkulQuery = '';
      }

      // Find matkul
      let filter = {};
      let matchedMatkul = null;
      if (matkulQuery) {
        const escaped = matkulQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        matchedMatkul = await Matkul.findOne({ nama: { $regex: new RegExp(escaped, 'i') } });
        if (matchedMatkul) filter.matkul_id = matchedMatkul._id;
      }

      const listRangkuman = await Rangkuman.find(filter).populate('matkul_id', 'nama').sort({ createdAt: 1 }).limit(50);
      if (!listRangkuman.length) {
        await sock.sendMessage(chatId, { text: '📋 Tidak ada rangkuman ditemukan.' });
        return;
      }

      const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      // Helper: format detail rangkuman standar
      const formatDetail = (item) => {
        const isiPreview = (item.isi || '-').length > 150
          ? (item.isi || '-').substring(0, 150) + '... (baca selengkapnya di Google Doc)'
          : (item.isi || '-');
        let reply = `📄 *Detail Rangkuman Materi*\n\n`;
        reply += `📚 Mata Kuliah: ${item.matkul_id?.nama || '-'}\n`;
        reply += `📌 Judul: ${item.judul}\n`;
        reply += `📅 Tanggal: ${formatDate(item.createdAt)}\n`;
        reply += `\n📝 Isi Rangkuman:\n${isiPreview}\n`;
        reply += `\n📝 Tugas Tambahan: ${item.tugas_tambahan || '-'}`;
        reply += `\n📄 Google Doc: ${item.gdoc_link || 'Tidak tersedia'}`;
        return reply;
      };

      // Step 1: Cek judul yang mengandung query (misal: "10" cocok "Pertemuan Ke-10")
      if (pertemuanIndex !== null || matkulQuery) {
        const searchQuery = pertemuanIndex !== null ? String(pertemuanIndex) : matkulQuery;
        const titleMatch = listRangkuman.find(r => r.judul.toLowerCase().includes(searchQuery.toLowerCase()));
        if (titleMatch) {
          await sock.sendMessage(chatId, { text: formatDetail(titleMatch) });
          return;
        }
      }

      // Step 2: Fallback index array (1-based)
      if (pertemuanIndex !== null) {
        const target = listRangkuman[pertemuanIndex - 1];
        if (target) {
          await sock.sendMessage(chatId, { text: formatDetail(target) });
          return;
        }
        // Tidak ditemukan — pesan error jelas
        const matkulLabel = matchedMatkul ? matchedMatkul.nama : 'semua mata kuliah';
        await sock.sendMessage(chatId, {
          text: `❌ Rangkuman "${pertemuanIndex}" tidak ditemukan untuk mata kuliah ${matkulLabel}. Mata kuliah ini baru memiliki ${listRangkuman.length} rangkuman.`
        });
        return;
      }

      // Step 3: Jika satu matkul ditemukan DAN hanya 1 rangkuman — tampilkan detail langsung
      if (matchedMatkul && listRangkuman.length === 1) {
        await sock.sendMessage(chatId, { text: formatDetail(listRangkuman[0]) });
        return;
      }

      // Step 4: Jika satu matkul ditemukan DAN ada beberapa rangkuman — tampilkan daftar
      if (matchedMatkul && listRangkuman.length > 1) {
        let list = `📋 *Daftar Rangkuman Mata Kuliah: ${matchedMatkul.nama}*\n\n`;
        listRangkuman.forEach((r, i) => {
          list += `${i + 1}. *${r.judul}* (📅 ${formatDate(r.createdAt)})\n`;
        });
        list += `\n_Ketik "rangkuman ${matkulQuery} [nomor]" untuk melihat detail._\nContoh: rangkuman ${matkulQuery} 1`;
        await sock.sendMessage(chatId, { text: list });
        return;
      }

      // Default: tampilkan semua rangkuman
      let msg = `📋 *Daftar Rangkuman Materi*\n\n`;
      listRangkuman.forEach((r, i) => {
        msg += `${i + 1}. *${r.judul}* (📅 ${formatDate(r.createdAt)})\n`;
        msg += `   📚 ${r.matkul_id?.nama || '-'}\n`;
        msg += `   📄 Google Doc: ${r.gdoc_link || 'Tidak tersedia'}\n`;
        msg += `\n`;
      });
      msg += `_Ketik "rangkuman [nama matkul]" untuk filter, atau "rangkuman [nama] [nomor]" untuk detail spesifik_`;
      await sock.sendMessage(chatId, { text: msg });
      return;
    }

    // /ringkasan command — smart pipe parser (handles | in markdown tables)
    const ringkasanPrefix = rawText.match(/^\/?ringkasan\s+/i);
    if (ringkasanPrefix) {
      try {
        const afterPrefix = rawText.substring(ringkasanPrefix[0].length);

        // Split by | — but handle pipes inside isi rangkuman (markdown tables)
        const allParts = afterPrefix.split('|');
        if (allParts.length < 3) {
          await sock.sendMessage(chatId, { text: '❌ Format: /ringkasan [Matkul] | [Judul] | [Isi Rangkuman] | [Tugas Tambahan]\n\nGunakan minimal 3 pemisah | (Matkul | Judul | Isi)' });
          return;
        }

        // Blok 1: Matkul (sebelum | pertama)
        const inputMatkul = allParts[0].trim();
        // Blok 2: Judul (antara | pertama dan | kedua)
        const judul = allParts[1].trim();
        // Blok 3 & 4: Isi + Tugas Tambahan
        // Gunakan jumlah allParts untuk menentukan apakah ada tugas_tambahan
        const hasTugas = allParts.length > 3;
        let isi = '';
        let tugasTambahan = '';

        if (hasTugas) {
          // 4+ blok: ambil isi dari index 2 sampai sebelum terakhir, tugas dari index terakhir
          isi = allParts.slice(2, -1).join('|').trim();
          tugasTambahan = allParts[allParts.length - 1].trim();
        } else {
          // 3 blok: isi = semua dari index 2, tidak ada tugas tambahan
          isi = allParts.slice(2).join('|').trim();
        }

        // Fuzzy matkul search: case-insensitive regex with escape
        const escaped = inputMatkul.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let matkul = await Matkul.findOne({ nama: { $regex: new RegExp(escaped, 'i') } });

        // Fallback: use first matkul if not found
        if (!matkul) {
          matkul = await Matkul.findOne().sort({ nama: 1 });
          if (!matkul) {
            await sock.sendMessage(chatId, { text: '❌ Tidak ada mata kuliah di database. Tambahkan dulu via Dashboard.' });
            return;
          }
          await sock.sendMessage(chatId, { text: `⚠️ Matkul "${inputMatkul}" tidak ditemukan. Menggunakan fallback: *${matkul.nama}*` });
        }

        // Step 1: Simpan ke MongoDB dulu
        const newRangkuman = await Rangkuman.create({
          matkul_id: matkul._id,
          judul,
          isi,
          tugas_tambahan: tugasTambahan
        });

        // Step 2: WAJIB TUNGGU GAS webhook sampai selesai (await sempurna)
        let gdocLink = '';
        try {
          const { callGASWebhook } = require('../services/gasService');
          const gasResult = await callGASWebhook({
            matkul: matkul.nama,
            judul,
            isi,
            tugas_tambahan: tugasTambahan
          });
          if (gasResult?.gdoc_link) {
            gdocLink = gasResult.gdoc_link;
            newRangkuman.gdoc_link = gdocLink;
            await newRangkuman.save();
          }
        } catch (gasErr) {
          console.error('[GAS] Error:', gasErr.message);
        }

        // Step 3: Emit socket event untuk real-time dashboard update
        const io = global.io;
        if (io) io.emit('rangkuman:created', newRangkuman);

        // Step 4: Kirim balasan HANYA SETELAH proses selesai
        const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        await sock.sendMessage(chatId, {
          text: `✅ Ringkasan Berhasil Disimpan!\n\n📚 Matkul: ${matkul.nama}\n📌 Judul: ${judul}\n📅 Tanggal: ${tanggal}\n📄 Google Doc: ${gdocLink || 'Tidak tersedia'}`
        });
      } catch (err) {
        console.error('[MessageHandler] /ringkasan error:', err.message);
        await sock.sendMessage(chatId, { text: `❌ Gagal menyimpan ringkasan: ${err.message}` });
      }
      return;
    }

    // /tugas command — works from ANY group, no admin restriction
    const tugasMatch = rawText.match(/^\/?tugas\s+([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*(.+)/i);
    if (tugasMatch) {
      try {
        const inputMatkul = tugasMatch[1].trim();
        const judul = tugasMatch[2].trim();
        const deskripsi = tugasMatch[3].trim();
        const deadlineStr = tugasMatch[4].trim();

        // Fuzzy matkul search: case-insensitive regex with escape
        const escaped = inputMatkul.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let matkul = await Matkul.findOne({ nama: { $regex: new RegExp(escaped, 'i') } });

        // Fallback: use first matkul if not found
        if (!matkul) {
          matkul = await Matkul.findOne().sort({ nama: 1 });
          if (!matkul) {
            await sock.sendMessage(chatId, { text: '❌ Tidak ada mata kuliah di database. Tambahkan dulu via Dashboard.' });
            return;
          }
          await sock.sendMessage(chatId, { text: `⚠️ Matkul "${inputMatkul}" tidak ditemukan. Menggunakan fallback: *${matkul.nama}*` });
        }

        const deadline = new Date(deadlineStr);
        if (isNaN(deadline.getTime())) {
          await sock.sendMessage(chatId, { text: '❌ Format deadline salah. Gunakan: YYYY-MM-DD HH:mm' });
          return;
        }

        const newTugas = await Tugas.create({
          matkul_id: matkul._id,
          judul,
          deskripsi,
          deadline,
          status: 'aktif'
        });

        const io = global.io;
        if (io) io.emit('tugas:created', newTugas);

        await sock.sendMessage(chatId, {
          text: `✅ Tugas Berhasil Disimpan!\n\n📚 Matkul: ${matkul.nama}\n📌 Judul: ${judul}\n📋 Deskripsi: ${deskripsi}\n⏰ Deadline: ${deadline.toLocaleString('id-ID')}`
        });
      } catch (err) {
        console.error('[MessageHandler] /tugas error:', err.message);
        await sock.sendMessage(chatId, { text: `❌ Gagal menyimpan tugas: ${err.message}` });
      }
      return;
    }
  } catch (err) {
    console.error('[MessageHandler] Error:', err.message);
  }
};

module.exports = { handleMessage };

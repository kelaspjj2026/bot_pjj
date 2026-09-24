const axios = require('axios');
const { GAS_LIBRARY_ID } = require('../config/constants');

// Default URLs per sheet type
const GAS_URL_MAHASISWA = 'https://script.google.com/macros/s/AKfycbyQJQFSnyiPkU86lBS78haZBHJKmfoREHKsO-Jzh29FPb51oikTeYKc7ZBC8jABTl9z/exec';
const GAS_URL_ARSIB = 'https://script.google.com/macros/s/AKfycby6lETcEzBQrSraaCu6TB69gUQJv1ROrC6sz_fHgxCLl5qq3h7sQelP-3o3Y9Sf9YE6Vw/exec';

// Dapatkan URL GAS Web App berdasarkan sheet_type
// Prioritas: env → database settings → default per sheet_type
const getGasSyncUrl = async (sheetType) => {
  // Cek env variables spesifik
  if (sheetType === 'mahasiswa' && process.env.GAS_SYNC_URL_MAHASISWA) {
    return process.env.GAS_SYNC_URL_MAHASISWA;
  }
  if (['pengumuman', 'tugas', 'rangkuman'].includes(sheetType) && process.env.GAS_SYNC_URL_ARSIB) {
    return process.env.GAS_SYNC_URL_ARSIB;
  }

  // Cek database settings
  try {
    const { Settings } = require('../models');
    if (sheetType === 'mahasiswa') {
      const setting = await Settings.findOne({ key: 'gas_sync_url_mahasiswa' });
      if (setting && setting.value) return setting.value;
    } else {
      const setting = await Settings.findOne({ key: 'gas_sync_url_arsib' });
      if (setting && setting.value) return setting.value;
    }
  } catch (_) {}

  // Fallback ke default
  return sheetType === 'mahasiswa' ? GAS_URL_MAHASISWA : GAS_URL_ARSIB;
};

// Kirim POST ke GAS Web App untuk sync data (non-blocking)
const syncToGoogleSheets = async (payload) => {
  try {
    const gasUrl = await getGasSyncUrl(payload.sheet_type);
    
    // Ambil library_id dari database settings (fallback ke constants)
    let libraryId = GAS_LIBRARY_ID;
    try {
      const { Settings } = require('../models');
      const libSetting = await Settings.findOne({ key: 'gas_library_id' });
      if (libSetting && libSetting.value) libraryId = libSetting.value;
    } catch (_) {}

    // Sertakan library_id dalam payload agar GAS handler bisa menggunakannya
    const enrichedPayload = { ...payload, library_id: libraryId };

    await axios.post(gasUrl, enrichedPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
      maxRedirects: 5
    });
    console.log(`[GasSync] ${payload.sheet_type} ${payload.action} OK (library: ${libraryId.substring(0, 12)}...) → ${gasUrl.substring(0, 60)}...`);
  } catch (err) {
    console.error(`[GasSync] ${payload.sheet_type} ${payload.action} error:`, err.message);
  }
};

// Mahasiswa UPDATE
const syncMahasiswaUpdate = (data) => {
  syncToGoogleSheets({
    action: 'UPDATE',
    sheet_type: 'mahasiswa',
    identifier: data.nim,
    data: { nomor: data.nomor, nama: data.nama, nim: data.nim, wa: data.wa }
  });
};

// Mahasiswa DELETE
const syncMahasiswaDelete = (data) => {
  syncToGoogleSheets({
    action: 'DELETE',
    sheet_type: 'mahasiswa',
    identifier: data.nim
  });
};

// Pengumuman INSERT
const syncPengumumanInsert = (data) => {
  syncToGoogleSheets({
    action: 'INSERT',
    sheet_type: 'pengumuman',
    data: {
      judul: data.judul,
      isi: data.isi,
      jam_kirim: data.schedule_time || '',
      hari_ulang: Array.isArray(data.repeat_days) ? data.repeat_days.join(', ') : (data.repeat_days || ''),
      status: data.is_active ? 'Aktif' : 'Nonaktif'
    }
  });
};

// Pengumuman UPDATE
const syncPengumumanUpdate = (data) => {
  syncToGoogleSheets({
    action: 'UPDATE',
    sheet_type: 'pengumuman',
    identifier: data.judul,
    data: {
      judul: data.judul,
      isi: data.isi,
      is_recurring: data.is_recurring,
      schedule_time: data.schedule_time,
      repeat_days: data.repeat_days,
      is_active: data.is_active
    }
  });
};

// Pengumuman DELETE
const syncPengumumanDelete = (data) => {
  syncToGoogleSheets({
    action: 'DELETE',
    sheet_type: 'pengumuman',
    identifier: data.judul
  });
};

// Tugas INSERT
const syncTugasInsert = async (data) => {
  let namaMatkul = '';
  if (data.matkul_id) {
    try {
      const { Matkul } = require('../models');
      const m = await Matkul.findById(data.matkul_id);
      namaMatkul = m?.nama || '';
    } catch (_) {}
  }
  syncToGoogleSheets({
    action: 'INSERT',
    sheet_type: 'tugas',
    data: {
      matkul: namaMatkul,
      judul: data.judul,
      deskripsi: data.deskripsi || '',
      deadline: data.deadline,
      status: data.status || 'aktif'
    }
  });
};

// Tugas UPDATE
const syncTugasUpdate = async (data) => {
  let namaMatkul = '';
  if (data.matkul_id) {
    try {
      const { Matkul } = require('../models');
      const m = await Matkul.findById(data.matkul_id);
      namaMatkul = m?.nama || '';
    } catch (_) {}
  }
  syncToGoogleSheets({
    action: 'UPDATE',
    sheet_type: 'tugas',
    identifier: data.judul,
    data: { matkul: namaMatkul, judul: data.judul, deskripsi: data.deskripsi, deadline: data.deadline, status: data.status }
  });
};

// Tugas DELETE
const syncTugasDelete = async (data) => {
  let namaMatkul = '';
  if (data.matkul_id) {
    try {
      const { Matkul } = require('../models');
      const m = await Matkul.findById(data.matkul_id);
      namaMatkul = m?.nama || '';
    } catch (_) {}
  }
  syncToGoogleSheets({
    action: 'DELETE',
    sheet_type: 'tugas',
    identifier: data.judul,
    data: { matkul: namaMatkul }
  });
};

// Rangkuman INSERT
const syncRangkumanInsert = async (data) => {
  let namaMatkul = '';
  if (data.matkul_id) {
    try {
      const { Matkul } = require('../models');
      const m = await Matkul.findById(data.matkul_id);
      namaMatkul = m?.nama || '';
    } catch (_) {}
  }
  syncToGoogleSheets({
    action: 'INSERT',
    sheet_type: 'rangkuman',
    data: {
      matkul: namaMatkul,
      judul: data.judul,
      isi: data.isi || '',
      tugas_tambahan: data.tugas_tambahan || '',
      gdoc_link: data.gdoc_link || ''
    }
  });
};

// Rangkuman UPDATE
const syncRangkumanUpdate = async (data) => {
  let namaMatkul = '';
  if (data.matkul_id) {
    try {
      const { Matkul } = require('../models');
      const m = await Matkul.findById(data.matkul_id);
      namaMatkul = m?.nama || '';
    } catch (_) {}
  }
  syncToGoogleSheets({
    action: 'UPDATE',
    sheet_type: 'rangkuman',
    identifier: data.judul,
    data: { matkul: namaMatkul, judul: data.judul, isi: data.isi, tugas_tambahan: data.tugas_tambahan, gdoc_link: data.gdoc_link }
  });
};

// Rangkuman DELETE
const syncRangkumanDelete = async (data) => {
  let namaMatkul = '';
  if (data.matkul_id) {
    try {
      const { Matkul } = require('../models');
      const m = await Matkul.findById(data.matkul_id);
      namaMatkul = m?.nama || '';
    } catch (_) {}
  }
  syncToGoogleSheets({
    action: 'DELETE',
    sheet_type: 'rangkuman',
    identifier: data.judul,
    data: { matkul: namaMatkul }
  });
};

module.exports = {
  syncMahasiswaUpdate,
  syncMahasiswaDelete,
  syncPengumumanInsert,
  syncPengumumanUpdate,
  syncPengumumanDelete,
  syncTugasInsert,
  syncTugasUpdate,
  syncTugasDelete,
  syncRangkumanInsert,
  syncRangkumanUpdate,
  syncRangkumanDelete
};

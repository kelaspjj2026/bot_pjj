const { Rangkuman, Matkul, Jadwal } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const data = await Rangkuman.find().populate('matkul_id', 'nama kode').sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await Rangkuman.findById(req.params.id).populate('matkul_id', 'nama kode');
    if (!data) return res.status(404).json({ success: false, message: 'Rangkuman tidak ditemukan' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await Rangkuman.create(req.body);

    // Sync ke Google Sheets (non-blocking)
    const { syncRangkumanInsert } = require('../services/gasSyncService');
    syncRangkumanInsert(data);

    // WAJIB TUNGGU GAS webhook sampai selesai sebelum respond
    try {
      const matkulData = await Matkul.findById(data.matkul_id);
      const { callGASWebhook } = require('../services/gasService');
      const gasResult = await callGASWebhook({
        matkul: matkulData?.nama || '',
        judul: data.judul,
        isi: data.isi || '',
        tugas_tambahan: data.tugas_tambahan || ''
      });
      if (gasResult?.gdoc_link) {
        data.gdoc_link = gasResult.gdoc_link;
        await data.save();
      }
    } catch (gasErr) {
      console.error('[Rangkuman] GAS webhook error:', gasErr.message);
    }

    // Emit socket event setelah gdoc_link terisi (atau setelah GAS gagal)
    const io = global.io;
    if (io) io.emit('rangkuman:created', data);

    // Auto-broadcast ke grup WA target jika target_group_ids ada
    const targetGroups = req.body.target_group_ids;
    if (Array.isArray(targetGroups) && targetGroups.length > 0) {
      try {
        const { sendMessageToGroups } = require('../services/waService');
        const matkulData2 = await Matkul.findById(data.matkul_id);
        const msg = `📋 *Rangkuman Materi*\n\n` +
          `📚 Mata Kuliah: ${matkulData2?.nama || '-'}\n` +
          `📌 Judul: ${data.judul}\n\n` +
          `${(data.isi || '').substring(0, 200)}${(data.isi || '').length > 200 ? '...' : ''}\n\n` +
          (data.tugas_tambahan ? `📝 *Tugas Tambahan:*\n${data.tugas_tambahan}\n\n` : '') +
          (data.gdoc_link ? `📄 *Google Doc:* ${data.gdoc_link}` : '');
        await sendMessageToGroups(targetGroups, msg, { logType: 'manual', pengumumanId: data._id });
        console.log(`[Rangkuman] Auto-broadcast "${data.judul}" ke ${targetGroups.length} grup`);
      } catch (broadcastErr) {
        console.error('[Rangkuman] Auto-broadcast error:', broadcastErr.message);
      }
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await Rangkuman.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Rangkuman tidak ditemukan' });
    await data.populate('matkul_id', 'nama');

    // Sync ke Google Sheets (non-blocking)
    const { syncRangkumanUpdate } = require('../services/gasSyncService');
    syncRangkumanUpdate(data);

    // Auto-broadcast jika target_group_ids ada
    const targetGroups = req.body.target_group_ids;
    if (Array.isArray(targetGroups) && targetGroups.length > 0) {
      try {
        const { sendMessageToGroups } = require('../services/waService');
        const msg = `📋 *Rangkuman Diperbarui*\n\n` +
          `📚 Mata Kuliah: ${data.matkul_id?.nama || '-'}\n` +
          `📌 Judul: ${data.judul}\n\n` +
          `${(data.isi || '').substring(0, 200)}${(data.isi || '').length > 200 ? '...' : ''}\n\n` +
          (data.tugas_tambahan ? `📝 *Tugas Tambahan:*\n${data.tugas_tambahan}\n\n` : '') +
          (data.gdoc_link ? `📄 *Google Doc:* ${data.gdoc_link}` : '');
        await sendMessageToGroups(targetGroups, msg, { logType: 'manual', pengumumanId: data._id });
        console.log(`[Rangkuman] Auto-broadcast update "${data.judul}" ke ${targetGroups.length} grup`);
      } catch (broadcastErr) {
        console.error('[Rangkuman] Auto-broadcast update error:', broadcastErr.message);
      }
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await Rangkuman.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Rangkuman tidak ditemukan' });

    // Sync ke Google Sheets (non-blocking)
    const { syncRangkumanDelete } = require('../services/gasSyncService');
    syncRangkumanDelete(data);

    // Hapus Google Doc terkait jika ada
    if (data.gdoc_link) {
      try {
        const { deleteGASDocument } = require('../services/gasService');
        await deleteGASDocument(data.gdoc_link);
      } catch (gasErr) {
        console.error('[Rangkuman] Error deleting Google Doc:', gasErr.message);
      }
    }

    await Rangkuman.findByIdAndDelete(req.params.id);

    // Emit socket event for real-time dashboard update
    const io = global.io;
    if (io) io.emit('rangkuman:deleted', { _id: req.params.id });

    res.json({ success: true, message: 'Berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.dispatch = async (req, res) => {
  try {
    const rangkuman = await Rangkuman.findById(req.params.id).populate('matkul_id', 'nama');
    if (!rangkuman) return res.status(404).json({ success: false, message: 'Rangkuman tidak ditemukan' });

    const msg = `📋 *Rangkuman Materi*\n\n` +
      `📚 Mata Kuliah: ${rangkuman.matkul_id?.nama || '-'}\n` +
      `📌 Judul: ${rangkuman.judul}\n\n` +
      `${rangkuman.isi}\n\n` +
      (rangkuman.tugas_tambahan ? `📝 *Tugas Tambahan:*\n${rangkuman.tugas_tambahan}\n\n` : '') +
      (rangkuman.gdoc_link ? `📄 *Google Doc:* ${rangkuman.gdoc_link}` : '');

    // Use target groups from request body, fallback to jadwal groups, then settings.target_groups
    let groupIds = req.body.target_group_ids;
    
    if (!groupIds || groupIds.length === 0) {
      const jadwals = await Jadwal.find({ matkul_id: rangkuman.matkul_id._id });
      groupIds = [...new Set(jadwals.map(j => j.wa_group_link).filter(Boolean))];
    }
    
    if (!groupIds || groupIds.length === 0) {
      const { Settings } = require('../models');
      const targetSetting = await Settings.findOne({ key: 'target_groups' });
      if (targetSetting?.value?.length) groupIds = targetSetting.value;
    }
    
    if (!groupIds || groupIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada grup target yang dikonfigurasi' });
    }

    const { sendMessageToGroups } = require('../services/waService');
    const result = await sendMessageToGroups(groupIds, msg, { logType: 'manual', pengumumanId: rangkuman._id });
    res.json({ success: true, message: 'Rangkuman berhasil dikirim', result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

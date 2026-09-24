const { Tugas, Matkul } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const data = await Tugas.find().populate('matkul_id', 'nama kode').sort({ deadline: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await Tugas.findById(req.params.id).populate('matkul_id', 'nama kode');
    if (!data) return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await Tugas.create(req.body);
    await data.populate('matkul_id', 'nama');

    // Sync ke Google Sheets (non-blocking)
    const { syncTugasInsert } = require('../services/gasSyncService');
    syncTugasInsert(data);

    const targetGroups = req.body.target_group_ids;
    if (Array.isArray(targetGroups) && targetGroups.length > 0) {
      try {
        const { sendMessageToGroups } = require('../services/waService');
        const deadlineStr = new Date(data.deadline).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
        const msg = `📝 *Tugas Baru*\n\n` +
          `📚 Mata Kuliah: ${data.matkul_id?.nama || '-'}\n` +
          `📌 Judul: ${data.judul}\n` +
          `📋 Deskripsi: ${data.deskripsi || '-'}\n` +
          `⏰ Deadline: ${deadlineStr}`;
        await sendMessageToGroups(targetGroups, msg, { logType: 'manual', pengumumanId: data._id });
        console.log(`[Tugas] Auto-broadcast "${data.judul}" ke ${targetGroups.length} grup`);
      } catch (broadcastErr) {
        console.error('[Tugas] Auto-broadcast error:', broadcastErr.message);
      }
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await Tugas.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    await data.populate('matkul_id', 'nama');

    // Sync ke Google Sheets (non-blocking)
    const { syncTugasUpdate } = require('../services/gasSyncService');
    syncTugasUpdate(data);

    // Auto-broadcast jika target_group_ids ada
    const targetGroups = req.body.target_group_ids;
    if (Array.isArray(targetGroups) && targetGroups.length > 0) {
      try {
        const { sendMessageToGroups } = require('../services/waService');
        const deadlineStr = new Date(data.deadline).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
        const msg = `📝 *Tugas Diperbarui*\n\n` +
          `📚 Mata Kuliah: ${data.matkul_id?.nama || '-'}\n` +
          `📌 Judul: ${data.judul}\n` +
          `📋 Deskripsi: ${data.deskripsi || '-'}\n` +
          `⏰ Deadline: ${deadlineStr}`;
        await sendMessageToGroups(targetGroups, msg, { logType: 'manual', pengumumanId: data._id });
        console.log(`[Tugas] Auto-broadcast update "${data.judul}" ke ${targetGroups.length} grup`);
      } catch (broadcastErr) {
        console.error('[Tugas] Auto-broadcast update error:', broadcastErr.message);
      }
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await Tugas.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });

    // Sync ke Google Sheets (non-blocking)
    const { syncTugasDelete } = require('../services/gasSyncService');
    syncTugasDelete(data);

    res.json({ success: true, message: 'Berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.dispatch = async (req, res) => {
  try {
    const tugas = await Tugas.findById(req.params.id).populate('matkul_id', 'nama');
    if (!tugas) return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });

    const deadlineStr = new Date(tugas.deadline).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
    const msg = `📝 *Tugas Baru*\n\n` +
      `📚 Mata Kuliah: ${tugas.matkul_id?.nama || '-'}\n` +
      `📌 Judul: ${tugas.judul}\n` +
      `📋 Deskripsi: ${tugas.deskripsi || '-'}\n` +
      `⏰ Deadline: ${deadlineStr}`;

    // Use target groups from request body or fallback to jadwal groups
    const targetGroups = req.body.target_group_ids;
    let groupIds = targetGroups;
    
    if (!groupIds || groupIds.length === 0) {
      const { Jadwal } = require('../models');
      const jadwals = await Jadwal.find({ matkul_id: tugas.matkul_id._id });
      groupIds = [...new Set(jadwals.map(j => j.wa_group_link).filter(Boolean))];
    }
    
    if (groupIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada grup target yang dikonfigurasi' });
    }

    const { sendMessageToGroups } = require('../services/waService');
    const result = await sendMessageToGroups(groupIds, msg, { logType: 'schedule_tugas', pengumumanId: tugas._id });
    res.json({ success: true, message: 'Reminder tugas berhasil dikirim', result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

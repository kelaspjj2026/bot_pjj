const { Pengumuman, PengumumanLog } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const data = await Pengumuman.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await Pengumuman.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await Pengumuman.create(req.body);

    // Sync ke Google Sheets (non-blocking)
    const { syncPengumumanInsert } = require('../services/gasSyncService');
    syncPengumumanInsert(data);

    const targetGroups = req.body.target_group_ids;
    if (Array.isArray(targetGroups) && targetGroups.length > 0) {
      try {
        const { sendMessageToGroups } = require('../services/waService');
        const msg = `📢 *${data.judul}*\n\n${data.isi}`;
        await sendMessageToGroups(targetGroups, msg, { logType: 'manual', pengumumanId: data._id });
        console.log(`[Pengumuman] Auto-broadcast "${data.judul}" ke ${targetGroups.length} grup`);
      } catch (broadcastErr) {
        console.error('[Pengumuman] Auto-broadcast error:', broadcastErr.message);
      }
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await Pengumuman.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });

    // Sync ke Google Sheets (non-blocking)
    const { syncPengumumanUpdate } = require('../services/gasSyncService');
    syncPengumumanUpdate(data);

    // Auto-broadcast jika target_group_ids ada
    const targetGroups = req.body.target_group_ids;
    if (Array.isArray(targetGroups) && targetGroups.length > 0) {
      try {
        const { sendMessageToGroups } = require('../services/waService');
        const msg = `📢 *${data.judul}*\n\n${data.isi}`;
        await sendMessageToGroups(targetGroups, msg, { logType: 'manual', pengumumanId: data._id });
        console.log(`[Pengumuman] Auto-broadcast update "${data.judul}" ke ${targetGroups.length} grup`);
      } catch (broadcastErr) {
        console.error('[Pengumuman] Auto-broadcast update error:', broadcastErr.message);
      }
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await Pengumuman.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });

    // Sync ke Google Sheets (non-blocking)
    const { syncPengumumanDelete } = require('../services/gasSyncService');
    syncPengumumanDelete(data);

    res.json({ success: true, message: 'Berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.dispatch = async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findById(req.params.id);
    if (!pengumuman) return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });

    // Use target groups from request body or fallback to pengumuman's target_group_ids
    const targetGroups = req.body.target_group_ids || pengumuman.target_group_ids || [];
    
    const msg = `📢 *${pengumuman.judul}*\n\n${pengumuman.isi}`;

    const { sendMessageToGroups } = require('../services/waService');
    const result = await sendMessageToGroups(
      targetGroups,
      msg,
      { logType: 'manual', pengumumanId: pengumuman._id }
    );

    res.json({ success: true, message: 'Pengumuman berhasil dikirim', result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await PengumumanLog.find({ pengumuman_id: req.params.id }).sort({ sent_at: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const { Jadwal, Matkul } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const data = await Jadwal.find().populate('matkul_id', 'nama kode gmeet_link').sort({ hari: 1, jam_mulai: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await Jadwal.findById(req.params.id).populate('matkul_id', 'nama kode gmeet_link');
    if (!data) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await Jadwal.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await Jadwal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await Jadwal.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    res.json({ success: true, message: 'Berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getToday = async (req, res) => {
  try {
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const today = days[new Date().getDay()];
    const data = await Jadwal.find({ hari: today }).populate('matkul_id', 'nama kode gmeet_link dosen');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const data = await Jadwal.find({ hari: day.toLowerCase() }).populate('matkul_id', 'nama kode gmeet_link dosen');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

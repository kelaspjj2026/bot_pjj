const { Settings } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const settings = await Settings.find();
    const obj = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    res.json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    res.json({ success: true, data: setting ? setting.value : null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.set = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ success: false, message: 'Key harus diisi' });
    const data = await Settings.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Settings.findOneAndDelete({ key: req.params.key });
    res.json({ success: true, message: 'Setting dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBotStatus = async (req, res) => {
  try {
    const { getWAStatus } = require('../services/waService');
    const status = getWAStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetWA = async (req, res) => {
  try {
    const { resetWA } = require('../services/waService');
    const io = global.io;
    await resetWA(io);
    res.json({ success: true, message: 'WhatsApp QR Code reset berhasil, silakan scan ulang' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWAStatus = async (req, res) => {
  try {
    const { getWAStatus } = require('../services/waService');
    const status = getWAStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWAGroups = async (req, res) => {
  try {
    const { getGroups } = require('../services/waService');
    const result = await getGroups();
    res.json({ success: result.success, data: result.groups, message: result.message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, groups: [] });
  }
};

exports.testGroupDispatch = async (req, res) => {
  try {
    const { groupId, message } = req.body;
    if (!groupId || !message) {
      return res.status(400).json({ success: false, message: 'groupId dan message harus diisi' });
    }
    const { testGroupDispatch } = require('../services/waService');
    const result = await testGroupDispatch(groupId, message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.testIndividualDispatch = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'message harus diisi' });
    }
    const { testIndividualDispatch } = require('../services/waService');
    const result = await testIndividualDispatch(message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
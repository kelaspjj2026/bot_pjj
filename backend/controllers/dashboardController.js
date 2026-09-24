const { Matkul, Jadwal, Pengumuman, Tugas, Mahasiswa, Rangkuman } = require('../models');

exports.getStats = async (req, res) => {
  try {
    const [matkul, jadwal, pengumuman, tugas, mahasiswa, rangkuman] = await Promise.all([
      Matkul.countDocuments(),
      Jadwal.countDocuments(),
      Pengumuman.countDocuments(),
      Tugas.countDocuments({ status: 'aktif' }),
      Mahasiswa.countDocuments(),
      Rangkuman.countDocuments(),
    ]);

    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const today = days[new Date().getDay()];
    const jadwalHariIni = await Jadwal.find({ hari: today }).populate('matkul_id', 'nama');

    res.json({
      success: true,
      data: {
        matkul,
        jadwal,
        pengumuman,
        tugasAktif: tugas,
        mahasiswa,
        rangkuman,
        jadwalHariIni,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

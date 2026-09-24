const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ============================================
// 1. MATKUL (Mata Kuliah / Course)
// ============================================
const matkulSchema = new Schema({
  kode: { type: String, required: true },
  nama: { type: String, required: true },
  sks: { type: Number, required: true },
  dosen: { type: String, required: true },
  gmeet_link: { type: String, default: '' }
}, { timestamps: true });

// ============================================
// 2. JADWAL (Schedule)
// ============================================
const jadwalSchema = new Schema({
  matkul_id: { type: Schema.Types.ObjectId, ref: 'Matkul', required: true },
  hari: {
    type: String,
    required: true,
    enum: ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']
  },
  jam_mulai: { type: String, required: true },
  jam_selesai: { type: String, required: true },
  gmeet_link: { type: String, default: '' },
  wa_group_link: { type: String, default: '' }
}, { timestamps: true });

// ============================================
// 3. MAHASISWA (Student)
// ============================================
const mahasiswaSchema = new Schema({
  nomor: { type: Number, required: true },
  nama: { type: String, required: true },
  nim: { type: String, required: true, unique: true },
  wa: { type: String, required: true }
}, { timestamps: true });

// ============================================
// 4. PENGUMUMAN (Announcement)
// ============================================
const pengumumanSchema = new Schema({
  judul: { type: String, required: true },
  isi: { type: String, required: true },
  is_recurring: { type: Boolean, default: false },
  schedule_time: { type: String, default: '' },
  repeat_days: [{ type: String }],
  is_active: { type: Boolean, default: true },
  target_group_ids: [{ type: String }]
}, { timestamps: true });

// ============================================
// 5. PENGUMUMAN LOG (Announcement Send Log)
// ============================================
const pengumumanLogSchema = new Schema({
  pengumuman_id: { type: Schema.Types.ObjectId, ref: 'Pengumuman', required: true },
  grup_id: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  error: { type: String, default: '' }
}, { timestamps: true });

// ============================================
// 6. TUGAS (Assignment)
// ============================================
const tugasSchema = new Schema({
  matkul_id: { type: Schema.Types.ObjectId, ref: 'Matkul', required: true },
  judul: { type: String, required: true },
  deskripsi: { type: String, default: '' },
  deadline: { type: Date, required: true },
  status: { type: String, default: 'aktif', enum: ['aktif', 'selesai', 'dibatalkan'] },
  target_group_ids: [{ type: String }]
}, { timestamps: true });

// ============================================
// 7. RANGKUMAN (Summary)
// ============================================
const rangkumanSchema = new Schema({
  matkul_id: { type: Schema.Types.ObjectId, ref: 'Matkul', required: true },
  judul: { type: String, required: true },
  isi: { type: String, default: '' },
  tugas_tambahan: { type: String, default: '' },
  gdoc_link: { type: String, default: '' },
  target_group_ids: [{ type: String }]
}, { timestamps: true });

// ============================================
// 8. TITIP ABSEN (Proxy Attendance)
// ============================================
const titipAbsenSchema = new Schema({
  nim: { type: String, required: true },
  nama: { type: String, required: true },
  timestamp: { type: String, required: true },
  password: { type: String, default: '' },
  matrikulasi: { type: String, default: '' }
}, { timestamps: true });

// ============================================
// 9. SETTINGS (Key-Value Config)
// ============================================
const settingsSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Schema.Types.Mixed, required: true }
}, { timestamps: true });

// ============================================
// Export all models
// ============================================
const Matkul = mongoose.model('Matkul', matkulSchema);
const Jadwal = mongoose.model('Jadwal', jadwalSchema);
const Mahasiswa = mongoose.model('Mahasiswa', mahasiswaSchema);
const Pengumuman = mongoose.model('Pengumuman', pengumumanSchema);
const PengumumanLog = mongoose.model('PengumumanLog', pengumumanLogSchema);
const Tugas = mongoose.model('Tugas', tugasSchema);
const Rangkuman = mongoose.model('Rangkuman', rangkumanSchema);
const TitipAbsen = mongoose.model('TitipAbsen', titipAbsenSchema);
const Settings = mongoose.model('Settings', settingsSchema);

module.exports = {
  Matkul,
  Jadwal,
  Mahasiswa,
  Pengumuman,
  PengumumanLog,
  Tugas,
  Rangkuman,
  TitipAbsen,
  Settings
};

const { Matkul, Jadwal, Mahasiswa, Settings, Pengumuman } = require('../models');

const seedData = async () => {
  try {
    console.log('[Seeder] Starting seed...');

    // 1. Seed Mata Kuliah (only if empty)
    const matkulCount = await Matkul.countDocuments();
    if (matkulCount === 0) {
      const matkuls = [
        { kode: 'A18.2C101', nama: 'KALKULUS', sks: 3, dosen: 'MUHTADI S.Si, M.Kom', gmeet_link: 'https://meet.google.com/rot-bkab-xjz' },
        { kode: 'A18.2C102', nama: 'FISIKA', sks: 4, dosen: 'NOVIANTO NUR HIDAYAT M.Sc', gmeet_link: 'https://meet.google.com/mdx-dynh-iit' },
        { kode: 'A18.2C103', nama: 'DASAR PEMROGRAMAN', sks: 4, dosen: 'DAURAT SINAGA M.Kom', gmeet_link: '' },
        { kode: 'AF201704', nama: 'DASAR-DASAR KOMPUTASI', sks: 2, dosen: 'NOVI HENDRIYANTO M.Kom', gmeet_link: 'https://meet.google.com/ajp-duaw-sqk' },
        { kode: 'N201701', nama: 'BAHASA INDONESIA', sks: 2, dosen: 'MARYA ULFA S.Pd, M.Pd.', gmeet_link: 'https://meet.google.com/azw-gtyt-myz' },
        { kode: 'N2017051', nama: 'PENDIDIKAN AGAMA ISLAM', sks: 2, dosen: 'CHOIRUL ANAM M.Pd.I', gmeet_link: '' },
        { kode: 'U201704', nama: 'PENGANTAR TEKNOLOGI INFORMASI', sks: 2, dosen: 'IBNU UTOMO W.M. M.Kom', gmeet_link: 'https://meet.google.com/qqu-jdxz-xzp' },
      ];

      const createdMatkuls = await Matkul.insertMany(matkuls);
      const matkulMap = {};
      createdMatkuls.forEach(m => { matkulMap[m.nama] = m._id; });
      console.log('[Seeder] Created', createdMatkuls.length, 'mata kuliah');

      // 2. Seed Jadwal
      const jadwals = [
        { matkul_id: matkulMap['KALKULUS'], hari: 'selasa', jam_mulai: '09:30', jam_selesai: '12:00', gmeet_link: 'https://meet.google.com/rot-bkab-xjz', wa_group_link: 'https://chat.whatsapp.com/IvilDhGgOrM9Li418fFRUW?s=sw&p=i&mlu=4&ilr=4' },
        { matkul_id: matkulMap['FISIKA'], hari: 'selasa', jam_mulai: '07:00', jam_selesai: '08:40', gmeet_link: 'https://meet.google.com/mdx-dynh-iit', wa_group_link: 'https://chat.whatsapp.com/LZD1phikPLRF0TUZdZEJT2' },
        { matkul_id: matkulMap['FISIKA'], hari: 'jumat', jam_mulai: '07:00', jam_selesai: '08:40', gmeet_link: 'https://meet.google.com/mdx-dynh-iit', wa_group_link: 'https://chat.whatsapp.com/LZD1phikPLRF0TUZdZEJT2' },
        { matkul_id: matkulMap['DASAR PEMROGRAMAN'], hari: 'kamis', jam_mulai: '18:30', jam_selesai: '20:10', gmeet_link: '', wa_group_link: '' },
        { matkul_id: matkulMap['DASAR PEMROGRAMAN'], hari: 'jumat', jam_mulai: '16:20', jam_selesai: '18:00', gmeet_link: '', wa_group_link: '' },
        { matkul_id: matkulMap['DASAR-DASAR KOMPUTASI'], hari: 'senin', jam_mulai: '10:20', jam_selesai: '12:00', gmeet_link: 'https://meet.google.com/ajp-duaw-sqk', wa_group_link: 'https://chat.whatsapp.com/BVaodsoAL4B4Ct6iY3HsHk?s=cl&p=a&mlu=0&ilr=4' },
        { matkul_id: matkulMap['BAHASA INDONESIA'], hari: 'senin', jam_mulai: '12:30', jam_selesai: '14:10', gmeet_link: 'https://meet.google.com/azw-gtyt-myz', wa_group_link: 'https://chat.whatsapp.com/JZx8i0Lfg6e2Hq5bG1RWL0' },
        { matkul_id: matkulMap['PENDIDIKAN AGAMA ISLAM'], hari: 'kamis', jam_mulai: '08:40', jam_selesai: '10:20', gmeet_link: '', wa_group_link: 'https://chat.whatsapp.com/Jpf4HwA8lKT3H32bvEi3Ir?s=cl&p=a&mlu=4&ilr=4' },
        { matkul_id: matkulMap['PENGANTAR TEKNOLOGI INFORMASI'], hari: 'rabu', jam_mulai: '10:20', jam_selesai: '12:00', gmeet_link: 'https://meet.google.com/qqu-jdxz-xzp', wa_group_link: 'https://chat.whatsapp.com/K4p20dXnusiDy7060rurlh' },
      ];

      await Jadwal.insertMany(jadwals);
      console.log('[Seeder] Created', jadwals.length, 'jadwal kuliah');
    } else {
      console.log('[Seeder] Mata Kuliah & Jadwal already exist, skipping');
    }

    // 3. Seed Mahasiswa (Angkatan 2026) — RESET TOTAL: deleteAll lalu insertMany
    const dataMahasiswa = [
      { nomor: 1, nama: 'mohammad maulana abdul latif', nim: 'A18.2026.00230', wa: '088237182628' },
      { nomor: 2, nama: 'MUHAMMAD SYARIF', nim: 'A18.2026.00235', wa: '082138502243' },
      { nomor: 3, nama: 'Rifani Keyza Laya Putri', nim: 'A18.2026.00257', wa: '0895324531414' },
      { nomor: 4, nama: 'Feliona Lifka Mahesti', nim: 'A18.2026.00260', wa: '085253774186' },
      { nomor: 5, nama: 'RIZKI FAJRIANSAH IRAWAN', nim: 'A18.2026.00237', wa: '082241586886' },
      { nomor: 6, nama: 'Habib Munzir Al Musawa', nim: 'A18.2026.00226', wa: '082133706631' },
      { nomor: 7, nama: 'Mario Adi Saputra', nim: 'A18.2026.00248', wa: '085920296659' },
      { nomor: 8, nama: 'Nabil Arif', nim: 'A18.2026.00240', wa: '089531310903' },
      { nomor: 9, nama: 'muhammad fachry maulana rizkiansyah', nim: 'A18.2026.00232', wa: '085286685371' },
      { nomor: 10, nama: 'Alan tri negara', nim: 'A18.2026.00258', wa: '082256887076' },
      { nomor: 11, nama: 'Sely Marlinda Sulistiyanto', nim: 'A18.2026.00236', wa: '085883170783' },
      { nomor: 12, nama: 'Azka Rosul', nim: 'A18.2026.00243', wa: '081348433350' },
      { nomor: 13, nama: 'Yafi Ali', nim: 'A18.2026.00233', wa: '085704181939' },
      { nomor: 14, nama: 'Eiffelina Eiffelina Wiyono', nim: 'A18.2026.00254', wa: '08997878085' },
      { nomor: 15, nama: 'Rully Fadheli', nim: 'A18.2026.00223', wa: '081910929397' },
      { nomor: 16, nama: 'Dean Jagadita Ahmad Monsi', nim: 'A18.2026.00244', wa: '089665640209' },
      { nomor: 17, nama: 'Salsa Wahyuni Ahmad', nim: 'A18.2026.00251', wa: '0895810290744' },
      { nomor: 18, nama: 'Caesar Nobel', nim: 'A18.2026.00238', wa: '081230589658' },
      { nomor: 19, nama: 'Nisrina Tunggal Dewi', nim: 'A18.2026.00231', wa: '089516126517' },
      { nomor: 20, nama: 'SYAHIRA AZ ZAHRA', nim: 'A18.2026.00252', wa: '089644068797' },
      { nomor: 21, nama: 'Daniel Giustino Margono', nim: 'A18.2026.00261', wa: '087894478795' },
      { nomor: 22, nama: 'Muhammad Abdillah Nurwahid', nim: 'A18.2026.00246', wa: '082247874882' },
      { nomor: 23, nama: 'IZA AGIL FAUZAN', nim: 'A18.2026.00256', wa: '085770722501' },
      { nomor: 24, nama: 'Ahmad Ibnu Riadho', nim: 'A18.2026.00227', wa: '087759089058' },
      { nomor: 25, nama: 'Dona Prisna Saputra', nim: 'A18.2026.00255', wa: '081510801122' },
      { nomor: 26, nama: 'Anisa Hiliah Kharim', nim: 'A18.2026.00247', wa: '085601725883' },
      { nomor: 27, nama: 'Mohammad Nurkholis Majid', nim: 'A18.2026.00224', wa: '08999490407' },
      { nomor: 28, nama: 'HANA ZAHRATUSITA', nim: 'A18.2026.00239', wa: '081290503992' },
      { nomor: 29, nama: 'Daafa Fadhil Nurul Azis', nim: 'A18.2026.00241', wa: '081228046740' },
      { nomor: 30, nama: 'Dhandika wirarnandhi yuldantoro', nim: 'A18.2026.00262', wa: '087887583790' },
      { nomor: 31, nama: 'Yanu Yustianto', nim: 'A18.2026.00265', wa: '083176036407' },
      { nomor: 32, nama: 'Moh Misbahul Munir', nim: 'A18.2026.00249', wa: '083129039990' },
      { nomor: 33, nama: 'Evelyn Nissa Apriliani Farizal', nim: 'A18.2026.00263', wa: '082232030344' },
      { nomor: 34, nama: 'Nurul Alam', nim: 'A18.2026.00242', wa: '082227278416' },
      { nomor: 35, nama: 'Muhammad Allif Alvito', nim: 'A18.2026.00222', wa: '087730829163' },
      { nomor: 36, nama: 'Davina Salva Andita', nim: 'A18.2026.00250', wa: '08812940010' },
      { nomor: 37, nama: 'Silfia ramadani', nim: 'A18.2026.00229', wa: '083124375841' },
      { nomor: 38, nama: 'Mohammad Nurkholis Majid', nim: 'A18.2026.00224', wa: '08999490407' },
      { nomor: 39, nama: 'Mohammad Djovanka', nim: 'A18.2026.00225', wa: '082133837572' },
      { nomor: 40, nama: 'Waiz Fadhil Abdul Alim', nim: 'A18.2026.00253', wa: '081228783193' }
    ];

    // Hapus semua data lama, lalu insert presisi 40 record
    await Mahasiswa.deleteMany({});
    console.log('[Seeder] Cleared all old mahasiswa data');

    // Sort by NIM suffix ascending & assign temporary nomor
    const getNimSuffix = (nim) => parseInt(String(nim).split('.').pop() || '0', 10);
    dataMahasiswa.sort((a, b) => getNimSuffix(a.nim) - getNimSuffix(b.nim));
    dataMahasiswa.forEach((item, i) => { item.nomor = i + 1; });

    try {
      await Mahasiswa.insertMany(dataMahasiswa, { ordered: false });
    } catch (insertErr) {
      if (!insertErr.writeErrors) throw insertErr;
      console.log('[Seeder] Skipped', insertErr.writeErrors.length, 'duplicate NIM');
    }

    // Re-index: sort by NIM suffix & assign nomor 1..N (fix skip duplikat)
    const allDocs = await Mahasiswa.find();
    const sorted = allDocs.sort((a, b) => getNimSuffix(a.nim) - getNimSuffix(b.nim));
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].nomor !== i + 1) {
        await Mahasiswa.findByIdAndUpdate(sorted[i]._id, { nomor: i + 1 });
      }
    }
    console.log('[Seeder] Inserted', sorted.length, 'mahasiswa, re-indexed 1..' + sorted.length);

    // 4. Seed Target Groups (WhatsApp Groups)
    const { Settings } = require('../models');
    const targetGroups = [
      'Perkuliahan (Info PJJ)',
      'admin judol',
      'test'
    ];
    await Settings.findOneAndUpdate(
      { key: 'target_groups' },
      { key: 'target_groups', value: targetGroups },
      { upsert: true, new: true }
    );
    console.log('[Seeder] Target groups seeded:', targetGroups);

    // 5. Seed Pengumuman Berulang — Titip Absen (jam 21:00 setiap hari)
    const TITIP_ABSEN_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLScgeyz6d6CQVjLkgpvklxVS2Bcnxhj-K1kjVD_Rpv8bPPi0bw/viewform?usp=header';
    const existingAbsen = await Pengumuman.findOne({ judul: 'Pesan Otomatis Titip Absen' });
    if (!existingAbsen) {
      await Pengumuman.create({
        judul: 'Pesan Otomatis Titip Absen',
        isi: `📢 *PENGINGAT TITIP ABSEN PERKULIAHAN*\n\nBagi mahasiswa yang ingin melakukan titip absen, silakan isi borang pada tautan berikut:\n🔗 ${TITIP_ABSEN_LINK}\n\nMohon diisi dengan data yang benar.`,
        is_recurring: true,
        schedule_time: '21:00',
        repeat_days: ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'],
        is_active: true,
        target_group_ids: []
      });
      console.log('[Seeder] Pengumuman Titip Absen seeded (jam 21:00, setiap hari)');
    } else {
      console.log('[Seeder] Pengumuman Titip Absen already exists, skipping');
    }

    // 6. Seed Settings — link_titip_absen
    await Settings.findOneAndUpdate(
      { key: 'link_titip_absen' },
      { key: 'link_titip_absen', value: TITIP_ABSEN_LINK },
      { upsert: true, new: true }
    );
    console.log('[Seeder] Settings link_titip_absen seeded');

    // 7. Seed Settings — gas_library_id (Google Apps Script Library ID)
    const DEFAULT_GAS_LIBRARY_ID = '1tymqZa1CXCxYVqiqFzPAhu3xD9GLMUaTqvP3RNkwlLii1CbSrepRJbf9';
    await Settings.findOneAndUpdate(
      { key: 'gas_library_id' },
      { key: 'gas_library_id', value: DEFAULT_GAS_LIBRARY_ID },
      { upsert: true, new: true }
    );
    console.log('[Seeder] Settings gas_library_id seeded:', DEFAULT_GAS_LIBRARY_ID);

    console.log('[Seeder] Seed completed successfully');
  } catch (err) {
    console.error('[Seeder] Error:', err.message);
  }
};

module.exports = { seedData };

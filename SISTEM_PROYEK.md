# 📋 SISTEM PROYEK: Bot WhatsApp PJJ Informatika Udinus (Docker & MongoDB)

---

## 1. Overview / Gambaran Umum

Sistem ini adalah **Bot WhatsApp otomatis** beserta **Dashboard Admin Web** untuk mengelola kelas PJJ (Pembelajaran Jarak Jauh) program studi Informatika di Universitas Dian Nuswantoro (Udinus). Sistem ini dibangunkan sepenuhnya dari awal (dari 0) menggunakan teknologi kontena **Docker**, basis data **MongoDB**, serta seni bina kod terpisah antara **Frontend** dan **Backend**.

| Komponen | Deskripsi |
|---|---|
| **Bot WhatsApp** | Bot otomatis yang merespons perintah di grup WhatsApp dan mengirimkan reminder/pengumuman otomatis |
| **Dashboard Admin Web** | Panel administrasi berbasis web untuk mengelola semua fitur sistem dan melakukan pengiriman pesan langsung |
| **Runtime & Container** | Node.js (Express.js) + Docker & Docker Compose |
| **Lokasi Storage Server** | `/mnt/datadisk/cloud server/bot` |
| **BASE_PATH** | `/bot` |
| **URL Akses** | `https://cswa.latifdev.com/bot/` |
| **Database Engine** | MongoDB 6.0 (`helpdesk_bot`) |

---

## 2. Deployment & Server Configuration

| Parameter | Nilai |
|---|---|
| **Server Path (Deploy)** | `/mnt/datadisk/cloud server/bot` |
| **Source Path** | `/mnt/datadisk/cloud server/bot` |
| **Port** | `3002` (Host) / `3001` (Container) |
| **BASE_PATH** | `/bot` |
| **Public URL** | `https://cswa.latifdev.com/bot/` |
| **Container Manager** | Docker Compose (`wa_bot_pjj`) |
| **Database** | MongoDB 6.0 (`helpdesk_bot`) |
| **Reverse Proxy** | Nginx (SSL/HTTPS) |
| **Runtime** | Node.js v20+ (Di dalam Container) |

---

## 3. Aturan Otomatisasi & Instruksi AI (AI Execution Rules)

> 🤖 **INTRUKSI OTOMATIS UNTUK AI / BOT:**
>
> 1. **Auto-Update Features:** Setiap kali AI membuat, mengubah, atau menghapus fitur/skema/endpoint, AI **WAJIB OTOMATIS MEMPERBARUI** bagian **Daftar Fitur Aktif** dan bagian **History Sistem & Changelog** di file `SISTEM_PROYEK.md` ini secara mandiri tanpa perlu diminta ulang oleh pengguna.
> 2. **Version Bump:** Setiap pembaruan wajib menaikkan versi sistem (misal: v2.0.1, v2.1.0) beserta tanggal eksekusi.
> 3. **Format Logging:** Setiap entri pada Changelog wajib dikelompokkan dengan tag indikator:
>    - `[FEAT]` : Fitur baru yang berhasil ditambahkan.
>    - `[FIX]` : Perbaikan bug / kesalahan pada sistem.
>    - `[CHANGE]` : Perubahan pada logika atau struktur fitur yang sudah ada.
>    - `[REFACTOR]` : Restrukturisasi kode tanpa mengubah fungsionalitas.

---

## 4. Fitur Bot WhatsApp & Pengiriman Pesan (Auto-Updated)

### 4.1 Perintah Bot di Grup

Bot akan merespons perintah berikut ketika diketikkan di grup WhatsApp:

| Perintah | Alias | Deskripsi | Status Fitur |
|---|---|---|---|
| `halo` | `help`, `bantuan` | Menampilkan menu bantuan dan daftar perintah yang tersedia | 🟢 Active |
| `jadwal` | `info jadwal` | Menampilkan jadwal kuliah untuk hari ini | 🟢 Active |
| `jadwal senin` | — | Menampilkan jadwal kuliah untuk hari tertentu (senin - minggu) | 🟢 Active |
| `tugas` | `info tugas` | Menampilkan daftar tugas aktif beserta deadline | 🟢 Active |
| `pengumuman` | — | Menampilkan pengumuman terbaru | 🟢 Active |
| `matkul` | — | Menampilkan daftar mata kuliah yang terdaftar[cite: 1] | 🟢 Active |
| `status` | — | Menampilkan status koneksi bot WhatsApp[cite: 1] | 🟢 Active |

> **Catatan:** Bot merespons di grup WhatsApp yang telah terdaftar/diizinkan melalui pengaturan[cite: 1].

### 4.2 Otomatisasi & Scheduled Messaging

Seluruh opsi otomatisasi di bawah ini **dapat disetting dan disesuaikan ketentuannya melalui Dashboard Admin Web**[cite: 1]:

| Jenis Otomatisasi | Waktu / Trigger | Deskripsi | Status Fitur |
|---|---|---|---|
| **Reminder Kuliah (< 10 Menit)** | 10 menit sebelum jam mulai kuliah | Mengirimkan notifikasi ke grup bahwa hari ini ada jadwal kuliah beserta **link Google Meet** (dapat diatur waktu offset & template pesannya di dashboard)[cite: 1] | 🟢 Active |
| **Pesan Otomatis Titip Absen** | Dijadwalkan otomatis (misal: jam 20:00) | Mengirimkan pesan otomatis berisi link **Google Forms titip absen** beserta instruksi cara mengisi datanya ke grup yang ditentukan[cite: 1] | 🟢 Active |
| **Reminder Tugas (H-3, H-1, H-0)** | 3 hari, 1 hari, dan hari H deadline | Mengingatkan deadline tugas secara bertahap (status aktif & offset hari dapat diatur di dashboard)[cite: 1] | 🟢 Active |
| **Rangkuman Otomatis** | Setelah perkuliahan selesai | Mengirimkan rangkuman materi dan tugas dari sesi kuliah yang baru saja selesai[cite: 1] | 🟢 Active |

### 4.3 Fitur Kirim Pesan Langsung dari Dashboard (Direct Dispatch)

Melalui Panel Dashboard Admin, admin dapat secara manual/langsung memicu (broadcast) pesan ke grup WhatsApp terhubung melalui beberapa menu[cite: 1]:
- **Menu Pengumuman**: Tombol *"Kirim ke Grup"* untuk menyebarkan pengumuman/informasi instan atau berulang[cite: 1].
- **Menu Tugas & Deadline**: Tombol *"Kirim Reminder"* untuk mengirimkan rincian tugas & deadline ke grup[cite: 1].
- **Menu Rangkuman**: Tombol *"Simpan & Kirim"* untuk mengirimkan rangkuman materi kuliah beserta tugas tambahan secara langsung ke grup[cite: 1].

---

## 5. Dashboard Admin Web

### 5.1 Login & Akses

| Field | Nilai |
|---|---|
| **URL** | `https://cswa.latifdev.com/bot/`[cite: 1] |
| **Email / Username** | `support@latifdev.com` / `admin`[cite: 1] |
| **Password** | `admin123`[cite: 1] |

### 5.2 Menu Dashboard

| Ikon | Menu | Deskripsi & Fitur Pengaturan | Status Fitur |
|---|---|---|---|
| 📊 | **Dashboard** | Overview statistik seluruh data, status bot, dan jadwal hari ini[cite: 1] | 🟢 Ready |
| 📚 | **Mata Kuliah** | CRUD mata kuliah & link Google Meet per mata kuliah[cite: 1] | 🟢 Ready |
| 📅 | **Jadwal Kuliah** | CRUD jadwal (hari, jam mulai/selesai) + tautan Google Meet[cite: 1] | 🟢 Ready |
| 📢 | **Pengumuman** | CRUD pengumuman, pengatur jadwal berulang pesan **Google Forms Titip Absen**, & tombol kirim ke grup[cite: 1] | 🟢 Ready |
| 📝 | **Tugas & Deadline** | CRUD tugas, pengaturan reminder otomatis (H-3, H-1, H-0), & tombol kirim reminder[cite: 1] | 🟢 Ready |
| 👥 | **Mahasiswa** | CRUD data mahasiswa & **Fitur Impor Data dari File Excel (.xlsx / .csv)**[cite: 1] | 🟢 Ready |
| 📋 | **Rangkuman** | CRUD rangkuman materi & tombol kirim langsung ke grup WA[cite: 1] | 🟢 Ready |
| ⚙️ | **Pengaturan** | **Pengaturan Notifikasi Kuliah (< 10 Menit)**, pengaturan link Google Forms absen, Toggle grup aktif, status WA, & QR Code scanner[cite: 1] | 🟢 Ready |

---

## 6. Database Schema (MongoDB)

Database utama: `helpdesk_bot`[cite: 1]

### Collections & Fields

1. **`matkul`**[cite: 1]
   - `kode` (String, Unique)[cite: 1]
   - `nama` (String)[cite: 1]
   - `sks` (Number)[cite: 1]
   - `dosen` (String)[cite: 1]
   - `gmeet_link` (String)[cite: 1]
   - `createdAt`, `updatedAt` (Date)[cite: 1]

2. **`jadwal`**[cite: 1]
   - `matkul_id` (ObjectId, ref: 'matkul')[cite: 1]
   - `hari` (String: senin - minggu)[cite: 1]
   - `jam_mulai` (String: HH:mm)[cite: 1]
   - `jam_selesai` (String: HH:mm)[cite: 1]
   - `gmeet_link` (String)[cite: 1]
   - `wa_group_link` (String)[cite: 1]

3. **`pengumuman`**[cite: 1]
   - `judul` (String)[cite: 1]
   - `isi` (String)[cite: 1]
   - `target_group_ids` (Array of Strings)[cite: 1]
   - `is_recurring` (Boolean)[cite: 1]
   - `schedule_time` (String: "HH:mm")[cite: 1]
   - `repeat_days` (Array of Strings)[cite: 1]
   - `is_active` (Boolean)[cite: 1]
   - `createdAt` (Date)[cite: 1]

4. **`tugas`**[cite: 1]
   - `matkul_id` (ObjectId, ref: 'matkul')[cite: 1]
   - `judul` (String)[cite: 1]
   - `deskripsi` (String)[cite: 1]
   - `deadline` (Date)[cite: 1]
   - `status` (String: 'aktif' / 'selesai')[cite: 1]
   - `createdAt` (Date)[cite: 1]

5. **`mahasiswa`** (Format Excel / Spreadsheet)
   - `nomor` (Number)[cite: 2]
   - `nama` (String)[cite: 2]
   - `nim` (String, Unique)[cite: 2]
   - `wa` (String)[cite: 2]
   - `createdAt`, `updatedAt` (Date)

> **Format Header File Excel Impor (`.xlsx` / `.csv`):**
> | nomor | nama | nim | wa |[cite: 2]
> |---|---|---|---|
> | 1 | mohammad maulana abdul latif | A18.2026.00230 | 088237182628 |[cite: 2]

6. **`rangkuman`**[cite: 1]
   - `matkul_id` (ObjectId, ref: 'matkul')[cite: 1]
   - `judul` (String)[cite: 1]
   - `isi` (String)[cite: 1]
   - `tugas_tambahan` (String)[cite: 1]
   - `createdAt` (Date)[cite: 1]

7. **`settings`**[cite: 1]
   - `key` (String)[cite: 1]
   - `value` (Mixed)[cite: 1]

8. **`pengumuman_log`**[cite: 1]
   - `pengumuman_id` (ObjectId, ref: 'pengumuman')[cite: 1]
   - `grup_id` (String)[cite: 1]
   - `status` (String)[cite: 1]
   - `sent_at` (Date)[cite: 1]

---

## 7. Structure Folder Proyek (Clean Architecture)
/mnt/datadisk/cloud server/bot/
├── docker-compose.yml             # Orchestration Docker (App & MongoDB)[cite: 1]
├── Dockerfile                     # Multi-stage build Node.js app[cite: 1]
├── .env                           # Environment variables[cite: 1]
├── SISTEM_PROYEK.md               # Dokumentasi utama & Log History Sistem[cite: 1]
├── sessions/                      # Storage persistent Baileys WhatsApp Session[cite: 1]
│
├── backend/                       # --- BACKEND SERVICE ---
│   ├── package.json               # Node.js dependencies (Mongoose, Multer, xlsx)
│   ├── server.js                  # Entry point (Express + Socket.IO)[cite: 1]
│   ├── config/
│   │   ├── db.js                  # Koneksi MongoDB via Mongoose[cite: 1]
│   │   └── constants.js           # Konfigurasi App & Path constants[cite: 1]
│   ├── controllers/               # Logika pemrosesan API
│   │   ├── pengumumanController.js[cite: 1]
│   │   ├── tugasController.js[cite: 1]
│   │   ├── mahasiswaController.js # Penanganan CRUD & Upload/Import Excel
│   │   ├── matkulController.js[cite: 1]
│   │   └── settingsController.js[cite: 1]
│   ├── models/                    # Mongoose Schemas (Matkul, Mahasiswa, Settings, dll.)[cite: 1]
│   ├── routes/                    # Endpoint REST API Express[cite: 1]
│   ├── services/                  # Layanan pihak ketiga & background job
│   │   ├── waService.js           # Koneksi Baileys WhatsApp Web[cite: 1]
│   │   └── schedulerService.js    # Cron job pengingat otomatis (<10m, Absen, Tugas)[cite: 1]
│   └── handlers/
│       └── messageHandler.js      # Parser & Responder pesan masuk WA[cite: 1]
│
└── frontend/                      # --- FRONTEND DASHBOARD ---
├── index.html                 # Halaman utama SPA Dashboard[cite: 1]
├── login.html                 # Halaman login[cite: 1]
├── css/                       # Stylesheet & Theme
│   ├── style.css[cite: 1]
│   └── adminlte.min.css[cite: 1]
├── js/                        # Client-side JavaScript
│   ├── app.js                 # Router & Event Handler utama[cite: 1]
│   ├── api.js                 # HTTP Client untuk komunikasi ke Backend API[cite: 1]
│   └── socket.js              # Realtime client listener (Socket.IO)[cite: 1]
└── assets/                    # Gambar, Logo, dan Icons[cite: 1]
---

## 8. Configuration File (Docker & Nginx)

### File `docker-compose.yml`

```yaml
services:
  app:
    build: .
    container_name: wa_bot_pjj
    restart: always
    ports:
      - "3002:3001"
    environment:
      - PORT=3001
      - BASE_PATH=/bot
      - MONGO_URI=mongodb://mongo:27017/helpdesk_bot
    volumes:
      - ./sessions:/app/sessions
    depends_on:
      - mongo

  mongo:
    image: mongo:6.0
    container_name: wa_bot_db
    restart: always
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```[cite: 1]

### Konfigurasi Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl;
    server_name cswa.latifdev.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /bot/ {
        proxy_pass http://127.0.0.1:3002/bot/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```[cite: 1]

---

## 9. Arahan Menjalankan Proyek

```bash
# 1. Masuk ke direktori proyek
cd "/mnt/datadisk/cloud server/bot"

# 2. Build dan jalankan container secara background
docker compose up -d --build

# 3. Cek log aplikasi & scan QR WhatsApp
docker compose logs -f app

# 4. Akses dashboard di http://localhost:3002/bot/ (Login: admin / admin123)

# 5. Hentikan atau restart container
docker compose restart
```[cite: 1]

---

## 📝 History Sistem & Changelog (Auto-Updated by AI)

*Setiap perubahan fitur atau perbaikan oleh AI akan secara otomatis dicatat pada bagian ini:*[cite: 1]

### v2.0.0-Docker (Init From Scratch) - 21 September 2026
- **[REBUILD]** Membangun ulang seluruh sistem dari 0 dengan arsitektur **Docker** dan **MongoDB 6.0**[cite: 1].
- **[CONFIG]** Penyesuaian path server ke `/mnt/datadisk/cloud server/bot` dan URL akses ke `https://cswa.latifdev.com/bot/`[cite: 1].
- **[STRUCTURE]** Pemisahan struktur direktori bersih antara `/frontend` dan `/backend`[cite: 1].
- **[FEAT]** Pengumuman berulang otomatis untuk borang **Google Forms Titip Absen**[cite: 1].
- **[FEAT]** Peringatan otomatis perkuliahan (< 10 menit sebelum kelas dimulai) bersama tautan **Google Meet**[cite: 1].
- **[FEAT]** Impor data mahasiswa secara massal menggunakan file Excel (`.xlsx` / `.csv`) mengikuti struktur header `nomor`, `nama`, `nim`, `wa`[cite: 1, 2].
- **[FEAT]** Pengiriman pesan secara langsung (*Direct Dispatch*) dari dashboard admin untuk Pengumuman, Tugas, dan Rangkuman[cite: 1].
- **[RULE]** Penambahan instruksi otomatisasi untuk AI agar selalu memperbarui file `SISTEM_PROYEK.md` secara mandiri setiap kali melakukan eksekusi fitur/perbaikan[cite: 1].

### v2.0.1-Docker (Build & Deploy Complete) - 21 September 2026
- **[FEAT]** Lengkapi seluruh struktur proyek: Docker, Backend (Express.js, Mongoose, Baileys), Frontend (SPA Dashboard)
- **[FEAT]** Backend: 8 Models (Matkul, Jadwal, Pengumuman, Tugas, Mahasiswa, Rangkuman, Settings, PengumumanLog)
- **[FEAT]** Backend: 7 Controllers + Dashboard stats dengan CRUD lengkap & Direct Dispatch
- **[FEAT]** Backend: WhatsApp Service (Baileys + Session Persistence) + SchedulerService (Cron Jobs)
- **[FEAT]** Backend: MessageHandler untuk perintah grup (halo, jadwal, tugas, pengumuman, matkul, status)
- **[FEAT]** Frontend: Login + SPA Dashboard dengan 8 menu (Dashboard, Matkul, Jadwal, Pengumuman, Tugas, Mahasiswa, Rangkuman, Settings)
- **[FEAT]** Frontend: Excel Import (.xlsx/.csv) untuk data Mahasiswa
- **[FEAT]** Frontend: Real-time WA Status & QR Code via Socket.IO
- **[FIX]** Docker build:gunakan node:20-slim + git/python3/g++ untuk native dependencies
- **[FIX]** Static file serving path untuk frontend di dalam container
- **[CONFIG]** Port mapping 3002:3001 (host:container) untuk menghindari konflik port

### v2.0.2-FixDashboard (Dashboard & Routing Fix) - 21 September 2026
- **[FIX]** Frontend Routing: Perbaiki `API_BASE` di `api.js` agar relative path `/api` konsisten dengan `BASE_PATH=/bot`
- **[FIX]** Frontend Socket.IO: Perbaiki path socket.io di `socket.js` dan backend `server.js` agar client library ter-serve dengan benar (`/bot/socket.io/socket.io.js`)
- **[FIX]** Backend Static Serving: Tambahkan route khusus untuk `socket.io.js` client library di `server.js`
- **[FIX]** SPA Fallback: Perbaiki catch-all route agar tidak mengeksekusi API routes (`/bot/api/*`) dan Socket.IO path (`/bot/socket.io/*`)
- **[FIX]** Sidebar Navigation: Pastikan `e.preventDefault()` pada event listener nav-item berfungsi tanpa error JS
- **[CONFIG]** Docker Compose: Konfirmasi `restart: always` pada kedua service (wa_bot_pjj, wa_bot_db) untuk auto-restart saat reboot
- **[CONFIG]** Systemd: Docker daemon sudah `enabled` untuk auto-start saat boot server
- **[FEAT]** Backend: Ekspos `global.io` dan `global.SOCKET_PATH` untuk akses socket.io dari service lain

### v2.0.3-FixSocketError (Socket.IO Client Fix) - 21 September 2026
- **[FIX]** Frontend `index.html`: Tambahkan tag `<script src="/bot/socket.io/socket.io.js"></script>` SEBELUM `js/socket.js`, `js/api.js`, dan `js/app.js` agar library `io` tersedia saat inisialisasi
- **[FIX]** Frontend `socket.js`: Tambahkan guard check `typeof io === 'undefined'` di `initSocket()` agar tidak crash jika library belum termuat
- **[FIX]** Frontend `app.js`: Bungkus `initSocket()` dan `loadPage()` dalam `try...catch` agar error Socket.IO tidak menghentikan rendering halaman dan navigasi sidebar
- **[FIX]** Frontend `app.js` `initNav()`: Tambahkan `try...catch` pada `loadPage()` di event listener navigasi menu
- **[VERIFY]** Endpoint `/bot/socket.io/socket.io.js` ter-serve dengan benar via Express route di `server.js`
- **[VERIFY]** Dashboard load, sidebar navigation, dan API calls berfungsi normal tanpa error console

### v2.0.4-SeedDataAndUIRefactor (Seed Data & UI Refactor) - 21 September 2026
- **[FEAT]** Backend Seeder: Buat `backend/config/seed.js` untuk seeding otomatis 7 Mata Kuliah & 9 Jadwal Kuliah saat container startup
- **[FEAT]** Seed Data Mata Kuliah (7): KALKULUS, FISIKA, DASAR PEMROGRAMAN, DASAR-DASAR KOMPUTASI, BAHASA INDONESIA, PENDIDIKAN AGAMA ISLAM, PENGANTAR TEKNOLOGI INFORMASI lengkap dengan Kode, SKS, Dosen, GMeet Link
- **[FEAT]** Seed Data Jadwal (9): Seluruh jadwal kuliah dengan hari, jam, Google Meet link, dan WA Group link (WAG) sesuai spesifikasi
- **[FEAT]** Server Integration: Panggil `seedData()` di `server.js` setelah `connectDB()` untuk auto-seed saat deploy
- **[FEAT]** Frontend UI Mata Kuliah: Tampilkan kolom Google Meet dengan link klik ke GMeet
- **[FEAT]** Frontend UI Jadwal Kuliah: Tambahkan kolom WA Group (WAG) dengan button klik ke WhatsApp Group, perbaiki GMeet button styling
- **[FIX]** QR Code Widget: Pindahkan QR Code WhatsApp HANYA ke menu Pengaturan (Settings), sembunyikan dari header/topbar di halaman lain
- **[FIX]** Settings Page: Tambahkan section "WhatsApp QR Code" dengan QR image real-time, status WA, dan auto-hide/show berdasarkan koneksi
- **[VERIFY]** Auto-seed berjalan saat container start: 7 matkul, 9 jadwal terbentuk otomatis
- **[VERIFY]** Dashboard stats menampilkan 7 Mata Kuliah, 9 Jadwal, jadwal hari ini (Senin: 2 matkul)
- **[VERIFY]** API endpoints `/api/matkul` dan `/api/jadwal` mengembalikan data lengkap dengan GMeet & WAG links

### v2.0.5-SeedMahasiswaData (Seed Mahasiswa Angkatan 2026) - 21 September 2026
- **[FEAT]** Backend Seeder Mahasiswa: Tambahkan 47 data mahasiswa angkatan 2026 ke `backend/config/seed.js` (dari file Excel Data mahasiswa pjj)
- **[FEAT]** Upsert Logic: Gunakan `findOneAndUpdate` dengan `upsert: true` berdasarkan NIM unik untuk handle duplikasi data
- **[FEAT]** Data Mahasiswa Lengkap: 47 record dengan field nomor, nama, NIM (A18.2026.xxxxx), WhatsApp - 42 NIM unik (5 duplikat diabaikan)
- **[FEAT]** Auto-seed on Startup: Mahasiswa seeder jalan otomatis setiap restart container (independen dari matkul/jadwal)
- **[VERIFY]** API `/api/mahasiswa` mengembalikan 42 record unik (5 duplikat NIM: Ikhwan Setiawan, Muhammad Khoirur Riza, MAURA AINUR SAKHI, Sahrul Tri Pamungkas, Jidan Bagas Al Bazzar)
- **[VERIFY]** Menu Mahasiswa di Dashboard Admin menampilkan seluruh data dengan benar

### v2.0.6-FixQRAndSchedulerEnhance (QR Code Fix & Scheduler Enhancement) - 21 September 2026
- **[FIX]** Backend `waService.js`: Perbaiki QR Code handling - konversi string QR Baileys ke base64 Data URL (PNG) menggunakan library `qrcode` sebelum kirim via Socket.IO ke frontend, menghilangkan dependency external API qrserver.com
- **[FIX]** Backend `waService.js`: Tambahkan fungsi `resetWA()` untuk logout dan regenerate QR Code saat sesi menggantung/terputus, diekspos via endpoint `POST /bot/api/settings/wa/reset`
- **[FEAT]** Frontend Settings: Tambah tombol **"Generate / Reset QR Code"** di menu Pengaturan untuk memudahkan admin reset sesi WA tanpa restart container
- **[FEAT]** Frontend `socket.js`: Update handler `qr` event untuk support base64 Data URL langsung dari backend (fallback ke external API jika diperlukan)
- **[FEAT]** Frontend Settings: Tambah section **"Pengaturan Jam Broadcast Reminder Tugas Otomatis"** (H-3, H-1, H-0) dengan input time picker terpisah masing-masing
- **[FEAT]** Frontend Settings: Tambah section **"Pengaturan Pengumuman Berulang (Titip Absen)"** dengan input Jam Kirim (HH:mm) dan Hari Ulang (checkbox/input koma)
- **[FEAT]** Frontend Pengumuman Form: Perbaiki UI form dengan section terpisah "Pengaturan Pengumuman Berulang (Otomatis)" berisi toggle recurring, jam jadwal, dan hari ulang
- **[FEAT]** Frontend Tugas Form: Perbaiki UI form dengan label lengkap "Judul Tugas", "Deskripsi Detail Tugas", "Tanggal & Jam Deadline", "Status Tugas"
- **[FEAT]** Backend `schedulerService.js`: Refactor cron job reminder tugas - pisah 3 job terpisak untuk H-3, H-1, H-0 masing-masing cek jam sesuai setting (`reminder_h3_time`, `reminder_h1_time`, `reminder_h0_time`) bukan hardcoded 08:00
- **[FEAT]** Backend Settings: Tambah endpoints `POST /settings/wa/reset` dan `POST /settings/wa/status` untuk manajemen sesi WA
- **[FEAT]** Dependency: Tambah library `qrcode` v1.5.4 di `package.json` untuk generate QR Code base64
- **[VERIFY]** QR Code WA muncul di menu Pengaturan sebagai base64 image, scan berhasil tanpa error
- **[VERIFY]** Tombol Reset QR Code berfungsi memutus sesi dan generate QR baru
- **[VERIFY]** Settings page menampilkan 4 section: Umum, WhatsApp QR Code, Jadwal Reminder Tugas, Jadwal Pengumuman Berulang
- **[VERIFY]** Form Pengumuman & Tugas UI improved dengan section terpisah dan label jelas

### v2.0.7-AddGroupTargetAndAutoFetch (Target Group & Auto-Fetch WhatsApp Groups) - 21 September 2026
- **[FEAT]** Backend Seeder: Tambah 3 grup target default ke `backend/config/seed.js` - "Perkuliahan (Info PJJ)", "admin judol", "test" (disimpan di settings `target_groups`)
- **[FEAT]** Backend `waService.js`: Tambah fungsi `getGroups()` untuk fetch daftar grup WhatsApp yang diikuti bot via `sock.groupFetchAllParticipating()` - return nama grup, JID, jumlah participant
- **[FEAT]** Backend API: Tambah endpoint `GET /bot/api/settings/wa/groups` untuk auto-fetch grup WhatsApp real-time dari akun bot yang terhubung
- **[FEAT]** Backend Routes: Tambah route `GET /settings/wa/groups` di `settingsRoutes.js` dan controller `getWAGroups` di `settingsController.js`
- **[FEAT]** Frontend Settings: Tambah section **"Target Grup Broadcast"** dengan:
  - Tombol **"Refresh Daftar Grup dari WhatsApp"** untuk auto-fetch grup dari WA terhubung
  - Daftar grup dalam format card dengan checkbox (nama grup, ID/JID, jumlah participant)
  - Tombol **"Simpan Target Grup"** untuk menyimpan grup terpilih ke settings `target_groups`
- **[FEAT]** Frontend Form Pengumuman/Tugas/Rangkuman: Ganti input manual "Target Group IDs" dengan **dropdown multi-select** yang mengambil data dari `window._targetGroups` (cached dari settings)
  - Support Ctrl+Click untuk multi-select grup
  - Placeholder text & helper text panduan
  - Sync real-time dengan data target grup yang disimpan
- **[FEAT]** Frontend Auto-load: Tambah fungsi `loadTargetGroups()` di DOMContentLoaded untuk pre-fetch target groups saat aplikasi dibuka
- **[FEAT]** Settings Page Integration: Update `loadSettings()` untuk fetch grup WhatsApp real-time via `GET /settings/wa/groups` saat halaman Settings dibuka
- **[VERIFY]** Target groups default (3 grup) ter-seed otomatis saat container startup
- **[VERIFY]** API `/settings/wa/groups` mengembalikan daftar grup WA (butuh WA terhubung)
- **[VERIFY]** Settings page menampilkan 5 section: Umum, WhatsApp QR Code, Target Grup Broadcast, Jadwal Reminder Tugas, Jadwal Pengumuman Berulang
- **[VERIFY]** Form Pengumuman/Tugas/Rangkuman menampilkan dropdown multi-select grup target

### v2.0.8-FixGroupMessagingAndPersistentAuth (Group Messaging Fix & Persistent WhatsApp Auth) - 21 September 2026
- **[FIX]** Backend `waService.js`: Perbaiki format JID grup - validasi & normalisasi ke format `@g.us` (contoh: `1203630123456789@g.us`) sebelum pengiriman pesan
- **[FIX]** Backend `waService.js`: Tambah fungsi `resolveGroupJID()` untuk mapping otomatis Nama Grup → JID asli WhatsApp via cache grup real-time (`groupFetchAllParticipating`)
- **[FIX]** Backend `waService.js`: Tambah `sendMessageWithRetry()` dengan retry logic (default 3x, exponential backoff) untuk menangani kegagalan jaringan sementara
- **[FEAT]** Backend `waService.js`: Tambah logging otomatis ke `pengumuman_log` collection via `sendMessageToGroups()` dengan parameter `pengumumanId` & `logType` (manual/schedule_kuliah/pengumuman_recurring/schedule_tugas)
- **[FIX]** Backend `waService.js`: Perbaiki `resetWA()` untuk logout bersih & regenerasi QR hanya saat diminta (tidak otomatis saat disconnect)
- **[FEAT]** Backend `waService.js`: Konfigurasi Baileys persistent session - `useMultiFileAuthState` di `/app/sessions/auth_info` dengan `shouldSyncHistoryMessage: false`, `markOnlineOnConnect: true`, `keepAliveIntervalMs: 10000`, `maxMsgRetryCount: 5`
- **[FEAT]** Backend `waService.js`: Auto-reconnect otomatis saat koneksi terputus (non-loggedOut) tanpa perlu scan QR ulang - sesi tersimpan di `/app/sessions` (persistent volume Docker)
- **[FEAT]** Backend `waService.js`: Event listener `groups.upsert` & `group-participants.update` untuk refresh cache grup real-time
- **[FIX]** Backend `schedulerService.js`: Update pemanggilan `sendMessageToGroups()` dengan parameter `logType` & `pengumumanId` untuk logging otomatis ke `pengumuman_log`
- **[FEAT]** Scheduler: Reminder Kuliah, Titip Absen, Reminder Tugas (H-3/H-1/H-0) sekarang logging status pengiriman per grup ke `pengumuman_log`
- **[VERIFY]** API Dispatch (Pengumuman, Tugas, Rangkuman) mengembalikan status pengiriman per grup dengan JID yang benar
- **[VERIFY]** Auto-reconnect berfungsi tanpa scan QR ulang saat container restart (sesi persist di `/app/sessions`)
- **[VERIFY]** Logging `pengumuman_log` mencatat status sent/failed per grup untuk audit trail

### v2.0.9-FixGroupDispatchAndIndividualTest (Group Dispatch Fix & Individual Test Dispatch) - 21 September 2026
- **[FIX]** Backend `waService.js`: Perbaiki validasi & normalisasi JID grup ke format `@g.us` & `@s.whatsapp.net` sebelum pengiriman
- **[FEAT]** Backend `waService.js`: Tambah fungsi `testGroupDispatch(groupInput, message)` untuk testing pengiriman pesan ke grup target via API `POST /bot/api/settings/wa/test-group` - support nama grup atau JID
- **[FEAT]** Backend `waService.js`: Tambah fungsi `testIndividualDispatch(message)` untuk testing pengiriman DM ke seluruh mahasiswa via API `POST /bot/api/settings/wa/test-individual`
- **[FEAT]** Backend `waService.js`: Tambah fungsi `formatPhoneToJID(phone)` konversi nomor WA lokal (08xxx) ke JID internasional (62xxx@s.whatsapp.net) untuk DM ke mahasiswa
- **[FEAT]** Backend `waService.js`: Tambah fungsi `resolveGroupJID()` mapping nama grup → JID @g.us via cache grup real-time
- **[FEAT]** Backend API: Tambah endpoint `POST /bot/api/settings/wa/test-group` & `POST /bot/api/settings/wa/test-individual` di `settingsRoutes.js` & `settingsController.js`
- **[FIX]** Backend `messageHandler.js`: Update menu bantuan respons perintah `help`, `bantuan`, `halo`, `hai`, `info`, `menu` dengan format resmi baru (Plaintext, daftar perintah lengkap, contoh penggunaan)
- **[FEAT]** Frontend Settings: Tambah section **"Uji Coba Pengiriman Bot"** dengan:
  - Form Input Pesan Uji Coba + Dropdown Target (Grup Target / Ke Semua Mahasiswa)
  - Multi-select grup target dengan Ctrl+Click
  - Tombol **"🧪 Kirim Pesan Uji Coba"** dengan tampilan hasil real-time (summary terkirim/gagal)
  - Info otomatis jumlah mahasiswa target untuk DM
- **[FEAT]** Frontend Auto-load: `loadTargetGroups()` update target grup cache di loadSettings()
- **[FEAT]** Frontend Helpers: `toggleTestTarget()` switch tampilan grup/individual, `runTestDispatch()` handle pengiriman & tampilkan hasil
- **[FEAT]** Backend Route Order Fix: Pindah route specific (`/wa/*`) sebelum `/:key` parameterized route di `settingsRoutes.js`
- **[VERIFY]** API `POST /settings/wa/test-group` & `/settings/wa/test-individual` berfungsi (return "WhatsApp belum terhubung" saat WA disconnected)
- **[VERIFY]** Menu bantuan bot responsif ke perintah `help`, `bantuan`, `halo`, `hai`, `info`, `menu` dengan format resmi
- **[VERIFY]** Settings page menampilkan 6 section: Umum, WhatsApp QR Code, Target Grup Broadcast, Jadwal Reminder Tugas, Jadwal Pengumuman Berulang, Uji Coba Pengiriman Bot

### v2.1.0-FixGroupDropdownAndRangkumanDispatch (Group Dropdown Fix & Broadcast Enhancement) - 21 September 2026
- **[FIX]** Frontend `app.js`: Perbaiki bug dropdown grup `undefined` pada Form Pengumuman, Tugas, Rangkuman - gunakan `getTargetGroupOptions()` helper yang memastikan label Nama Grup + JID dan value JID yang valid
- **[FIX]** Frontend `app.js`: Tambah fallback otomatis ke JID jika nama grup kosong, sehingga dropdown tidak pernah menampilkan `undefined`
- **[FEAT]** Frontend Settings: Sederhanakan tampilan Target Grup Broadcast - format `[Nama Grup] (JID: 120363...)` dengan checkbox, tombol **☑️ Pilih Semua** & **☐ Hapus Semua**, serta **Refresh Daftar Grup dari WhatsApp**
- **[FEAT]** Frontend Settings: Section "Uji Coba Pengiriman Bot" menggunakan `getTargetGroupOptions()` untuk konsistensi dropdown grup
- **[FEAT]** Frontend Auto-load: `loadTargetGroups()` memuat target groups & WA groups map saat aplikasi dibuka
- **[FIX]** Frontend `index.html`: Hapus QR Code liar di header/topbar, QR Code HANYA muncul di card WhatsApp QR Code di menu Pengaturan
- **[FIX]** Backend `pengumumanController.js`, `tugasController.js`, `rangkumanController.js`: Endpoint `/dispatch` menerima `target_group_ids` dari request body dengan fallback ke grup default (jadwal/settings) jika kosong
- **[FEAT]** Backend `waService.js`: `sendMessageToGroups()` support `logType` & `pengumumanId` untuk logging otomatis ke `pengumuman_log`
- **[FEAT]** Backend `waService.js`: Persistent session Baileys dengan `useMultiFileAuthState` di `/app/sessions/auth_info` + auto-reconnect tanpa scan QR ulang (1x scan selamanya)
- **[VERIFY]** Dropdown grup di form menampilkan Nama Grup + JID, value berupa JID valid `@g.us`
- **[VERIFY]** Broadcast (Pengumuman, Tugas, Rangkuman) mengirim ke JID grup yang benar dengan logging ke `pengumuman_log`
- **[VERIFY]** Sesi WA persistent di `/app/sessions` - 1x scan selamanya, auto-reconnect saat container restart

### v2.1.1-FixControllersDispatchMessage (Controllers Dispatch & Message Format Fix) - 21 September 2026
- **[FEAT]** Backend `pengumumanController.js`: Format pesan broadcast standar `📢 *${judul}*\n\n${isi}` sebelum kirim ke `sendMessageToGroups()`
- **[FEAT]** Backend `tugasController.js`: Format pesan broadcast standar `📝 *Tugas Baru*\n\n📚 Mata Kuliah: ...\n📌 Judul: ...\n📋 Deskripsi: ...\n⏰ Deadline: ...` sebelum kirim ke `sendMessageToGroups()`
- **[FEAT]** Backend `rangkumanController.js`: Format pesan broadcast standar `📋 *Rangkuman Materi*\n\n📚 Mata Kuliah: ...\n📌 Judul: ...\n\n${isi}\n\n📝 *Tugas Tambahan:* ...` sebelum kirim ke `sendMessageToGroups()`
- **[FIX]** Backend `waService.js` `sendMessageToGroups()`: Normalisasi parameter `targetGroupIds` - support Array of String JID, Single String JID, Nama Grup (auto-resolve via `resolveGroupJID()`), fallback otomatis ke `settings.target_groups` jika kosong
- **[FIX]** Frontend `app.js` `dispatchPengumuman()`, `dispatchTugas()`, `dispatchRangkuman()`: Ambil `target_group_ids` terpilih dari dropdown form (multi-select) dan kirim ke backend via request body
- **[FIX]** Frontend `app.js`: Tampilkan notifikasi toast real-time status pengiriman (berhasil/gagal + alasan) dari response backend
- **[FIX]** Backend `waService.js`: Perbaiki bug deklarasi variabel `groupIds` duplicate dengan rename ke `normalizedGroupIds`
- **[FEAT]** Backend `waService.js`: Fallback otomatis ke `settings.target_groups` dari database jika `targetGroupIds` kosong/undefined
- **[VERIFY]** API Dispatch (Pengumuman, Tugas, Rangkuman) mengembalikan status pengiriman per grup dengan JID yang benar
- **[VERIFY]** Frontend form dropdown grup menampilkan Nama Grup + JID, value berupa JID valid `@g.us`
- **[VERIFY]** Broadcast otomatis & manual mengirim ke JID grup yang benar dengan logging ke `pengumuman_log`

---

### v2.2.0-TwoWayAdminSyncAndGASDocs (Two-Way Admin Sync & Google Apps Script Integration) - 21 September 2026
- **[FEAT]** Backend `messageHandler.js`: Tambah perintah `/ringkasan [Matkul] | [Judul] | [Isi] | [Tugas Tambahan]` di grup admin judol untuk input rangkuman dua arah (WhatsApp → MongoDB → Google Docs)
- **[FEAT]** Backend `messageHandler.js`: Tambah perintah `/tugas [Matkul] | [Judul] | [Deskripsi] | [Deadline]` di grup admin judol untuk input tugas dua arah (WhatsApp → MongoDB)
- **[FEAT]** Backend `messageHandler.js`: Fungsi `isAdminGroup()` untuk deteksi grup admin judol dari settings `admin_group`
- **[FEAT]** Backend `messageHandler.js`: Tambah perintah `rangkuman` / `rangkuman [nama matkul]` di grup mahasiswa untuk melihat daftar rangkuman materi & Google Doc links
- **[FEAT]** Backend `messageHandler.js`: Update menu bantuan dengan perintah `rangkuman` dan contoh `rangkuman Bahasa Indonesia`
- **[FEAT]** Backend `services/gasService.js`: Modul integrasi Google Apps Script via Webhook HTTP POST ke URL GAS (diatur di env `GAS_WEBHOOK_URL` atau settings database)
- **[FEAT]** Backend `services/gasService.js`: Fungsi `callGASWebhook(data)` yang mengirim payload JSON ke GAS Web App
- **[FEAT]** File `google_apps_script.js`: Script Google Apps Script panduan untuk membuat Google Docs otomatis di Google Drive
- **[FEAT]** Backend `models/Rangkuman.js`: Tambah field `gdoc_link` (String, default '') untuk menyimpan URL Google Doc
- **[FEAT]** Backend `controllers/rangkumanController.js`: Format pesan broadcast ditambah `📄 *Google Doc:* ${gdoc_link}` jika gdoc_link tersedia
- **[FEAT]** Frontend `js/app.js`: Form Rangkuman tambah field input `gdoc_link` (Google Doc Link)
- **[FEAT]** Frontend `js/app.js`: Tabel Rangkuman tambah kolom "Google Doc" dengan tombol "Lihat Doc" link ke gdoc_link
- **[FIX]** Frontend `index.html`: Hapus QR Code container di header topbar, QR Code HANYA muncul di card WhatsApp QR Code menu Pengaturan
- **[FIX]** Backend `services/waService.js`: Update `keepAliveIntervalMs` ke 15000 (15 detik) untuk konektivitas lebih stabil
- **[FIX]** Backend `services/waService.js`: Auto-reconnect dengan delay 3-5 detik acak untuk hindari reconnect loop, tambah flag `reconnecting`
- **[FIX]** Backend `services/waService.js`: `resetWA()` hapus folder session files (`fs.rmSync`) saat user tekan tombol Reset QR Code agar scan ulang diperlukan
- **[CONFIG]** Backend `package.json`: Tambah dependency `axios` v1.7.0 untuk HTTP request ke GAS Webhook
- **[CONFIG]** Docker `docker-compose.yml`: Tambahkan environment variable `GAS_WEBHOOK_URL` untuk konfigurasi GAS Web App URL
- **[VERIFY]** Perintah `/ringkasan` di admin group berhasil simpan rangkuman ke MongoDB & trigger GAS webhook
- **[VERIFY]** Perintah `/tugas` di admin group berhasil simpan tugas ke MongoDB
- **[VERIFY]** Perintah `rangkuman` di grup mahasiswa menampilkan daftar rangkuman & Google Doc links
- **[VERIFY]** Broadcast Pengumuman/Tugas/Rangkuman menggunakan format template standar dengan fallback target grup
- **[VERIFY]** Sesi WhatsApp persistent: 1x scan selamanya, auto-reconnect tanpa scan ulang, reset hanya via tombol Reset QR Code
- **[VERIFY]** Google Apps Script template tersedia di file `google_apps_script.js`

---

### v2.2.1-FixFilterDescriptionAndAutoBroadcast (Rangkuman Filter, Tugas Deskripsi, Slash Commands & Auto-Broadcast) - 22 September 2026
- **[FIX]** Backend `messageHandler.js`: Perbaiki filter rangkuman mata kuliah - ketika `rangkuman [nama matkul]` ditemukan, tampilkan detail spesifik (Judul, Isi Rangkuman, Tugas Tambahan, Google Doc) alih-alih daftar umum
- **[FIX]** Backend `messageHandler.js`: Tambahkan field `deskripsi` pada template balasan tugas (`📋 Deskripsi: [DESKRIPSI TUGAS]`) sehingga informasi tugas lengkap ditampilkan ke grup
- **[FIX]** Backend `messageHandler.js`: Implementasi cleaning perintah slash `/` - `rawText.replace(/^\//, '').toLowerCase()` memastikan perintah `/jadwal`, `/tugas`, `/rangkuman`, `/help` diproses lancar
- **[FIX]** Backend `messageHandler.js`: Update regex admin commands (`/ringkasan`, `/tugas`) dengan `text.replace(/^\/?ringkasan\s+/, '')` dan `text.replace(/^\/?tugas\s+/, '')` agar konsisten dengan slash cleaning
- **[FIX]** Backend `messageHandler.js`: Update menu bantuan dengan contoh perintah dan catatan slash command support
- **[FEAT]** Backend `pengumumanController.js`: Auto-broadcast pengumuman ke grup WhatsApp target saat pembuatan baru via dashboard - `target_group_ids` dari request body langsung dikirim via `sendMessageToGroups()`
- **[FEAT]** Backend `tugasController.js`: Auto-broadcast tugas baru ke grup WhatsApp target saat pembuatan via dashboard - format pesan standar dengan Judul, Matkul, Deskripsi, dan Deadline
- **[FIX]** Frontend `js/app.js` `savePengumuman()`: Perbaiki handling multi-select `target_group_ids` menggunakan `fd.getAll('target_group_ids')` alih-alih `fd.get()` yang hanya mengambil nilai pertama
- **[FIX]** Frontend `js/app.js` `saveTugas()`: Tambahkan field `target_group_ids` menggunakan `fd.getAll('target_group_ids')` ke request body saat create/update tugas
- **[VERIFY]** Perintah `rangkuman Bahasa Indonesia` menampilkan detail rangkuman spesifik (Judul, Isi, Tugas Tambahan, Google Doc)
- **[VERIFY]** Perintah `tugas` menampilkan deskripsi tugas dalam format: Judul, Matkul, Deskripsi, Deadline
- **[VERIFY]** Perintah `/jadwal`, `/tugas`, `/rangkuman`, `/help` berfungsi dengan awalan slash
- **[VERIFY]** Auto-broadcast pengumuman & tugas ke grup WhatsApp target saat create via Dashboard Admin

---

### v2.2.2-FixPersistentWA_Scheduler_AndAdminSlashCommands (Persistent WA Session, Scheduler Fix, Admin Regex Parser) - 22 September 2026
- **[FIX]** Backend `waService.js`: Hapus filter `type !== 'notify'` pada event `messages.upsert` - bot sekarang memproses SEMUA pesan masuk (real-time & tertunda/offline) tanpa kecuali
- **[FIX]** Backend `waService.js`: Perbaiki auto-reconnect guard - gunakan flag `reconnecting` dengan `try/finally` untuk mencegah race condition saat reconnect loop, delay 5 detik stabil
- **[FIX]** Backend `waService.js`: Tambahkan logging `initWA` dengan path session untuk audit trail - JANGAN PERNAH hapus folder `/app/sessions` kecuali tombol Reset QR diklik
- **[FIX]** Backend `schedulerService.js`: Tambahkan fallback `target_groups` dari settings saat `jadwal.wa_group_link` kosong - reminder kuliah tetap terkirim meski jadwal tidak punya WA Group link
- **[FIX]** Backend `schedulerService.js`: Cron job reminder kuliah tetap `*/1 * * * *` (setiap menit) dengan offset waktu terkonfigurasi dari `reminder_offset_minutes` (default 10 menit)
- **[FIX]** Backend `messageHandler.js`: Ganti parser admin commands `/ringkasan` & `/tugas` dengan regex robust `rawText.match(/^\/?ringkasan\s+([^|]+)\|\s*([^|]+)\|\s*([^|]+)(?:\|\s*(.*))?/i)` - menggunakan `rawText` (case-preserved) alih-alih `text` (lowercased) untuk fleksibilitas parsing, dengan `trim()` otomatis pada setiap field
- **[FIX]** Backend `messageHandler.js`: Perintah `/ringkasan BAHASA INDONESIA | Pertemuan Ke-3 | Perkembangan bahasa...` sekarang diproses dengan benar - regex menangani kapitalisasi campuran & whitespace fleksibel
- **[FEAT]** Backend `rangkumanController.js`: Fungsi `create` sekarang memanggil `gasService.callGASWebhook()` otomatis untuk membuat Google Docs saat rangkuman baru dibuat dari Dashboard Admin, menyimpan `gdoc_link` ke MongoDB
- **[FIX]** Backend `rangkumanController.js`: Dispatch rangkuman menambahkan fallback ke `settings.target_groups` jika `target_group_ids` kosong & jadwal tidak punya `wa_group_link`
- **[FIX]** Frontend `js/app.js`: Perbaiki `saveRangkuman()` menggunakan `fd.getAll('target_group_ids')` untuk mengirim array target groups ke backend, toast message update: "Rangkuman tersimpan & Google Doc dibuat"
- **[VERIFY]** Pesan offline/tertunda saat server restart diproses otomatis tanpa perlu scan QR ulang
- **[VERIFY]** Sesi Baileys persisten di `/app/sessions/auth_info` - auto-reconnect dalam 5 detik saat disconnect
- **[VERIFY]** Reminder kuliah terkirim otomatis setiap menit ke grup target (jadwal.wa_group_link atau settings.target_groups)
- **[VERIFY]** Perintah `/ringkasan [Matkul] | [Judul] | [Isi] | [Tugas]` di admin group berfungsi dengan regex robust
- **[VERIFY]** Rangkuman baru dari Dashboard Admin otomatis membuat Google Doc via GAS Webhook

---

### v2.2.3-FixAdminCommandExecutionAndMatkulMatching (Universal Command Access, Fuzzy Matkul Match, Error Handling) - 22 September 2026
- **[FIX]** Backend `messageHandler.js`: Pindahkan perintah `/ringkasan` dan `/tugas` KE LUAR blok `isAdminGroup()` — perintah sekarang berfungsi dari SEMUA grup WhatsApp tanpa batasan validasi JID grup admin
- **[FIX]** Backend `messageHandler.js`: Ganti pencarian matkul exact match dengan fuzzy regex `new RegExp(escaped, 'i')` — input `BAHASA INDONESIA`, `bahasa indonesia`, `Bahasa Indonesia` semuanya cocok
- **[FIX]** Backend `messageHandler.js`: Escape regex special characters pada input matkul (`inputMatkul.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`) untuk menceh regex injection
- **[FIX]** Backend `messageHandler.js`: Tambahkan fallback auto-find matkul — jika nama matkul tidak ditemukan di database, gunakan matkul pertama (sorted by nama) sebagai pengganti agar proses simpan tetap berhasil
- **[FIX]** Backend `messageHandler.js`: Bungkus seluruh alur `/ringkasan` dan `/tugas` dalam blok `try...catch` terpisah — error dikirim langsung ke chat WhatsApp (`❌ Gagal menyimpan ringkasan/tugas: [error]`)
- **[FIX]** Backend `messageHandler.js`: Format balasan konfirmasi `/ringkasan` diupdate: `✅ Ringkasan Berhasil Disimpan!\n\n📚 Matkul: [Nama]\n📌 Judul: [Judul]\n📄 Google Doc: [Link]`
- **[FIX]** Backend `messageHandler.js`: Format balasan konfirmasi `/tugas` diupdate: `✅ Tugas Berhasil Disimpan!\n\n📚 Matkul: [Nama]\n📌 Judul: [Judul]\n📋 Deskripsi: [Deskripsi]\n⏰ Deadline: [Deadline]`
- **[FEAT]** Backend `messageHandler.js`: Emit Socket.IO event `rangkuman:created` dan `tugas:created` setelah berhasil simpan — dashboard admin web memperbarui tabel secara real-time
- **[FIX]** Backend `messageHandler.js`: Simpan warning fallback ke chat (`⚠️ Matkul "X" tidak ditemukan. Menggunakan fallback: Y`) agar admin tahu matkul yang digunakan
- **[VERIFY]** Perintah `/ringkasan BAHASA INDONESIA | Pertemuan 1 | Isi materi...` berfungsi dari grup manapun (admin maupun non-admin)
- **[VERIFY]** Perintah `/tugas MATKUL | Judul | Deskripsi | 2026-09-25 10:00` berfungsi dari grup manapun
- **[VERIFY]** Jika matkul tidak ditemukan, bot fallback ke matkul pertama dan tetap menyimpan data
- **[VERIFY]** Error DB/GAS ditampilkan langsung di chat WhatsApp, bukan silently logged

---

### v2.2.5-FixGASAsyncWait_And_SpecificSessionFilter (GAS Await, Pertemuan Filter, Date Display) - 22 September 2026
- **[FIX]** Backend `services/gasService.js`: Timeout HTTP POST ke GAS Webhook diubah ke `20000` ms (20 detik) — lebih realistis untuk Google Apps Script execution time
- **[FIX]** Backend `services/gasService.js`: Hapus blok `try/catch` wrapper internal — error langsung di-throw ke caller agar `messageHandler.js` dan `rangkumanController.js` bisa menangkap & menampilkan error ke user
- **[FIX]** Backend `services/gasService.js`: Validasi response GAS wajib memiliki `status === 'success'` DAN `gdoc_link` — error message lebih informatif jika link tidak valid
- **[FIX]** Backend `handlers/messageHandler.js` `/ringkasan`: Alur eksekusi diubah menjadi 4 step berurutan: (1) Simpan ke MongoDB, (2) WAJUB TUNGGU GAS webhook `await callGASWebhook()`, (3) Emit Socket.IO `rangkuman:created`, (4) Kirim balasan konfirmasi — HANYA SETELAH link terbentuk
- **[FIX]** Backend `handlers/messageHandler.js` `/ringkasan`: Format balasan konfirmasi: `✅ Ringkasan Berhasil Disimpan!\n\n📚 Matkul: ...\n📌 Judul: ...\n📅 Tanggal: DD MMMM YYYY\n📄 Google Doc: [Link]` — tidak ada lagi "sedang diproses"
- **[FEAT]** Backend `handlers/messageHandler.js` `/rangkuman`: Tambah parsing angka pertemuan di akhir perintah — `rangkuman bahasa indonesia 1` menampilkan rangkuman ke-1, `rangkuman bahasa indonesia 2` menampilkan rangkuman ke-2
- **[FEAT]** Backend `handlers/messageHandler.js` `/rangkuman`: Regex `rawQuery.match(/^(.+?)\s+(\d+)$/)` mengekstrak nama matkul dan nomor index dari perintah
- **[FEAT]** Backend `handlers/messageHandler.js` `/rangkuman`: Tampilan daftar pertemuan dengan format: `1. *Judul* (📅 DD MMMM YYYY)` — setiap item dilengkapi tanggal createdAt
- **[FEAT]** Backend `handlers/messageHandler.js` `/rangkuman`: Detail rangkuman spesifik: `📑 Detail Rangkuman Materi` dengan 📚 Matkul, 📌 Judul, 📅 Tanggal, 📝 Isi, 📝 Tugas Tambahan, 📄 Google Doc
- **[FIX]** Backend `handlers/messageHandler.js` `/rangkuman`: Jika pertemuan index melebihi jumlah rangkuman, tampilkan error: `❌ Rangkuman ke-X tidak ditemukan. Hanya ada Y rangkuman.`
- **[FIX]** Backend `controllers/rangkumanController.js`: Fungsi `create` secara eksplisit menunggu GAS webhook sebelum mengirim response HTTP — frontend mendapat data dengan `gdoc_link` sudah terisi
- **[FIX]** Backend `controllers/rangkumanController.js`: Emit Socket.IO `rangkuman:created` dilakukan SETELAH `gdoc_link` disimpan, sehingga dashboard real-time menampilkan link langsung
- **[VERIFY]** Perintah `/ringkasan MATKUL | Judul | Isi | Tugas` menunggu GAS selesai, balasan berisi Google Doc link asli
- **[VERIFY]** Perintah `rangkuman bahasa indonesia` menampilkan daftar pertemuan dengan tanggal
- **[VERIFY]** Perintah `rangkuman bahasa indonesia 1` menampilkan detail rangkuman pertama dengan tanggal
- **[VERIFY]** Rangkuman dari Dashboard Admin menampilkan Google Doc link real-time di tabel

---

### v2.2.6-FixGASFallbackURL_And_StrictSessionLock (GAS Fallback URL, Redirect Handling, Session Lock) - 22 September 2026
- **[FIX]** Backend `services/gasService.js`: Tambahkan fallback hardcoded URL `https://script.google.com/macros/s/AKfycbxsX-umBdeX2zEhioLAFR1yg8Vnsyo4XUj6JfLRyAMxof4nkVyYJcg-k9DqYVFLs2jg/exec` — jika `process.env.GAS_WEBHOOK_URL` dan `Settings.gas_webhook_url` keduanya kosong, gunakan URL default ini
- **[FIX]** Backend `services/gasService.js`: Urutan prioritas URL: (1) `process.env.GAS_WEBHOOK_URL`, (2) `Settings.findOne({key:'gas_webhook_url'})`, (3) Hardcoded fallback URL
- **[FIX]** Backend `services/gasService.js`: Tambahkan `maxRedirects: 5` pada axios.post untuk menangani redirect 302 Google Apps Script
- **[FIX]** Backend `services/gasService.js`: Deteksi redirect response string — ekstrak URL Google Docs dari HTML redirect response dengan regex `https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+`
- **[FIX]** Backend `services/gasService.js`: Ekstraksi gdoc_link fleksibel — terima dari `response.data.gdoc_link` atau dari redirect string response
- **[FIX]** Backend `services/waService.js`: Tambahkan guard flag `DANGER_DELETE_SESSION = false` sebagai penguncian folder sesi — `resetWA()` hanya menghapus folder sesi jika flag diubah secara eksplisit
- **[FIX]** Backend `services/waService.js`: `resetWA()` menambahkan log explicitly: "Reset requested via dashboard — clearing session files" — JANGAN dipanggil otomatis saat disconnect/restart
- **[FIX]** Backend `services/waService.js`: `connection === 'close'` handler — tidak pernah menghapus folder sesi, hanya reconnect dengan delay 5 detik, log: "session preserved"
- **[FIX]** Backend `services/waService.js`: `connection === 'close'` loggedOut handler — biarkan Baileys handle cleanup folder sesi, bot tidak ikut menghapus
- **[VERIFY]** Perintah `/ringkasan` sekarang mendapatkan Google Doc link dari GAS (termasuk fallback URL jika URL utama tidak terkonfigurasi)
- **[VERIFY]** Container restart/rebuild TIDAK menghapus sesi WhatsApp — bot auto-reconnect tanpa scan QR ulang
- **[VERIFY]** Hanya tombol "Reset QR Code" di Dashboard yang dapat menghapus sesi WhatsApp

---

### v2.2.8-FixFilterGDocDisplayAndIndexMatching (Google Doc Always Shown, Ascending Sort, Standardized Template) - 22 September 2026
- **[FIX]** Backend `handlers/messageHandler.js`: Perintah `rangkuman [matkul] [nomor]` sekarang selalu menampilkan baris `📄 Google Doc:` — jika `gdoc_link` kosong/undefined, tampilkan fallback `Tidak tersedia`
- **[FIX]** Backend `handlers/messageHandler.js`: Urutan sort query diubah dari `createdAt: -1` (descending) ke `createdAt: 1` (ascending) — index 1 = rangkuman paling awal (pertemuan pertama), index 2 = pertemuan kedua, dst.
- **[FIX]** Backend `handlers/messageHandler.js`: Limit query dinaikkan dari 20 ke 50 untuk menangani lebih banyak rangkuman per matkul
- **[FIX]** Backend `handlers/messageHandler.js`: Helper function `formatDetail()` dibuat untuk konsistensi template — semua panggilan detail rangkuman menggunakan format yang sama
- **[FIX]** Backend `handlers/messageHandler.js`: Format template detail rangkuman standar: `📄 *Detail Rangkuman Materi*` (bukan `📑`), dengan urutan: 📚 Matkul → 📌 Judul → 📅 Tanggal → 📝 Isi → 📝 Tugas Tambahan → 📄 Google Doc (selalu ada)
- **[FIX]** Backend `handlers/messageHandler.js`: Jika angka index melebihi jumlah rangkuman, pesan error: `❌ Rangkuman ke-${nomor} tidak ditemukan. Mata kuliah ini baru memiliki ${count} rangkuman.`
- **[FIX]** Backend `handlers/messageHandler.js`: Default list (tanpa filter matkul) juga menampilkan `📄 Google Doc:` untuk setiap item
- **[VERIFY]** `rangkuman bahasa indonesia 1` menampilkan rangkuman paling awal (pertemuan pertama)
- **[VERIFY]** `rangkuman bahasa indonesia 4` pada matkul yang hanya punya 3 rangkuman menampilkan error yang jelas
- **[VERIFY]** Setiap detail rangkuman selalu menampilkan link Google Doc atau "Tidak tersedia"

---

### v2.2.9-FixWASessionShutdown_TruncateSummary_AndAutoDeleteGDoc (Graceful WA Shutdown, Truncate Isi, Auto-Delete GDoc) - 22 September 2026
- **[FEAT]** Backend `services/waService.js`: Tambah fungsi `closeWA()` untuk menutup WebSocket Baileys secara bersih (`sock.end(undefined)`) TANPA menghapus folder `/app/sessions/auth_info`
- **[FEAT]** Backend `server.js`: Tangkap sinyal `SIGTERM` dan `SIGINT` sebelum container berhenti — panggil `await closeWA()` untuk graceful shutdown, session files tetap preserved
- **[FIX]** Backend `server.js`: Import `closeWA` dari `waService` dan expose ke graceful shutdown handler
- **[FIX]** Backend `handlers/messageHandler.js`: Batasi panjang string Isi Rangkuman maksimal 150 karakter di chat WhatsApp — jika lebih, potong dan tambahkan `... (baca selengkapnya di Google Doc)`
- **[FIX]** Backend `handlers/messageHandler.js`: Teks lengkap tetap tersimpan utuh di MongoDB dan Google Doc — hanya tampilan chat yang dipotong
- **[FEAT]** Backend `services/gasService.js`: Tambah fungsi `deleteGASDocument(gdoc_link)` yang mengirim HTTP POST ke GAS Webhook dengan payload `{ action: 'delete', gdoc_link }` untuk menghapus file Google Doc di Google Drive
- **[FIX]** Backend `controllers/rangkumanController.js`: Fungsi `remove` sekarang mengecek `gdoc_link` sebelum hapus — jika ada, panggil `await deleteGASDocument()` untuk menghapus Google Doc terkait dari Google Drive
- **[FIX]** Backend `controllers/rangkumanController.js`: Emit Socket.IO `rangkuman:deleted` setelah penghapusan untuk real-time dashboard update
- **[VERIFY]** Container restart/rebuild via `docker stop`/`docker compose down` TIDAK menghapus sesi WhatsApp — graceful shutdown menutup koneksi bersih
- **[VERIFY]** `rangkuman bahasa indonesia 1` menampilkan isi ringkas maks 150 karakter + fallback Google Doc
- **[VERIFY]** Hapus rangkuman dari Dashboard menghapus file Google Doc terkait di Google Drive

---

### v2.3.0-AddTitipAbsenFormAndDockerGracefulLock (Titip Absen Auto-Broadcast, Docker Graceful Shutdown) - 22 September 2026
- **[FEAT]** Backend `config/seed.js`: Seed pengumuman berulang "Pesan Otomatis Titip Absen" dengan `schedule_time: '21:00'`, `is_recurring: true`, `repeat_days: setiap hari`, `is_active: true` — pesan otomatis terkirim ke grup target setiap jam 21:00
- **[FEAT]** Backend `config/seed.js`: Isi pengumuman titip absen: `📢 *PENGINGAT TITIP ABSEN PERKULIAHAN*\n\nBagi mahasiswa yang ingin melakukan titip absen, silakan isi borang pada tautan berikut:\n🔗 [Google Forms Link]\n\nMohon diisi dengan data yang benar.`
- **[FEAT]** Backend `config/seed.js`: Seed `Settings` dengan key `link_titip_absen` dan value link Google Forms — dapat diubah kapan saja dari menu Pengaturan di Dashboard Admin Web
- **[FEAT]** Backend `config/seed.js`: Pengumuman titip absen hanya di-seed jika belum ada (cek `findOne({judul})` prevent duplikasi)
- **[CONFIG]** `docker-compose.yml`: Tambahkan `stop_grace_period: 30s` pada service `app` — container memberi waktu 30 detik bagi Baileys untuk menyimpan file sesi secara sempurna ke `/app/sessions/auth_info` sebelum container mati
- **[VERIFY]** Pengumuman Titip Absen otomatis dikirim setiap jam 21:00 ke seluruh grup target via schedulerService cron job
- **[VERIFY]** Link Google Forms Titip Absen dapat diubah dari Dashboard Admin → Pengaturan → `link_titip_absen`
- **[VERIFY]** `docker compose down` / `docker stop` memberikan waktu 30 detik untuk graceful shutdown — sesi WhatsApp tetap preserved

---

### v2.3.1-AutoBroadcastOnSave_And_PersistentSessionFix (Auto-Broadcast on Save, Titip Absen Settings, Session Lock) - 22 September 2026
- **[FEAT]** Backend `controllers/pengumumanController.js`: Fungsi `update` sekarang auto-broadcast pengumuman ke grup WA target jika `target_group_ids` ada di request body — format: `📢 *${judul}*\n\n${isi}`
- **[FEAT]** Backend `controllers/tugasController.js`: Fungsi `update` sekarang auto-broadcast tugas ke grup WA target — format: `📝 *Tugas Diperbarui*` dengan Matkul, Judul, Deskripsi, Deadline
- **[FEAT]** Backend `controllers/rangkumanController.js`: Fungsi `create` sekarang auto-broadcast rangkuman ke grup WA target SETELAH GAS webhook selesai — format: `📋 *Rangkuman Materi*` dengan isi ringkas (maks 200 char) + Google Doc link
- **[FEAT]** Backend `controllers/rangkumanController.js`: Fungsi `update` sekarang auto-broadcast rangkuman ke grup WA target — format: `📋 *Rangkuman Diperbarui*`
- **[FEAT]** Frontend `js/app.js`: Tambah field input `link_titip_absen` di menu Pengaturan Umum — admin dapat mengubah link Google Forms Titip Absen langsung dari dashboard
- **[FIX]** Frontend `js/app.js` `saveSettings()`: Tambah field `link_titip_absen` ke array fields yang disimpan ke database
- **[FIX]** Frontend `js/app.js`: Toast messages diupdate untuk semua form:
  - Pengumuman: `Pengumuman tersimpan & otomatis dikirim ke grup WA!`
  - Tugas: `Tugas tersimpan & otomatis dikirim ke grup WA!`
  - Rangkuman: `Rangkuman tersimpan, Google Doc dibuat & otomatis dikirim ke grup WA!`
- **[VERIFY]** Simpan Pengumuman dari Dashboard → otomatis broadcast ke grup WA target
- **[VERIFY]** Simpan Tugas dari Dashboard → otomatis broadcast ke grup WA target
- **[VERIFY]** Simpan Rangkuman dari Dashboard → GAS Webhook buat Google Doc → otomatis broadcast ke grup WA target
- **[VERIFY]** Update data di Dashboard → otomatis broadcast perubahan ke grup WA target
- **[VERIFY]** Field `link_titip_absen` dapat diubah dari Dashboard Admin → Pengaturan

---

### v2.3.2-UpdateMahasiswaDataSeed (Update 39 Data Mahasiswa Angkatan 2026) - 22 September 2026
- **[CHANGE]** Backend `config/seed.js`: Perbarui array `dataMahasiswa` dengan 39 data mahasiswa terbaru dari berkas `data pjj.xlsx` — bersih tanpa duplikasi NIM
- **[CHANGE]** Data mahasiswa di-upsert berdasarkan NIM unik via `findOneAndUpdate({ nim })` dengan `upsert: true`
- **[VERIFY]** Seeder menjalankan upsert 39 record mahasiswa saat container startup
- **[VERIFY]** Data lama yang tidak ada di list baru tetap tersimpan (upsert hanya menambah/update, tidak menghapus)

---

### v2.3.3-ResetMahasiswaDB_And_AuthSyncLock (Reset Total Mahasiswa, Auth Disk Sync, Graceful 45s) - 22 September 2026
- **[FIX]** Backend `config/seed.js`: Ganti strategi seed mahasiswa dari upsert menjadi `Mahasiswa.deleteMany({})` + `Mahasiswa.insertMany(dataMahasiswa)` — reset total 40 data presisi tanpa data lama tertinggal
- **[CHANGE]** Backend `config/seed.js`: Data mahasiswa diurutkan 1–40 sesuai file `data pjj.xlsx` dengan 40 record bersih (termasuk 2 Mohammad Nurkholis Majid di nomor 27 & 38)
- **[FIX]** Backend `services/waService.js`: Bungkus `sock.ev.on('creds.update')` dengan async/await wrapper — `await saveCreds()` dipastikan selesai menulis ke disk sebelum event berikutnya diproses, mencegah file sesi rusak saat container mati mendadak
- **[FIX]** `docker-compose.yml`: Naikkan `stop_grace_period` dari `30s` ke `45s` — memberi waktu lebih panjang bagi Baileys untuk menyimpan kredensial secara sempurna ke `/app/sessions/auth_info` sebelum container dihentikan
- **[VERIFY]** Seeder menjalankan `deleteMany({})` lalu `insertMany` 40 record — database bersih sesuai urutan xlsx
- **[VERIFY]** `creds.update` dieksekusi dengan await — file sesi ter-write ke disk sebelum proses berikutnya
- **[VERIFY]** `docker stop` memberikan waktu 45 detik untuk graceful shutdown

---

### v2.3.5-FixRangkumanFlowAndTitleFilter (Title-First Search, Index Fallback, Clear Error Messages) - 22 September 2026
- **[FIX]** Backend `handlers/messageHandler.js`: Alur `/ringkasan` — teks `isi` dan `tugas_tambahan` tersimpan 100% utuh ke MongoDB dan dikirimkan ke GAS tanpa pemotongan/truncation
- **[FIX]** Backend `handlers/messageHandler.js`: Google Doc yang terbentuk berisi teks lengkap 100% — tidak ada truncation di sisi backend
- **[FIX]** Backend `handlers/messageHandler.js`: Tampilan chat ringkas — `formatDetail()` memotong `isi` maks 150 karakter + indikator `... (baca selengkapnya di Google Doc)`
- **[FIX]** Backend `handlers/messageHandler.js`: Baris `📄 Google Doc:` wajib selalu muncul di setiap detail rangkuman
- **[FIX]** Backend `handlers/messageHandler.js`: Rangkuman search alur baru: (1) Cek judul mengandung query → jika cocok, langsung tampilkan detail, (2) Fallback index array 1-based → tampilkan rangkuman ke-N, (3) Jika tidak cocok → pesan error jelas: `❌ Rangkuman "X" tidak ditemukan untuk mata kuliah Y`
- **[FIX]** Backend `handlers/messageHandler.js`: Handle query murni angka (misal: `rangkuman 10`) — parsing sebagai `pertemuanIndex` tanpa matkul query
- **[FIX]** Backend `handlers/messageHandler.js`: Title match menggunakan `r.judul.toLowerCase().includes(searchQuery.toLowerCase())` — misal: query "10" cocok dengan judul "Pertemuan Ke-10"
- **[FIX]** Backend `handlers/messageHandler.js`: Error message informatif: `❌ Rangkuman "X" tidak ditemukan untuk mata kuliah Y. Mata kuliah ini baru memiliki N rangkuman.`
- **[VERIFY]** `/ringkasan BAHASA INDONESIA | Pertemuan 1 | Isi lengkap... | Tugas` — isi tersimpan utuh ke MongoDB & GAS
- **[VERIFY]** `rangkuman bahasa indonesia 10` — jika judul "Pertemuan Ke-10" ada, langsung tampilkan detail
- **[VERIFY]** `rangkuman bahasa indonesia 4` pada matkul dengan 3 rangkuman — tampilkan error jelas

---

### v2.3.6-FixRingkasanPipeParserForMarkdownTables (Pipe-Safe Parser, Markdown Table Support) - 22 September 2026
- **[FIX]** Backend `handlers/messageHandler.js`: Ganti regex `/ringkasan [^|]+|[^|]+|[^|]+(?:|.*)?/` dengan smart pipe-aware split — `allParts.slice(2, -1).join('|')` mengambil seluruh teks isi dari | kedua sampai | terakhir sebagai satu blok utuh
- **[FIX]** Backend `handlers/messageHandler.js`: Karakter `|` di dalam tabel markdown pada isi rangkuman TIDAK lagi memotong teks — isi tersimpan utuh 100% ke MongoDB dan GAS
- **[FIX]** Backend `handlers/messageHandler.js`: Logika pembagian blok: `allParts.length > 3` → ada tugas_tambahan, `allParts.length === 3` → hanya matkul+judul+isi
- **[FIX]** Backend `handlers/messageHandler.js`: Format error jika kurang dari 3 pemisah: `❌ Format: /ringkasan [Matkul] | [Judul] | [Isi Rangkuman] | [Tugas Tambahan]`
- **[FIX]** Backend `services/gasService.js`: Seluruh teks isi hasil ekstraksi dikirim utuh 100% ke GAS Webhook tanpa truncation
- **[VERIFY]** `/ringkasan BAHASA INDONESIA | Pertemuan 3 | Isi dengan tabel | Kolom A | Kolom B | Tugas` — isi lengkap dengan semua `|` tersimpan utuh
- **[VERIFY]** Google Doc yang terbentuk berisi seluruh materi termasuk tabel markdown tanpa terpotong

---

### v2.4.0-FixSchedulerTimeFormatAMPM (AM/PM Time Normalization, Scheduler Robustness) - 22 September 2026
- **[FEAT]** Backend `services/schedulerService.js`: Tambah fungsi helper `normalizeTo24Hour(timeStr)` — mengubah format AM/PM (`"09:00 PM"` → `"21:00"`) menjadi format 24-jam standar `"HH:mm"`
- **[FIX]** Backend `services/schedulerService.js`: Pengumuman berulang cron job — `schedule_time` dinormalisasi via `normalizeTo24Hour()` sebelum dicocokkan dengan waktu server
- **[FIX]** Backend `services/schedulerService.js`: Reminder tugas H-3/H-1/H-0 — setting `reminder_hX_time` dinormalisasi via `normalizeTo24Hour()` sebelum dicocokkan
- **[FIX]** Backend `services/schedulerService.js`: Format input yang didukung: `"21:00"`, `"9:00 PM"`, `"09:00PM"`, `"9:00 AM"`, `"09:00 AM"` — semua dinormalisasi ke `"21:00"` / `"09:00"`
- **[VERIFY]** Schedule time `"09:00 PM"` di database → cron job mencocokkan dengan `"21:00"` server time
- **[VERIFY]** Tombol "Kirim ke Grup" di Dashboard Admin tetap berfungsi untuk manual dispatch kapan saja

---

### v2.5.0-MultiDatabaseGoogleSheetsSync (Google Sheets Webhook Sync & Dashboard UI) - 22 September 2026
- **[FEAT]** Backend `controllers/syncController.js`: Buat 4 endpoint POST webhook sync dari Google Sheets:
  - `POST /bot/api/sync/mahasiswa` — terima array data mahasiswa, bersihkan duplikasi NIM, urutkan ascending berdasarkan 5 digit belakang NIM, reset collection Mahasiswa, emit Socket.IO `mahasiswa:updated`
  - `POST /bot/api/sync/pengumuman` — terima array pengumuman, upsert/update collection Pengumuman berdasarkan judul, emit Socket.IO `pengumuman:updated`
  - `POST /bot/api/sync/tugas` — terima array tugas, cocokkan ID Matkul berdasarkan nama matkul (fuzzy regex), upsert/update collection Tugas, emit Socket.IO `tugas:updated`
  - `POST /bot/api/sync/rangkuman` — terima array rangkuman, cocokkan ID Matkul berdasarkan nama matkul, upsert/update collection Rangkuman, emit Socket.IO `rangkuman:updated`
- **[FEAT]** Backend `routes/syncRoutes.js`: Route file untuk 4 endpoint sync
- **[FEAT]** Backend `server.js`: Register sync routes `${BASE_PATH}/api/sync`
- **[FEAT]** Frontend `js/app.js`: Section "Google Sheets Webhook Endpoints" di menu Pengaturan dengan:
  - **Section 1**: Data Mahasiswa PJJ — input read-only webhook URL + tombol Copy
  - **Section 2**: Arsip Bot — base URL + list endpoint aktif (pengumuman, tugas, rangkuman) dengan status "Active"
- **[FEAT]** Frontend `js/app.js`: Fungsi `copyWebhook()` dan `copyText()` untuk copy URL ke clipboard
- **[VERIFY]** `POST /bot/api/sync/mahasiswa` dengan payload `[{nomor, nama, nim, wa}]` berhasil reset & insert data
- **[VERIFY]** `POST /bot/api/sync/tugas` dengan payload `[{matkul, judul, deskripsi, deadline}]` berhasil cocokkan matkul & insert
- **[VERIFY]** Dashboard Settings menampilkan webhook URLs dengan tombol copy

---

### v2.5.4-UIFormAndSyncHandlerHarmonization (Form UI Update, Socket.IO Real-Time Sync Binding) - 22 September 2026
- **[FIX]** Frontend `js/app.js` `showFormMahasiswa()`: Form Tambah/Edit Mahasiswa diperbarui — field: Nama Lengkap, NIM (dengan `pattern="A\\d{2}\\.\\d{4}\\.\\d{5}"`), Nomor WhatsApp — field Nomor dihapus (auto-generated)
- **[FIX]** Frontend `js/app.js` `saveMahasiswa()`: Tambah validasi NIM regex `A18.2026.xxxxx` sebelum submit — tampilkan error toast jika format salah
- **[FIX]** Frontend `js/app.js` `saveMahasiswa()`: Re-index otomatis setelah save — fetch semua data, sort by NIM suffix, update nomor 1-N via API
- **[FIX]** Frontend `js/app.js`: Form Pengumuman — field: Judul, Isi Pengumuman, Target Grup (multi-select), Berulang, Jam Kirim, Hari Ulang, Status Aktif ✅
- **[FIX]** Frontend `js/app.js`: Form Tugas — field: Mata Kuliah (dropdown), Judul Tugas, Deskripsi, Deadline (datetime-local), Status, Target Grup ✅
- **[FIX]** Frontend `js/app.js`: Form Rangkuman — field: Mata Kuliah (dropdown), Judul, Isi Rangkuman, Tugas Tambahan, Google Doc Link, Target Grup ✅
- **[FEAT]** Frontend `js/socket.js`: Tambah Socket.IO event listeners untuk sync events — `mahasiswa:updated`, `pengumuman:updated`, `tugas:updated`, `rangkuman:updated`, `rangkuman:created`, `tugas:created` — auto-refresh tabel saat halaman terkait aktif
- **[FEAT]** Frontend `js/socket.js`: Toast notification otomatis saat sync terjadi: "Data [X] diperbarui dari sync"
- **[VERIFY]** Form Mahasiswa: NIM validasi `A18.2026.00230` → submit berhasil, `agus` → error toast
- **[VERIFY]** POST webhook sync → Socket.IO emit → tabel auto-refresh tanpa browser reload

---

### v2.5.5-FixTimezoneAndSchedulerWIB (Asia/Jakarta Timezone, Precision Scheduler) - 22 September 2026
- **[CONFIG]** `docker-compose.yml`: Tambah variabel lingkungan `TZ=Asia/Jakarta` pada service app — memastikan semua operasi waktu berjalan di zona waktu Indonesia Barat (WIB)
- **[FIX]** Backend `handlers/messageHandler.js`: Tambah helper `getJakartaNow()` — `new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))` untuk mendapatkan waktu WIB
- **[FIX]** Backend `handlers/messageHandler.js`: Perintah `jadwal` dan `jadwal [hari]` menggunakan `getJakartaNow()` untuk penentuan hari — `HARI_MAP[nowJkt.getDay()]` alih-alih `HARI_MAP[new Date().getDay()]`
- **[FIX]** Backend `services/schedulerService.js`: Tambah helper `getJakartaNow()` yang sama — digunakan di SEMUA cron job
- **[FIX]** Backend `services/schedulerService.js`: Reminder kuliah (`jobReminderKuliah`) menggunakan waktu Jakarta untuk penentuan hari dan jam
- **[FIX]** Backend `services/schedulerService.js`: Pengumuman berulang (`jobTitipAbsen`) menggunakan waktu Jakarta untuk pencocokan `schedule_time` — `normalizeTo24Hour(p.schedule_time) === currentHHMM`
- **[FIX]** Backend `services/schedulerService.js`: Reminder tugas (`runTaskReminder`) menggunakan waktu Jakarta untuk pencocokan jam setting
- **[VERIFY]** Cron job `*/1 * * * *` mengecek waktu WIB setiap menit — reminder kuliah terkirim < 10 menit sebelum jam kuliah
- **[VERIFY]** Pengumuman Titip Absen dengan `schedule_time: '21:00'` otomatis terkirim setiap jam 21:00 WIB ke seluruh grup target

---

### v2.5.6-FixArsibSyncAndRangkumanAddBtn (Button Fix, Socket.IO Sync Verified) - 22 September 2026
- **[FIX]** Frontend `js/app.js` `loadRangkuman()`: Tombol "+ Tambah" menggunakan `onclick="showFormRangkuman(null, window._matkuls)"` alih-alih inline `JSON.stringify(matkuls)` — menghindari error JS dari escaping JSON yang rusak di HTML attribute
- **[FIX]** Frontend `js/app.js` `loadJadwal()`: Tombol "+ Tambah" Jadwal juga diperbaiki menggunakan `window._matkuls`
- **[FIX]** Frontend `js/app.js` `loadTugas()`: Tombol "+ Tambah" Tugas juga diperbaiki menggunakan `window._matkuls`
- **[VERIFY]** Socket.IO sync events: `pengumuman:updated`, `tugas:updated`, `rangkuman:updated` ter-emit oleh `syncController.js` saat POST webhook diterima
- **[VERIFY]** Frontend `socket.js`: Handler listener event sync memicu `loadPengumuman()`, `loadTugas()`, `loadRangkuman()` pada halaman aktif + toast notification
- **[VERIFY]** Tombol "+ Tambah" pada view Rangkuman/Jadwal/Tugas membuka modal form tanpa error JS

---

### v2.6.0-FullTwoWaySyncImplementation (Two-Way Sync Dashboard ↔ Google Sheets) - 22 September 2026
- **[FEAT]** Backend `services/gasSyncService.js`: Service sinkronisasi balik ke Google Sheets — kirim HTTP POST ke GAS Web App saat ada aksi UPDATE/DELETE dari Dashboard
- **[FEAT]** Backend `services/gasSyncService.js`: Payload berformat `{ action, sheet_type, identifier, data }` — support 4 sheet type: mahasiswa (identifier: NIM), pengumuman (judul), tugas (judul), rangkuman (judul)
- **[FEAT]** Backend `services/gasSyncService.js`: URL GAS diambil dari `process.env.GAS_SYNC_URL` → `Settings.gas_sync_url` → fallback hardcoded
- **[FEAT]** Backend `controllers/mahasiswaController.js`: `update` dan `remove` memanggil `syncMahasiswaUpdate()` / `syncMahasiswaDelete()` secara async non-blocking
- **[FEAT]** Backend `controllers/pengumumanController.js`: `update` dan `remove` memanggil `syncPengumumanUpdate()` / `syncPengumumanDelete()` secara async non-blocking
- **[FEAT]** Backend `controllers/tugasController.js`: `update` dan `remove` memanggil `syncTugasUpdate()` / `syncTugasDelete()` secara async non-blocking — resolve nama matkul untuk identifier
- **[FEAT]** Backend `controllers/rangkumanController.js`: `update` dan `remove` memanggil `syncRangkumanUpdate()` / `syncRangkumanDelete()` secara async non-blocking — resolve nama matkul untuk identifier
- **[FEAT]** Backend `docs/gas_web_app_handler.js`: Template Google Apps Script Web App dengan handler `doPost(e)` — search baris by identifier, update cell, atau delete baris
- **[VERIFY]** Dashboard → Edit Tugas → MongoDB updated + GAS Web App ter-notify (non-blocking)
- **[VERIFY]** Dashboard → Hapus Rangkuman → MongoDB deleted + GAS Web App ter-notify + Google Doc deleted
- **[VERIFY]** Google Sheets ↔ Dashboard sync dua arah: POST webhook ke Dashboard (inbound) + POST ke GAS Web App (outbound)

---

### v2.6.1-DualGASUrlAndConnectionTest (Two-URL GAS Sync, Connection Test) - 22 September 2026
- **[FIX]** Backend `services/gasSyncService.js`: Implementasi dual URL — `sheet_type === 'mahasiswa'` → URL Sheet 1 (`AKfycbyQJQ...`), `sheet_type === 'pengumuman'|'tugas'|'rangkuman'` → URL Sheet 2 (`AKfycby6lE...`)
- **[FIX]** Backend `services/gasSyncService.js`: Prioritas URL: `process.env.GAS_SYNC_URL_MAHASISWA/ARSIB` → `Settings.gas_sync_url_mahasiswa/arsib` → default hardcoded
- **[FIX]** Backend `services/gasSyncService.js`: Log URL yang digunakan di setiap request: `[GasSync] mahasiswa UPDATE OK → https://script.google.com/macros/s/AKfycby...`
- **[CONFIG]** Database `Settings`: Simpan `gas_sync_url_mahasiswa` dan `gas_sync_url_arsib` ke MongoDB
- **[VERIFY]** Test ping Sheet Mahasiswa → HTTP 302 (reachable, GAS handler belum di-deploy)
- **[VERIFY]** Test ping Sheet Arsib Bot → HTTP 302 (reachable, GAS handler belum di-deploy)
- **[NOTE]** HTTP 405 setelah redirect = normal — GAS Web App handler belum di-deploy di Google Sheets. User perlu paste kode `gas_web_app_handler.js` ke Apps Script editor lalu deploy

---

### v2.6.2-FixTwoWaySyncSchedulerAndMahasiswaCreate (GAS Handler, Mahasiswa Create, Scheduler Fix) - 22 September 2026
- **[FEAT]** Backend `docs/gas_web_app_handler.js`: Tambahkan `doGet(e)` handler — return JSON `{ status: 'success', message: 'GAS Web App is Active' }` saat diakses via browser/GET (tidak error 405)
- **[FIX]** Backend `docs/gas_web_app_handler.js`: `doPost(e)` menangani action `UPDATE`, `DELETE`, `INSERT`, dan `PING` — switch-case handler
- **[FEAT]** Backend `docs/gas_web_app_handler.js`: Tambah fungsi `setupTrigger()` — user jalankan sekali dari Apps Script editor untuk memasang `onChange` trigger otomatis
- **[FIX]** Backend `controllers/mahasiswaController.js`: `create` — hitung otomatis `nomor` urut berdasarkan `Mahasiswa.countDocuments()`, simpan ke MongoDB, panggil `syncMahasiswaUpdate()`, emit Socket.IO `mahasiswa:updated`
- **[FIX]** Backend `services/schedulerService.js`: Reminder kuliah menggunakan range check `0 <= minutesUntil <= offsetMinutes` alih-alih exact match `currentHHMM === targetHHMM` — lebih toleran terhadap drift waktu
- **[FIX]** Backend `services/schedulerService.js`: Tambah `sentReminders` Map sebagai tracking agar reminder tidak terkirim duplikat dalam hari yang sama
- **[FIX]** Backend `services/schedulerService.js`: Tambah cron job reset `sentReminders` setiap tengah malam
- **[FIX]** Backend `services/schedulerService.js`: Log fallback jika tidak ada grup target: `⚠️ Reminder "[nama]" skip: tidak ada grup target`
- **[VERIFY]** Tambah Mahasiswa dari Dashboard → auto-number + sync GAS + emit Socket.IO → tabel bertambah real-time
- **[VERIFY]** Reminder kuliah terkirim saat `0 <= selisih <= offsetMinutes` menit sebelum jam kuliah

---

### v2.6.3-FixMahasiswaSortingAndIndexing (NIM Suffix Sort, Consistent Re-Index) - 22 September 2026
- **[FIX]** Backend `controllers/mahasiswaController.js`: Tambah helper `getNimSuffix(nim)` dan `sortAndReindexMahasiswa()` — sort by 5 digit terakhir NIM + re-index nomor 1..N
- **[FIX]** Backend `controllers/mahasiswaController.js`: `getAll` memanggil `sortAndReindexMahasiswa()` setiap kali data di-fetch
- **[FIX]** Backend `controllers/mahasiswaController.js`: `create` memanggil `sortAndReindexMahasiswa()` setelah insert
- **[FIX]** Backend `controllers/mahasiswaController.js`: `update` memanggil `sortAndReindexMahasiswa()` setelah update
- **[FIX]** Backend `controllers/mahasiswaController.js`: `remove` memanggil `sortAndReindexMahasiswa()` setelah delete
- **[FIX]** Backend `controllers/syncController.js`: Tambah helper `getNimSuffix(nim)` — gunakan di sort: `getNimSuffix(a.nim) - getNimSuffix(b.nim)`
- **[FIX]** Backend `config/seed.js`: Seeder sort by NIM suffix SEBELUM insert, re-index 1..N SETELAH insert — fix skip duplikat NIM
- **[FIX]** Frontend `js/app.js` `loadMahasiswa()`: Sort data sebelum render: `data.sort((a,b) => getNimSuffix(a.nim) - getNimSuffix(b.nim))` + re-index display
- **[VERIFY]** 39 mahasiswa: Sorting `.00222 → .00223 → ... → .00265` BENAR ✅
- **[VERIFY]** Re-index `#1, #2, ..., #39` tanpa lompatan BENAR ✅

---

### v2.6.4-FixSheetsToDashboardSync (Flexible Payload Parsing, Upsert, onChange Handler) - 22 September 2026
- **[FIX]** Backend `controllers/syncController.js`: Flexible payload parsing — terima array langsung, `{data: [...]}`, `{rows: [...]}`, atau single object `{nim, nama, wa}` — semua format dari Google Sheets
- **[FIX]** Backend `controllers/syncController.js`: Flexible field names — support `nim/NIM`, `nama/NAMA/name`, `wa/WA/whatsapp/phone`, `nomor/no`
- **[FIX]** Backend `controllers/syncController.js`: Ganti `deleteMany + insertMany` dengan `findOneAndUpdate({nim}, {$set}, {upsert:true})` — upsert data baru, update data existing, tidak menghapus data lain
- **[FIX]** Backend `controllers/syncController.js`: Panggil `sortAndReindexMahasiswa()` (sort by NIM suffix + re-index 1..N) setelah upsert
- **[FIX]** Backend `controllers/syncController.js`: Emit `io.emit('mahasiswa:updated', {count})` setelah re-index
- **[FIX]** Backend `docs/gas_web_app_handler.js`: `onChangeTrigger()` — deteksi sheet type dari header kolom secara case-insensitive (`headerLower.includes('nim')` → Sheet Mahasiswa)
- **[FIX]** Backend `docs/gas_web_app_handler.js`: `onChangeTrigger()` — tambah try/catch error handling + Logger.log untuk debugging
- **[VERIFY]** POST `/api/sync/mahasiswa` dengan data `{nama:"p",nim:"A18.2026.00269",wa:"085183140169"}` → upsert成功, auto-number #40, total 40 records
- **[VERIFY]** Data test di-cleanup, re-index ulang 1..39

### v2.6.5-MultiTabSheetsSyncFix (Multi-Tab Sheet Sync, Flexible NIM Validation, onChange Auto-Sync) - 23 September 2026
- **[FIX]** Backend `controllers/syncController.js`: `isValidNIM()` diperluas — menerima NIM dari tab mana pun dengan format `A{2digit}.{4digit}.{5digit}` (sebelumnya hanya `A18.2026.XXXXX`) — mendukung multi-tab "data utama angkatan 2026" dan tab lainnya
- **[FIX]** Backend `controllers/syncController.js`: Tambahkan pre-check `isValidNIM()` — validasi panjang string (10-20 karakter), tidak mengandung spesi, dan tidak mengandung karakter selain alfanumerik/period — memfilter NIM acak/gibberish dari payload
- **[FIX]** Backend `controllers/syncController.js`: `isHeaderOrEmpty()` diperluas — keyword header ditambah (`name`, `nim/nama`, `daftar`, `data`) dan threshold minimum length 2 karakter untuk field required
- **[FIX]** Backend `controllers/syncController.js`: Endpoint `POST /bot/api/sync/mahasiswa` menerima payload dari tab mana pun — terima array langsung, `{data:[...]}`, `{rows:[...]}`, atau single object — selama memiliki kolom NIM, Nama, WA
- **[FIX]** Backend `controllers/syncController.js`: Alur lengkap: payload parse → cleansing (skip kosong/header/invalid NIM/duplikat) → `findOneAndUpdate` upsert by NIM → `sortAndReindexMahasiswa()` → emit Socket.IO `io.emit('mahasiswa:updated')`
- **[FIX]** Backend `docs/gas_web_app_handler.js`: `onChangeTrigger()` sekarang membaca sheet aktif via `getActiveSheet()` secara fleksibel — tidak terbatas pada nama tab tertentu
- **[FIX]** Backend `docs/gas_web_app_handler.js`: Deteksi sheet type dari header kolom secara case-insensitive — `headerLower.some(h => h === 'nim' || h.indexOf('nim') !== -1)` → Sheet Mahasiswa — mendukung "data utama angkatan 2026" dan tab lainnya
- **[FEAT]** Backend `docs/gas_web_app_handler.js`: `onChangeTrigger()` membaca seluruh data baris, mapping header → object, lalu POST ke backend webhook `/api/sync/{sheetType}` secara otomatis saat data berubah
- **[FEAT]** Backend `docs/gas_web_app_handler.js`: `doPost()` auto-detect `sheet_type` dari header aktif jika tidak disediakan dalam payload — multi-tab tanpa hardcode
- **[FEAT]** Backend `docs/gas_web_app_handler.js`: `getIdentifierColumn()` tambah fallback fuzzy search — `headers[i].toLowerCase().indexOf(key)` jika exact match tidak ditemukan
- **[FEAT]** Backend `docs/gas_web_app_handler.js`: `setupTrigger()` set default `BACKEND_WEBHOOK_URL` ke `https://cswa.latifdev.com/bot` di Script Properties
- **[FIX]** Backend `docs/gas_web_app_handler.js`: Version bump ke `v2.6.5` di `doGet()` response
- **[VERIFY]** `POST /api/sync/mahasiswa` dengan valid NIM `A18.2026.00999` → upsert berhasil, total bertambah
- **[VERIFY]** `POST /api/sync/mahasiswa` dengan invalid NIM `XYZ123` → di-filter (invalid: 1)
- **[VERIFY]** `POST /api/sync/mahasiswa` dengan NIM kosong → di-filter (filtered: 1)
- **[VERIFY]** `POST /api/sync/mahasiswa` dengan NIM duplikat → di-dedup (duplicated: 1)
- **[VERIFY]** Data test di-cleanup, re-index ulang 1..39

---

### v2.6.6-FixSyncAndAddSearchFeature (Per-Item Error Isolation, Real-Time Search, GAS Row Resilience) - 23 September 2026
- **[FIX]** Backend `controllers/syncController.js`: Refactor `syncMahasiswa` — setiap item dalam array diproses secara independen dengan `try-catch` di dalam loop filtering DAN upsert, sehingga satu baris sampah/error tidak menggagalkan seluruh batch
- **[FIX]** Backend `controllers/syncController.js`: Extract helper `sortAndReindexMahasiswa()` — fungsi reusable untuk sort by NIM suffix + re-index nomor 1..N, mengurangi duplikasi kode
- **[FIX]** Backend `controllers/syncController.js`: Response sync sekarang menyertakan field `upsertErrors` untuk menghitung jumlah item yang gagal upsert secara individual
- **[FEAT]** Frontend `js/app.js` `loadMahasiswa()`: Tambah search input bar `#searchMahasiswa` dengan placeholder "🔍 Cari berdasarkan NIM, Nama, atau WhatsApp..." — real-time filtering saat user mengetik
- **[FEAT]** Frontend `js/app.js` `renderMahasiswaTable()`: Fungsi terpisah untuk render tabel mahasiswa — mendukung filtering dinamis tanpa re-fetch dari server
- **[FEAT]** Frontend `js/app.js`: Filter pencarian case-insensitive pada field NIM, Nama, dan WhatsApp — substring match untuk pencarian cepat
- **[FIX]** Backend `docs/gas_web_app_handler.js`: `onChangeTrigger()` — bungkus pembacaan setiap baris dalam nested `try-catch` (per-row + per-cell), baris bermasalah di-skip dengan log tanpa menghentikan seluruh proses sync
- **[FIX]** Backend `docs/gas_web_app_handler.js`: Tambah counter `skippedRows` — log jumlah baris yang di-skip vs baris valid yang berhasil dikirim ke webhook
- **[VERIFY]** POST `/api/sync/mahasiswa` dengan mix data valid + garbage → baris valid tetap upsert, baris sampah di-skip (filtered count bertambah)
- **[VERIFY]** Search input muncul di halaman Mahasiswa, ketik nama/NIM/WA → tabel ter-filter real-time
- **[VERIFY]** GAS `onChangeTrigger` tetap mengirim data meski ada baris dengan sel bermasalah di Google Sheets

---

### v2.6.7-FixLocalIPWebhookSync (Local IP Webhook Sync, Request Logging, Manual Sync Button) - 23 September 2026
- **[FIX]** Backend `routes/syncRoutes.js`: Tambah middleware `syncLogger` yang mencatat setiap request sync masuk ke terminal/docker log — log IP client, timestamp, metode HTTP, URL, dan jumlah item dalam payload
- **[FIX]** Backend `routes/syncRoutes.js`: Middleware logging diterapkan ke semua route sync (`/mahasiswa`, `/pengumuman`, `/tugas`, `/rangkuman`) — audit trail lengkap untuk debugging
- **[FIX]** Backend `controllers/syncController.js`: Tambah logging detail di `syncMahasiswa` — catat IP client, timestamp request, dan status completion untuk setiap sync dari Google Sheets webhook
- **[FIX]** Backend `server.js`: CORS configuration sudah mengizinkan semua origin via `app.use(cors())` — endpoint sync dapat diakses dari IP lokal (192.168.x.x, 10.x.x.x) maupun domain publik tanpa pemblokiran
- **[FEAT]** Frontend `js/app.js` `loadMahasiswa()`: Tambah tombol "🔄 Sync dari Google Sheets" di samping search bar — memicu re-fetch data dari server secara manual tanpa menunggu Socket.IO event
- **[FEAT]** Frontend `js/app.js` `manualSyncMahasiswa()`: Fungsi baru untuk fetch ulang data mahasiswa dari API, update cache `window._mahasiswaData`, re-render tabel, dan reset search input — fallback jika Socket.IO terputus
- **[VERIFY]** POST `/api/sync/mahasiswa` dari IP lokal (192.168.x.x) → log muncul di docker logs dengan IP client dan jumlah item
- **[VERIFY]** Tombol "🔄 Sync dari Google Sheets" di halaman Mahasiswa → data ter-refresh dari server tanpa browser reload
- **[VERIFY]** Search bar + manual sync button berdampingan dengan layout flex yang responsif

---

### v2.6.8-FixFrontendCacheAndHardcodedSearch (Cache Busting, Hardcoded Search/Sync HTML, filterMahasiswaTable) - 23 September 2026
- **[FIX]** Frontend `js/app.js` `loadMahasiswa()`: Search bar & tombol sync sekarang dirender sebagai HTML template literal hardcoded menggunakan Bootstrap grid (`div.row > div.col-md-8 + div.col-md-4`) dengan `oninput="filterMahasiswaTable()"` — tidak ada lagi event listener `addEventListener` yang bisa gagal karena timing DOM
- **[FIX]** Frontend `js/app.js`: Tambah fungsi `filterMahasiswaTable()` — dipanggil langsung dari `oninput` attribute pada search input, melakukan filter case-insensitive terhadap NIM, Nama, dan WhatsApp dari cache `window._mahasiswaData`
- **[FIX]** Backend `server.js`: Tambah cache busting pada Express static middleware — `maxAge: 0` dan `etag: false` memastikan browser selalu memuat file JS/CSS terbaru tanpa menyimpan cache lama
- **[VERIFY]** Halaman Mahasiswa menampilkan search bar + tombol "🔄 Sync dari Google Sheets" secara konsisten setiap kali di-load — tidak tergantung event listener timing
- **[VERIFY]** Ketik di search bar → tabel langsung ter-filter tanpa delay
- **[VERIFY]** Deploy ulang → browser memuat versi terbaru file statis tanpa perlu hard refresh (Ctrl+Shift+R)

---

### v2.6.9-FixNginxBadGateway (Nginx Reverse Proxy Validation, Container Connectivity Check) - 23 September 2026
- **[FIX]** Backend `server.js`: Container `wa_bot_pjj` verified berjalan aktif — Docker port mapping `0.0.0.0:3002→3001` berfungsi, backend merespons endpoint `/bot/health` dengan `{"status":"ok"}`
- **[FIX]** Nginx config: `nginx -t` validasi syntax OK, `systemctl reload nginx` berhasil tanpa error — reverse proxy `proxy_pass http://127.0.0.1:3002/bot/` untuk `cswa.latifdev.com` berjalan tanpa 502 Bad Gateway
- **[VERIFY]** `curl http://127.0.0.1:3002/bot/health` → `{"status":"ok","timestamp":"..."}` — backend responsif di dalam container
- **[VERIFY]** Nginx config test passed: syntax OK, config successful — siap menerima traffic dari domain publik

---

### v2.7.0-FixWebhookGateway (Nginx /bot/ Proxy Block, Sync Endpoint Verified, Proxy Pass Fix) - 23 September 2026
- **[FIX]** Nginx `cswa.latifdev.com.conf`: Tambah blok `location /bot/` yang sebelumnya **TIDAK ADA** — sebelumnya semua request ke `/bot/` jatuh ke `location /` (proxy ke port 3000), sekarang dipetakan langsung ke `http://127.0.0.1:3002/bot/` dengan `proxy_http_version 1.1`, WebSocket upgrade, dan `proxy_read_timeout 86400`
- **[FIX]** Nginx config: Blok `location /bot/` di-insert sebelum `location /helpdeskv2/` agar urutan prioritas benar — `/bot/api/sync/mahasiswa` sekarang mencapai container tanpa terkena catch-all `location /`
- **[FIX]** Backend `syncController.js`: Endpoint `POST /bot/api/sync/mahasiswa` terverifikasi — test dengan payload `[{nama:"Test",nim:"A18.2026.00001",wa:"08123456789"}]` → response `{"success":true,"count":1,"total":40}` — upsert berhasil
- **[FIX]** Nginx config validation: `nginx -t` syntax OK + `systemctl reload nginx` success tanpa error — konfigurasi berjalan tanpa restart full
- **[VERIFY]** `curl -X POST http://127.0.0.1:3002/bot/api/sync/mahasiswa` → `{"success":true}` — endpoint sync responsif langsung ke container
- **[VERIFY]** `curl https://cswa.latifdev.com/bot/health` → `{"status":"ok"}` — Nginx reverse proxy ke container berfungsi dari domain publik tanpa 502 Bad Gateway
- **[VERIFY]** Webhook Google Sheets yang mengarah ke `https://cswa.latifdev.com/bot/api/sync/mahasiswa` sekarang sampai ke container tanpa ter-block oleh Nginx catch-all

---

### v2.7.1-FixUIAndWASync (Flexbox Search Bar, Flexible WA Field Mapping, WhatsApp Auto-Format, Sort & Re-index) - 23 September 2026
- **[FIX]** Frontend `js/app.js` `loadMahasiswa()`: Search bar & tombol "🔄 Sync dari Google Sheets" dirapikan dalam layout Bootstrap row (`col-md-8` + `col-md-4`) dengan `style="width:100%"` pada input agar placeholder terbaca jelas
- **[FIX]** Backend `controllers/syncController.js`: Tambah helper `formatWhatsAppNumber()` — otomatis normalisasi nomor WA Indonesia: hilangkan prefix `62`/`+62`, tambahkan leading `0` jika perlu (contoh: `628123456789` → `08123456789`)
- **[FIX]** Backend `controllers/syncController.js`: Flexible WhatsApp field mapping — baca key dari payload: `wa`, `WA`, `whatsapp`, `phone`, `no_wa`, `nomor_wa`, `no.wa` → semua dinormalisasi ke field `wa` dengan auto-format
- **[FIX]** Backend `controllers/syncController.js`: Sorting & re-index dikonfirmasi berjalan: upsert → sort by 5 digit terakhir NIM ascending → re-index `nomor` 1..N → emit Socket.IO `mahasiswa:updated`
- **[FIX]** Backend `docs/gas_web_app_handler.js`: Tambah normalisasi header WA di GAS — semua varian header (`whatsapp`, `phone`, `no_wa`, `nomor_wa`, `no.wa`, `telp`, `telepon`, `hp`, `handphone`) dinormalisasi ke key `wa` sebelum dikirim ke webhook backend
- **[FIX]** Backend `docs/gas_web_app_handler.js`: Version bump ke `v2.7.1` — flexible WA field mapping + auto-format
- **[VERIFY]** Search bar lebar penuh + tombol sync berdampingan rapi di halaman Mahasiswa
- **[VERIFY]** Payload Google Sheets dengan header `whatsapp` atau `phone` → berhasil di-sync ke MongoDB dengan field `wa` terisi
- **[VERIFY]** Nomor WA `628123456789` → auto-format ke `08123456789` di database
- **[VERIFY]** Sorting data berdasarkan suffix NIM ascending + re-index nomor 1..N setelah upsert

---

### v2.8.0-FullArsipBotSync (Full Arsip Bot Sync Integration, Manual Sync Buttons, GAS Multi-Tab Detection) - 24 September 2026
- **[FEAT]** Frontend `js/app.js` `loadPengumuman()`: Tambah tombol **"🔄 Sync dari Google Sheets"** di card header sebelah tombol "+ Tambah" — memicu re-fetch data pengumuman dari server secara manual
- **[FEAT]** Frontend `js/app.js` `manualSyncPengumuman()`: Fungsi baru untuk fetch ulang data pengumuman dari API `/pengumuman`, reload tabel via `loadPengumuman()`, tampilkan toast jumlah data yang dimuat ulang
- **[FEAT]** Frontend `js/app.js` `loadTugas()`: Tambah tombol **"🔄 Sync dari Google Sheets"** di card header sebelah tombol "+ Tambah" — memicu re-fetch data tugas dari server secara manual
- **[FEAT]** Frontend `js/app.js` `manualSyncTugas()`: Fungsi baru untuk fetch ulang data tugas dari API `/tugas`, reload tabel via `loadTugas()`, tampilkan toast jumlah data yang dimuat ulang
- **[FEAT]** Frontend `js/app.js` `loadRangkuman()`: Tambah tombol **"🔄 Sync dari Google Sheets"** di card header sebelah tombol "+ Tambah" — memicu re-fetch data rangkuman dari server secara manual
- **[FEAT]** Frontend `js/app.js` `manualSyncRangkuman()`: Fungsi baru untuk fetch ulang data rangkuman dari API `/rangkuman`, reload tabel via `loadRangkuman()`, tampilkan toast jumlah data yang dimuat ulang
- **[FIX]** Backend `docs/gas_web_app_handler.js`: Version bump ke `v2.8.0` — Full Arsip Bot Sync integration
- **[FIX]** Backend `docs/gas_web_app_handler.js`: `onChangeTrigger()` sudah mendukung deteksi otomatis untuk semua sheet type arsip bot: Pengumuman (header: `judul`, `isi`, `schedule_time`), Tugas (header: `judul`, `deskripsi`, `deadline`), Rangkuman (header: `judul`, `isi`, `tugas_tambahan`, `gdoc_link`) — tidak perlu hardcode nama tab
- **[VERIFY]** Tombol "🔄 Sync dari Google Sheets" muncul di halaman Pengumuman, Tugas & Deadline, serta Rangkuman — konsisten dengan halaman Mahasiswa
- **[VERIFY]** Socket.IO listener di `socket.js` sudah otomatis me-refresh tabel saat event `pengumuman:updated`, `tugas:updated`, `rangkuman:updated` diterima tanpa perlu reload browser
- **[VERIFY]** GAS `onChangeTrigger()` mendeteksi tab Pengumuman/Tugas/Rangkuman dari header kolom secara case-insensitive → auto-sync ke backend webhook `/api/sync/{sheetType}`

---

### v2.8.3-GASLibrarySync (GAS Library ID Integration, Config Constants, Enriched Sync Payload) - 24 September 2026
- **[CONFIG]** Backend `config/constants.js`: Tambah `GAS_LIBRARY_ID` dengan default `1tymqZa1CXCxYVqiqFzPAhu3xD9GLMUaTqvP3RNkwlLii1CbSrepRJbf9` — bisa di-override via env `GAS_LIBRARY_ID` atau database Settings
- **[CONFIG]** Backend `config/seed.js`: Seed setting `gas_library_id` ke database saat container startup — memastikan Library ID tersedia di MongoDB meski env tidak di-set
- **[FIX]** Backend `services/gasSyncService.js`: `syncToGoogleSheets()` sekarang mengambil `library_id` dari database Settings (fallback ke constants) dan menyertakannya dalam setiap payload POST ke GAS Web App — backend dan GAS handler terintegrasi via Library ID yang sama
- **[FIX]** Backend `services/gasSyncService.js`: Log sinkronisasi sekarang menampilkan Library ID yang digunakan (12 karakter pertama) untuk debugging: `[GasSync] mahasiswa UPDATE OK (library: 1tymqZa1CX...) → https://script.google.com/...`
- **[FIX]** Backend `docs/gas_web_app_handler.js`: Version bump ke `v2.8.3` — GAS Library ID documentation & integration
- **[FIX]** Backend `docs/gas_web_app_handler.js`: Sertakan panduan penggunaan Library ID `1tymqZa1CXCxYVqiqFzPAhu3xD9GLMUaTqvP3RNkwlLii1CbSrepRJbf9` pada komentar header — langkah impor Library di Apps Script editor (klik "+" → paste ID → Add)
- **[FIX]** Backend `docs/gas_web_app_handler.js`: `doPost()` dan `onChangeTrigger()` mendukung pembacaan data dari spreadsheet Arsip Bot (Pengumuman, Tugas, Rangkuman) maupun Mahasiswa secara otomatis via header column detection
- **[VERIFY]** Container restart — seeder memasukkan `gas_library_id` ke database Settings
- **[VERIFY]** `syncToGoogleSheets()` mengirim payload dengan `library_id` field ke GAS Web App
- **[VERIFY]** GAS handler v2.8.3 merespons dengan `version: 'v2.8.3'` saat diakses via GET

---

### v2.8.4-GASSyncUrlSetting (GAS Sync URL Arsip Bot Settings Field) - 24 September 2026
- **[FEAT]** Frontend `js/app.js` `loadSettings()`: Baca setting `gas_sync_url_arsib` dari database dan tampilkan ke variabel template — input field terisi otomatis saat halaman Pengaturan dibuka
- **[FEAT]** Frontend `js/app.js` `loadSettings()` → Form "Pengaturan Umum": Tambah field input `gas_sync_url_arsib` dengan label "GAS Web App Sync URL Arsip Bot" dan placeholder `https://script.google.com/macros/s/.../exec` — admin dapat mengatur URL sinkronisasi arsip bot langsung dari dashboard
- **[FIX]** Frontend `js/app.js` `saveSettings()`: Tambah `gas_sync_url_arsib` ke array fields yang disimpan — field ini akan di-POST ke backend `/api/settings` dan disimpan ke MongoDB collection `Settings` dengan key `gas_sync_url_arsib`
- **[VERIFY]** Field "GAS Web App Sync URL Arsip Bot" muncul di section Pengaturan Umum, terisi otomatis dari database saat ada data tersimpan
- **[VERIFY]** Simpan Pengaturan Umum → field `gas_sync_url_arsib` berhasil tersimpan ke MongoDB
- **[VERIFY]** Reload halaman Pengaturan → field terisi ulang dengan nilai yang sudah disimpan sebelumnya

---

### v2.8.5-FixOutboundSyncOnCreate (INSERT Sync for Pengumuman/Tugas/Rangkuman, Field Mapping) - 24 September 2026
- **[FIX]** Backend `services/gasSyncService.js`: Tambah `syncPengumumanInsert()` — kirim payload `action: 'INSERT'` ke GAS Web App saat pengumuman baru dibuat dari Dashboard, dengan field mapping: `judul`, `isi`, `jam_kirim` (dari `schedule_time`), `hari_ulang` (dari `repeat_days` array → string koma), `status` (Aktif/Nonaktif dari `is_active`)
- **[FIX]** Backend `services/gasSyncService.js`: Tambah `syncTugasInsert()` — kirim payload `action: 'INSERT'` ke GAS Web App saat tugas baru dibuat, dengan field mapping: `matkul` (resolve nama dari `matkul_id`), `judul`, `deskripsi`, `deadline`, `status`
- **[FIX]** Backend `services/gasSyncService.js`: Tambah `syncRangkumanInsert()` — kirim payload `action: 'INSERT'` ke GAS Web App saat rangkuman baru dibuat, dengan field mapping: `matkul` (resolve nama dari `matkul_id`), `judul`, `isi`, `tugas_tambahan`, `gdoc_link`
- **[FIX]** Backend `controllers/pengumumanController.js`: `create()` sekarang memanggil `syncPengumumanInsert(data)` setelah simpan ke MongoDB — outbound sync otomatis saat admin membuat pengumuman baru
- **[FIX]** Backend `controllers/tugasController.js`: `create()` sekarang memanggil `syncTugasInsert(data)` setelah simpan ke MongoDB — outbound sync otomatis saat admin membuat tugas baru
- **[FIX]** Backend `controllers/rangkumanController.js`: `create()` sekarang memanggil `syncRangkumanInsert(data)` setelah simpan ke MongoDB — outbound sync otomatis saat admin membuat rangkuman baru (sebelum GAS webhook Google Docs)
- **[FIX]** Backend `services/gasSyncService.js`: `getGasSyncUrl()` sudah membaca `gas_sync_url_arsib` dari database Settings secara otomatis (env → DB → fallback hardcoded) — tidak ada perubahan pada logic URL resolution
- **[VERIFY]** `POST /bot/api/pengumuman` (create) → `syncPengumumanInsert()` terpanggil → POST ke GAS dengan `action: 'INSERT'` dan field `judul, isi, jam_kirim, hari_ulang, status`
- **[VERIFY]** `POST /bot/api/tugas` (create) → `syncTugasInsert()` terpanggil → POST ke GAS dengan `action: 'INSERT'` dan field `matkul, judul, deskripsi, deadline, status`
- **[VERIFY]** `POST /bot/api/rangkuman` (create) → `syncRangkumanInsert()` terpanggil → POST ke GAS dengan `action: 'INSERT'` dan field `matkul, judul, isi, tugas_tambahan, gdoc_link`
- **[VERIFY]** Semua request menggunakan `axios.post()` dengan `Content-Type: application/json` dan `timeout: 15000ms`

---

### v2.9.0-TitipAbsenFeature (Titip Absen Dashboard, Webhook Sync, Time Filter) - 24 September 2026
- **[FEAT]** Backend `models/TitipAbsen.js`: Model baru `TitipAbsen` dengan field `timestamp` (String), `nim` (String), `nama` (String), `password` (String), `matrikulasi` (String), `createdAt` (Date auto) — disimpan di collection `titipabsens`
- **[FEAT]** Backend `controllers/titipAbsenController.js`: Controller CRUD — `getAll()` (sorted by timestamp desc), `remove()` (hapus 1 data), `clearAll()` (hapus semua data)
- **[FEAT]** Backend `routes/titipAbsenRoutes.js`: Route REST — `GET /bot/api/titip-absen`, `DELETE /bot/api/titip-absen/:id`, `DELETE /bot/api/titip-absen/clear-all`
- **[FEAT]** Backend `controllers/syncController.js`: `syncTitipAbsen()` — endpoint webhook `POST /bot/api/sync/titip-absen` menerima array `[{timestamp, nim, password, matrikulasi}]`
- **[FIX]** Backend `controllers/syncController.js`: **Filter Waktu Backend** — hanya simpan data jika jam pada timestamp >= 18:00 WIB ATAU < 07:00 WIB (double protection). Mendukung format `DD/MM/YYYY HH:MM:SS`, ISO `YYYY-MM-DDTHH:MM:SS`, dan parsing fallback. Jam 07:00–17:59 WIB otomatis difilter (rejected)
- **[FIX]** Backend `controllers/syncController.js`: Match NIM ke collection `Mahasiswa` untuk mengambil `nama` mahasiswa secara otomatis — jika NIM tidak ditemukan, nama dikosongkan
- **[FIX]** Backend `controllers/syncController.js`: Upsert/replace data berdasarkan kombinasi `nim + timestamp` — data duplikat (NIM + waktu sama) akan di-replace, bukan diduplikasi
- **[FIX]** Backend `routes/syncRoutes.js`: Tambah route `POST /titip-absen` ke syncController
- **[FIX]** Backend `server.js`: Register route `titipAbsenRoutes` di `${BASE_PATH}/api/titip-absen`
- **[FEAT]** Frontend `index.html`: Menu "📋 Titip Absen" ditambahkan di Sidebar antara menu Mahasiswa dan Rangkuman
- **[FEAT]** Frontend `js/app.js` `loadPage()`: Loader `'titip-absen': loadTitipAbsen` ditambahkan ke page loaders
- **[FEAT]** Frontend `js/app.js` `getPageTitle()`: Title `'titip-absen': 'Titip Absen'` ditambahkan
- **[FEAT]** Frontend `js/app.js` `loadTitipAbsen()`: Render tabel Titip Absen dengan kolom `#`, `Timestamp`, `NIM`, `Nama`, `Password`, `Matrikulasi`, `Aksi` — plus tombol "🔄 Sync dari Google Sheets" dan "🗑️ Hapus Semua Data"
- **[FEAT]** Frontend `js/app.js` `manualSyncTitipAbsen()`: Fetch ulang data dari API `/titip-absen` tanpa browser reload
- **[FEAT]** Frontend `js/app.js` `deleteTitipAbsen()`: Hapus 1 record dengan confirm dialog
- **[FEAT]** Frontend `js/app.js` `clearAllTitipAbsen()`: Hapus semua data dengan confirm dialog ganda
- **[FIX]** Frontend `js/socket.js`: Tambah Socket.IO listener `titip_absen:updated` — auto-refresh tabel saat halaman Titip Absen aktif + toast notification
- **[VERIFY]** POST `/bot/api/sync/titip-absen` dengan data jam 19:00 WIB → berhasil disimpan
- **[VERIFY]** POST `/bot/api/sync/titip-absen` dengan data jam 10:00 WIB → difilter (rejected, `filteredTime` bertambah)
- **[VERIFY]** NIM yang terdaftar di Mahasiswa → `nama` otomatis terisi
- **[VERIFY]** NIM yang tidak terdaftar → `nama` dikosongkan, data tetap disimpan
- **[VERIFY]** Tombol "🗑️ Hapus Semua Data" menghapus seluruh record di collection TitipAbsen
- **[VERIFY]** Socket.IO `titip_absen:updated` memicu auto-refresh tabel tanpa browser reload

---

### v2.9.1-FixStrictAbsenceWindow (Active Absence Window Logic, Date-Range Filtering, Auto-Cleanup) - 24 September 2026
- **[FIX]** Backend `controllers/syncController.js`: Buat helper `getActiveAbsenceWindow()` — menentukan rentang waktu aktif berdasarkan waktu WIB saat ini:
  - Jam ≥ 18:00 → Window: Hari Ini 18:00 s.d. Besok 07:00
  - Jam < 07:00 → Window: Kemarin 18:00 s.d. Hari Ini 07:00
  - Jam 07:00–17:59 → Window: Kemarin 18:00 s.d. Hari Ini 07:00 (siklus malam teraktif)
- **[FIX]** Backend `controllers/syncController.js`: Buat helper `parseTimestamp()` — parse timestamp string `DD/MM/YYYY HH:MM:SS` atau ISO ke Date object secara robust
- **[FIX]** Backend `controllers/syncController.js`: Buat helper `isInsideAbsenceWindow()` — konversi timestamp ke WIB lalu bandingkan dengan windowStart/windowEnd
- **[FIX]** Backend `controllers/syncController.js`: `syncTitipAbsen()` sekarang hanya menyimpan data yang timestamp-nya berada DI DALAM Active Absence Window — data tanggal lama atau di luar window otomatis difilter
- **[FIX]** Backend `controllers/syncController.js`: Auto-cleanup — setelah sync, data di collection TitipAbsen yang timestamp-nya di luar window aktif otomatis dihapus
- **[FIX]** Backend `controllers/titipAbsenController.js`: `getAll()` sekarang hanya mengembalikan data di dalam Active Absence Window — filter in-memory berdasarkan window yang dihitung dari waktu WIB saat ini
- **[FIX]** Backend `controllers/titipAbsenController.js`: `remove()` dan `clearAll()` sekarang emit Socket.IO `titip_absen:updated` agar dashboard auto-refresh
- **[FIX]** Backend `controllers/titipAbsenController.js`: Response `getAll()` menyertakan field `window: {start, end}` agar frontend menampilkan info window aktif
- **[VERIFY]** POST sync dengan data jam 22:00 WIB pada 23 Sep → disimpan jika window aktif = 23 Sep 18:00 — 24 Sep 07:00
- **[VERIFY]** POST sync dengan data jam 10:00 WIB pada 24 Sep → difilter (di luar window 23 Sep 18:00 — 24 Sep 07:00)
- **[VERIFY]** GET `/titip-absen` pada siang hari (07:00–17:59) → menampilkan data dari siklus malam sebelumnya (Kemarin 18:00 s.d. Hari Ini 07:00)
- **[VERIFY]** Data lama di luar window otomatis dihapus saat sync dilakukan

---

### v2.9.2-FixParseTimestampWIB (Google Sheets M/D/YYYY Format, Explicit WIB Timezone) - 24 September 2026
- **[FIX]** Backend `controllers/syncController.js`: Rewrite `parseTimestamp()` — sekarang SELALU menginterpretasikan timestamp dari Google Sheets sebagai zona waktu WIB (UTC+7):
  - Format `"M/D/YYYY HH:mm:ss"` (contoh: `"9/23/2026 22:38:57"`) — parse komponen Month, Day, Year, Hour, Minute, Second, buat Date via `Date.UTC(year, month-1, day, hour-7, minute, second)` — pengurangan 7 jam mengkonversi WIB ke UTC
  - Format ISO `"YYYY-MM-DDTHH:MM:SS"` — parse dengan `new Date(str)`, lalu geser +7 jam ke UTC (`d.getTime() + 7*60*60*1000`)
- **[FIX]** Backend `controllers/titipAbsenController.js`: Update `parseTimestamp()` dengan logika yang sama — konsisten dengan syncController
- **[FIX]** Perbaiki bug sebelumnya: `dateParts[0]` sekarang benar dimapping ke `month` (bukan `day`) sesuai format Google Sheets `M/D/YYYY` — sebelumnya `"9/23/2026"` di-parse sebagai 23 September (salah), sekarang benar sebagai 23 September dari input `"9/23/2026"` (Month=9, Day=23)
- **[FIX]** `isInsideAbsenceWindow()` tetap membandingkan Date UTC yang sudah dikonversi dari WIB — perbandingan `tsWIB >= windowStart && tsWIB < windowEnd` sekarang akurat karena kedua sisi dalam UTC yang konsisten
- **[VERIFY]** Timestamp `"9/23/2026 22:38:57"` → `parseTimestamp()` menghasilkan Date UTC yang merepresentasikan 22:38:57 WIB = 15:38:57 UTC
- **[VERIFY]** Window `2026-09-23T18:00:00Z` (23 Sep 18:00 WIB) — `22:38:57 WIB` (23 Sep) di dalam window → diterima
- **[VERIFY]** Window `2026-09-24T07:00:00Z` (24 Sep 07:00 WIB) — `10:00:00 WIB` (24 Sep) di luar window → difilter

---

### v2.9.3-FixParseTimestampDualFormat (Dual Format M/D & D/M, Debug Logging) - 24 September 2026
- **[FIX]** Backend `controllers/syncController.js`: `parseTimestamp()` sekarang mendukung **2 format** Google Sheets secara otomatis:
  - Format `"M/D/YYYY HH:mm:ss"` (contoh: `"9/23/2026 22:38:57"`) — default Google Sheets
  - Format `"DD/MM/YYYY, HH:mm:ss"` (contoh: `"23/09/2026, 22:38:57"`) — format lokal Indonesia dengan koma
  - Normalisasi strip comma: `str.replace(/,/g, ' ')` sebelum parsing
  - Deteksi otomatis M/D vs D/M: jika `p0 > 12` → D/M/YYYY, jika `p1 > 12` → M/D/YYYY, jika keduanya ≤ 12 → default M/YYYY (Google Sheets)
- **[FIX]** Backend `controllers/titipAbsenController.js`: Update `parseTimestamp()` dengan logika dual-format yang sama — konsisten dengan syncController
- **[FEAT]** Backend `controllers/syncController.js`: Tambah `console.log` debug di loop syncTitipAbsen — log format: `DEBUG TITIP ABSEN INPUT: [raw timestamp] -> PARSED: [ISO string] -> IS_INSIDE: [true/false]` — memudahkan tracing ketika timestamp tidak sesuai ekspektasi
- **[VERIFY]** `"23/09/2026, 22:38:57"` → `parseTimestamp()` deteksi `p0=23 > 12` → D/M/YYYY → month=09, day=23 → 22:38:57 WIB
- **[VERIFY]** `"9/23/2026 22:38:57"` → `parseTimestamp()` deteksi `p1=23 > 12` → M/D/YYYY → month=9, day=23 → 22:38:57 WIB
- **[VERIFY]** Debug log muncul di docker logs untuk setiap item yang diproses

---

> **Terakhir diperbarui:** 24 September 2026
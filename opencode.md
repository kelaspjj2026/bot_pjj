# Bot WhatsApp PJJ - Development Log

## Info Project
- **Nama**: Bot WhatsApp PJJ Informatika Udinus
- **Versi**: v2.9.2
- **Tech Stack**: Node.js + Express + MongoDB + Baileys (WhatsApp) + Socket.IO
- **Frontend**: HTML + CSS + Vanilla JS (SPA)
- **FE Vercel**: https://bot-pjj.vercel.app/
- **BE Vercel**: https://api-bot-pjj.vercel.app

## Deploy Info
- **MongoDB Atlas**: Cluster0 (kelaspjj2026_db_user)
- **Lokal**: http://localhost:3001/bot/

---

## Update Log

### [2026-09-24] Inisialisasi Local Development

#### Yang Sudah Dikerjakan
1. Install Git v2.51.0
2. Setup Git user (latifdev / mohammadmaulanaabdullatif@gmail.com)
3. Setup SSH Key (ed25519) untuk GitHub
4. Clone repository dari https://github.com/kelaspjj2026/bot_pjj.git
5. Analisis seluruh struktur project
6. **Buat 9 Model Mongoose** di `backend/models/index.js`
7. **Buat `.env`** dengan MongoDB Atlas connection string
8. **Install dependencies** (npm install) — 253 packages
9. **Copy frontend/** ke `backend/frontend/` (agar bisa dilayani Express)
10. **Buat folder `sessions/`** dan `uploads/`
11. **Fix DNS SRV** — Node.js Windows tidak resolve SRV record, ditambahkan `dns.setServers(['8.8.8.8'])` di `config/db.js`
12. **Server berhasil jalan** di http://localhost:3001/bot/
13. **Semua API tested** — Matkul, Jadwal, Mahasiswa, Settings semua OK

#### Masalah yang Ditemukan & Fix
| # | Masalah | Solusi |
|---|---------|--------|
| 1 | Folder `backend/models/` TIDAK ADA | Buat `models/index.js` dengan 9 schema |
| 2 | Tidak ada `.env` file | Buat `.env` dengan MONGO_URI Atlas |
| 3 | Frontend di root, server serve dari `__dirname/frontend` | Copy `frontend/` ke `backend/frontend/` |
| 4 | DNS SRV MongoDB Atlas tidak resolve di Windows | Tambahkan `dns.setServers(['8.8.8.8'])` di `config/db.js` |
| 5 | Tidak ada folder `sessions/` | Buat folder `sessions/` di root project |
| 6 | Tidak ada folder `uploads/` | Buat folder `uploads/` di root project |

#### Status
- [x] Git + SSH setup
- [x] Repository cloned
- [x] 9 Model Mongoose dibuat
- [x] `.env` configured
- [x] Dependencies installed
- [x] DNS SRV fix
- [x] Server running locally
- [x] API endpoints tested
- [ ] Dashboard tested via browser
- [ ] WhatsApp connection tested
- [ ] Vercel deploy setup
- [ ] Push to GitHub

---

## Model Reference

### Matkul (Mata Kuliah)
| Field | Type | Required |
|-------|------|----------|
| kode | String | Yes |
| nama | String | Yes |
| sks | Number | Yes |
| dosen | String | Yes |
| gmeet_link | String | No |

### Jadwal (Schedule)
| Field | Type | Required |
|-------|------|----------|
| matkul_id | ObjectId (ref Matkul) | Yes |
| hari | String (enum) | Yes |
| jam_mulai | String | Yes |
| jam_selesai | String | Yes |
| gmeet_link | String | No |
| wa_group_link | String | No |

### Mahasiswa (Student)
| Field | Type | Required |
|-------|------|----------|
| nomor | Number | Yes |
| nama | String | Yes |
| nim | String | Yes |
| wa | String | Yes |

### Pengumuman (Announcement)
| Field | Type | Required |
|-------|------|----------|
| judul | String | Yes |
| isi | String | Yes |
| is_recurring | Boolean | No |
| schedule_time | String | No |
| repeat_days | [String] | No |
| is_active | Boolean | Yes |
| target_group_ids | [String] | No |

### PengumumanLog
| Field | Type | Required |
|-------|------|----------|
| pengumuman_id | ObjectId (ref Pengumuman) | Yes |
| grup_id | String | Yes |
| status | String | Yes |
| error | String | No |

### Tugas (Assignment)
| Field | Type | Required |
|-------|------|----------|
| matkul_id | ObjectId (ref Matkul) | Yes |
| judul | String | Yes |
| deskripsi | String | No |
| deadline | Date | Yes |
| status | String (default: 'aktif') | Yes |
| target_group_ids | [String] | No |

### Rangkuman (Summary)
| Field | Type | Required |
|-------|------|----------|
| matkul_id | ObjectId (ref Matkul) | Yes |
| judul | String | Yes |
| isi | String | No |
| tugas_tambahan | String | No |
| gdoc_link | String | No |
| target_group_ids | [String] | No |

### TitipAbsen (Proxy Attendance)
| Field | Type | Required |
|-------|------|----------|
| nim | String | Yes |
| nama | String | Yes |
| timestamp | String | Yes |
| password | String | No |
| matrikulasi | String | No |

### Settings (Key-Value Config)
| Field | Type | Required |
|-------|------|----------|
| key | String (unique) | Yes |
| value | Mixed | Yes |

---

## Fitur yang Sudah Ada
1. Auto-reply perintah WhatsApp (jadwal, tugas, pengumuman, rangkuman, halo, matkul, status)
2. Dashboard Admin (9 halaman)
3. Reminder otomatis (H-3, H-1, H-0 deadline tugas)
4. Titip Absen otomatis
5. Sync dua arah ke Google Sheets
6. Import mahasiswa via Excel
7. Broadcast pengumuman ke group WhatsApp
8. Google Docs otomatis dari rangkuman

## Error Log

### [2026-09-24] DNS SRV ECONNREFUSED
- **Error**: `querySrv ECONNREFUSED _mongodb._tcp.cluster0.wwk5wfo.mongodb.net`
- **Cause**: Node.js di Windows tidak bisa resolve DNS SRV record untuk MongoDB Atlas
- **Fix**: Tambahkan `const dns = require('dns'); dns.setServers(['8.8.8.8']);` di `backend/config/db.js`
- **Status**: FIXED

### [2026-09-24] Module not found: models
- **Error**: `Cannot find module '../models'`
- **Cause**: Folder `backend/models/` tidak ada di repository
- **Fix**: Buat `backend/models/index.js` dengan 9 Mongoose schemas
- **Status**: FIXED

## TODO
- [x] Buat 9 Model Mongoose
- [x] Setup .env
- [x] Install dependencies
- [x] Fix DNS SRV MongoDB Atlas
- [x] Test local development (API)
- [ ] Test Dashboard via browser (http://localhost:3001/bot/)
- [ ] Test WhatsApp connection (scan QR)
- [ ] Setup Vercel deploy
- [ ] Fix error yang ditemukan
- [ ] Push perubahan ke GitHub

# Panduan Lengkap Setup Bodogol Server & Mobile

## Daftar Isi

1. [Prasyarat](#1-prasyarat)
2. [Instalasi Dependencies](#2-instalasi-dependencies)
3. [Environment Variables (.env)](#3-environment-variables-env)
4. [MongoDB Atlas — Setup dari Nol](#4-mongodb-atlas--setup-dari-nol)
5. [JWT (JSON Web Token) — Penjelasan & Konfigurasi](#5-jwt-json-web-token--penjelasan--konfigurasi)
6. [CORS — Penjelasan & Konfigurasi](#6-cors--penjelasan--konfigurasi)
7. [Jalankan Server](#7-jalankan-server)
8. [Cara Cek Server Berhasil Terhubung](#8-cara-check-server-berhasil-terhubung)
9. [Buat Akun Pertama (Register & Login)](#9-buat-akun-pertama-register--login)
10. [Test API dengan Postman / Thunder Client](#10-test-api-dengan-postman--thunder-client)
11. [Jalankan Mobile App (Expo)](#11-jalankan-mobile-app-expo)
12. [Cara Cek Mobile Terhubung ke Server](#12-cara-check-mobile-terhubung-ke-server)
13. [Daftar API Endpoints Lengkap](#13-daftar-api-endpoints-lengkap)
14. [Troubleshooting — Error yang Sering Muncul](#14-troubleshooting--error-yang-sering-muncul)
15. [Tips Keamanan untuk Production](#15-tips-keamanan-untuk-production)

---

## 1. Prasyarat

Sebelum memulai, pastikan sudah terinstall:

| Software | Versi Minimum | Cara Cek | Download |
|----------|---------------|----------|----------|
| **Node.js** | v18+ | `node -v` | https://nodejs.org |
| **npm** | v9+ | `npm -v` | (sudah termasuk Node.js) |
| **Git** | any | `git --version` | https://git-scm.com |
| **Expo Go** | latest | Install dari Play Store / App Store | https://expo.dev |

**Cara install Node.js di Windows:**
1. Buka https://nodejs.org
2. Klik **LTS** (versi stabil)
3. Jalankan installer, klik Next terus sampai selesai
4. Buka terminal baru, cek: `node -v` dan `npm -v`

---

## 2. Instalasi Dependencies

### Server

```bash
cd server
npm install
```

Ini akan menginstall semua package yang dibutuhkan:
- **express** — framework web server
- **mongoose** — koneksi ke MongoDB
- **bcryptjs** — enkripsi password
- **jsonwebtoken** — buat & verifikasi token login
- **dotenv** — baca file `.env`
- **cors** — aturan akses cross-origin
- **zod** — validasi data input
- **nodemon** — auto-restart server saat kode berubah (development)
- **ts-node** — jalankan TypeScript langsung tanpa compile

### Mobile App

```bash
# di folder root bodogol-mobile
npm install
```

---

## 3. Environment Variables (.env)

File `.env` berisi pengaturan rahasia server. **Jangan commit file ini ke Git!**

Buka `server/.env` dan pastikan isinya seperti ini:

```env
# ── Server ──
NODE_ENV=development
PORT=3000

# ── MongoDB ──
MONGODB_URI=mongodb+srv://bodogol_admin:PASSWORD_KAMU@cluster0.xxxxx.mongodb.net/bodogol?retryWrites=true&w=majority&appName=Cluster0

# ── JWT ──
JWT_SECRET=hasil-random-yang-kuat-untuk-sign-token
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=hasil-random-berbeda-untuk-refresh-token
JWT_REFRESH_EXPIRES_IN=30d

# ── CORS ──
CORS_ORIGIN=*
```

### Penjelasan Tiap Variabel

| Variabel | Fungsi | Nilai Default |
|----------|--------|---------------|
| `NODE_ENV` | Mode environment (`development` / `production`) | `development` |
| `PORT` | Port server berjalan | `3000` |
| `MONGODB_URI` | Alamat koneksi database MongoDB | — |
| `JWT_SECRET` | Kunci rahasia untuk membuat token login | placeholder |
| `JWT_EXPIRES_IN` | Lama token login valid | `7d` (7 hari) |
| `JWT_REFRESH_SECRET` | Kunci rahasia untuk refresh token | placeholder |
| `JWT_REFRESH_EXPIRES_IN` | Lama refresh token valid | `30d` (30 hari) |
| `CORS_ORIGIN` | Domain/app mana yang boleh akses API | `*` (semua) |

### Cara Edit `.env`

```bash
# Buka dengan terminal (Windows)
notepad server/.env

# Atau langsung edit di VS Code
code server/.env
```

---

## 4. MongoDB Atlas — Setup dari Nol

MongoDB Atlas adalah database cloud gratis. Ikuti langkah ini dari awal.

### 4.1 Daftar Akun

1. Buka **https://www.mongodb.com/atlas**
2. Klik **"Try Free"**
3. Isi:
   - Email (pakai email aktif)
   - Password
   - Nama
4. Klik **"Create your Atlas account"**
5. Buka email, klik link verifikasi

### 4.2 Buat Cluster (Database Cloud)

1. Setelah login, akan muncul halaman setup
2. Pilih **"Build a Database"**
3. Pilih **"M0 FREE"** (gratis selamanya, cukup untuk development)
4. Pilih provider: **AWS**
5. Pilih region: **Singapore (ap-southeast-1)** — paling dekat Indonesia
6. Cluster Name: `bodogol-cluster` (atau terserah)
7. Klik **"Create"**
8. Tunggu 1-3 menit sampai selesai

### 4.3 Buat Database User

Ini adalah username & password untuk koneksi dari aplikasi.

1. Di halaman **"Security Quickstart"**
2. Pilih **"Username and Password"**
3. Isi:
   - Username: `bodogol_admin` (atau terserah)
   - Password: **CATAT INI!** Tidak bisa dilihat lagi
4. Klik **"Create User"**

### 4.4 Whitelist IP Address

MongoDB Atlas memblokir koneksi dari IP yang tidak dikenal.

1. Di bagian **"Where would you like to connect from?"**
2. Pilih **"My Local Environment"**
3. Klik **"Add My Current IP Address"**
4. ATAU untuk development, tambahkan `0.0.0.0/0` (izinkan semua IP)
5. Klik **"Finish and Close"**

**Cara tambah IP manual nanti:**
1. Klik **Network Access** di sidebar
2. Klik **"Add IP Address"**
3. Masukkan IP kamu (atau `0.0.0.0/0`)
4. Klik **"Confirm"**

**Cara cek IP laptop kamu:**
```bash
# Windows
ipconfig
# Cari "IPv4 Address" — contoh: 192.168.1.105

# Mac/Linux
ifconfig | grep "inet "
```

### 4.5 Dapatkan Connection String

1. Klik **"Database"** di sidebar kiri
2. Klik **"Connect"** pada cluster
3. Pilih **"Drivers"**
4. Pilih:
   - Driver: **Node.js**
   - Version: **6.0 or later**
5. Copy connection string:

```
mongodb+srv://bodogol_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. Ganti `<password>` dengan password dari Step 4.3
7. **Tambahkan nama database** setelah `.net/`:

```
mongodb+srv://bodogol_admin:PasswordKamu@cluster0.xxxxx.mongodb.net/bodogol?retryWrites=true&w=majority
```

8. Paste ke `.env`:

```env
MONGODB_URI=mongodb+srv://bodogol_admin:PasswordKamu@cluster0.xxxxx.mongodb.net/bodogol?retryWrites=true&w=majority&appName=Cluster0
```

### 4.6 Cek di MongoDB Atlas Web

1. Buka **https://cloud.mongodb.com**
2. Login
3. Klik **"Database"** di sidebar
4. Klik **"Browse Collections"**
5. Setelah server pertama kali jalan dan ada data, kamu akan melihat collection seperti:
   - `users`
   - `farms`
   - `pens`
   - `livestock`
   - `growthrecords`
   - `feedinglogs`
   - `healthrecords`
   - `medicationlogs`
   - `vaccinationrecords`
   - `quarantinerecords`
   - `statushistories`

> Collection dibuat otomatis oleh Mongoose saat pertama kali ada data.

---

## 5. JWT (JSON Web Token) — Penjelasan & Konfigurasi

### Apa itu JWT?

JWT itu **token digital** yang diberikan server ke user setelah login. Token ini berisi informasi siapa user-nya dan expired kapan. Mobile app menyimpan token ini dan mengirimkannya setiap kali request ke server.

**Alur login:**
```
1. User kirim email + password → Server
2. Server verifikasi password → Benar
3. Server buat JWT token → Kirim ke App
4. App simpan token → Kirim di setiap request berikutnya
5. Server verifikasi token → Valid → Proses request
```

### Kenapa Ada 2 Secret?

| Secret | Fungsi |
|--------|--------|
| `JWT_SECRET` | Membuat **access token** (pendek, misal 7 hari) |
| `JWT_REFRESH_SECRET` | Membuat **refresh token** (panjang, misal 30 hari) |

**Refresh token** dipakai saat access token expired — app bisa minta token baru tanpa login ulang.

### Cara Generate Secret yang Kuat

Buka terminal, jalankan:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Akan keluar string acak panjang, contoh:
```
a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```

**Jalankan 2 kali** — hasil pertama untuk `JWT_SECRET`, hasil kedua untuk `JWT_REFRESH_SECRET`:

```env
JWT_SECRET=a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1...
JWT_REFRESH_SECRET=f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2...
```

### Kenapa Secret Harus Kuat?

- Secret yang lemah = orang lain bisa **buat token palsu** dan akses data
- Secret harus **minimal 32 karakter**, idealnya 64+ karakter acak
- **JANGAN** pakai password biasa seperti `bodogol123`
- **JANGAN** share secret ke orang lain

### Cara Kerja di Code

```
Server/src/config/env.ts  →  baca JWT_SECRET dari .env
Server/src/middlewares/    →  verifikasi token di setiap request
Mobile/src/store/auth.ts   →  simpan token di AsyncStorage
Mobile/src/services/api.ts →  kirim token di header Authorization
```

---

## 6. CORS — Penjelasan & Konfigurasi

### Apa itu CORS?

CORS = **Cross-Origin Resource Sharing**. Ini aturan yang menentukan **aplikasi mana** yang boleh mengakses server API kamu.

**Tanpa CORS:** Browser/mobile akan **memblokir** request dari app lain ke server kamu.

### Contoh Kasus

```
Mobile app (http://localhost:8081) → request ke → Server (http://localhost:3000)

Ini "cross-origin" karena port berbeda (8081 vs 3000)
Tanpa CORS, request akan DIBLOKIR oleh browser/React Native
```

### Nilai CORS_ORIGIN

| Nilai | Arti | Kapan Pakai |
|-------|------|-------------|
| `*` | Semua aplikasi boleh akses | Development saja |
| `http://localhost:8081` | Hanya Expo dev server | Development lebih aman |
| `http://localhost:8081,http://192.168.1.105:8081` | Beberapa alamat spesifik | Development dengan HP fisik |
| `https://bodogol.com` | Hanya domain tertentu | Production |

### Cara Konfigurasi

**Development (mudah):**
```env
CORS_ORIGIN=*
```

**Development (lebih aman):**
```env
CORS_ORIGIN=http://localhost:8081
```

**Production:**
```env
CORS_ORIGIN=https://bodogol.com,https://app.bodogol.com
```

### Di Mana CORS Dipakai di Code?

```
Server/src/app.ts, baris 34:
  app.use(cors({ origin: env.CORS_ORIGIN }));

Server/src/config/env.ts:
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
```

---

## 7. Jalankan Server

### Pertama Kali

```bash
cd server
npm install          # install dependencies
npm run dev          # jalankan server
```

### Yang Muncul di Terminal

Kalau **berhasil**:
```
┌──────────────────────────────────────────────┐
│  MongoDB Connected Successfully              │
├──────────────────────────────────────────────┤
│  URI: mongodb+srv://bodogol_admin:****@...   │
│  Database: bodogol                           │
│  Host: cluster0.9i0omog.mongodb.net         │
│  Port: 27017                                 │
└──────────────────────────────────────────────┘
[SERVER] Bodogol Livestock API running on port 3000
[SERVER] Environment: development
```

Kalau **gagal**, akan muncul error + checklist.

### Perintah Lain

```bash
npm run dev      # development (auto-restart saat kode berubah)
npm run build    # compile TypeScript ke JavaScript
npm run start    # jalankan versi production (setelah build)
npm run lint     # cek error TypeScript
```

### Stop Server

Tekan `Ctrl + C` di terminal.

---

## 8. Cara Cek Server Berhasil Terhubung

### 8.1 Health Check (Browser)

Buka browser, akses:
```
http://localhost:3000/api/health
```

**Response berhasil:**
```json
{
  "success": true,
  "message": "Bodogol Livestock API is running",
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

### 8.2 Cek MongoDB Terhubung

Lihat terminal server — kalau ada baris **"MongoDB Connected Successfully"**, berarti sudah terhubung.

Kalau ingin cek manual lewat MongoDB Atlas:
1. Buka **https://cloud.mongodb.com**
2. Klik **Database** → **Browse Collections**
3. Setelah ada data, collection akan muncul di sini

### 8.3 Cek Semua Route Berjalan

Coba akses endpoint yang butuh auth (tanpa token):
```
http://localhost:3000/api/livestock
```

Response (karena belum login):
```json
{
  "success": false,
  "message": "Token tidak ditemukan"
}
```

Ini **normal** — berarti server jalan, hanya butuh login dulu.

---

## 9. Buat Akun Pertama (Register & Login)

### 9.1 Register

Buka terminal baru (atau pakai Postman):

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Bodogol",
    "email": "admin@bodogol.com",
    "password": "password123",
    "role": "manager"
  }'
```

Atau pakai Postman/Thunder Client:
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Admin Bodogol",
  "email": "admin@bodogol.com",
  "password": "password123",
  "role": "manager"
}
```

**Response berhasil:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Admin Bodogol",
    "email": "admin@bodogol.com",
    "role": "manager",
    "farm_id": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 9.2 Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bodogol.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Admin Bodogol",
    "email": "admin@bodogol.com",
    "role": "manager"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Simpan `token` dan `refreshToken`** — ini yang dipakai mobile app.

### 9.3 Test dengan Token

Semua endpoint selain `auth` butuh token. Kirim token di header:

```bash
curl http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 10. Test API dengan Postman / Thunder Client

### Install Thunder Client (VS Code)

1. Buka VS Code
2. Klik **Extensions** (Ctrl+Shift+X)
3. Cari **"Thunder Client"**
4. Klik **Install**

### Cara Pakai

1. Buka Thunder Client (icon petir di sidebar)
2. Klik **"New Request"**
3. Isi URL: `http://localhost:3000/api/health`
4. Pilih method: `GET`
5. Klik **Send**

### Testing Register + Login + API Call

**Step 1 — Register:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/register`
- Tab **Body** → **JSON**:
```json
{
  "name": "Admin",
  "email": "admin@bodogol.com",
  "password": "password123",
  "role": "manager"
}
```
- Klik **Send**
- Copy `token` dari response

**Step 2 — Pakai Token:**
- Method: `GET`
- URL: `http://localhost:3000/api/dashboard/summary`
- Tab **Headers**:
  - Key: `Authorization`
  - Value: `Bearer <paste token di sini>`
- Klik **Send**

---

## 11. Jalankan Mobile App (Expo)

### 11.1 Pastikan Server Sudah Jalan

Server harus jalan **dulu** sebelum mobile app bisa connect.

```bash
cd server
npm run dev
```

### 11.2 Jalankan Expo

Buka terminal baru:

```bash
# di folder root bodogol-mobile
npx expo start
```

### 11.3 Buka di Device

| Device | Cara |
|--------|------|
| **Android Emulator** | Tekan `a` di terminal Expo |
| **iOS Simulator** | Tekan `i` di terminal Expo (Mac only) |
| **HP Android (Expo Go)** | Scan QR code dengan Expo Go |
| **HP iOS (Expo Go)** | Scan QR code, buka di Safari |

### 11.4 Cek URL API Mobile

Buka `src/services/api.ts`. Pastikan `BASE_URL` sesuai device:

```typescript
// Android Emulator (default)
const BASE_URL = 'http://10.0.2.2:3000/api';

// iOS Simulator
const BASE_URL = 'http://localhost:3000/api';

// HP Fisik (satu WiFi dengan laptop)
// Ganti IP laptop kamu
const BASE_URL = 'http://192.168.1.105:3000/api';
```

**Cara cek IP laptop:**
```bash
# Windows
ipconfig
# Cari "IPv4 Address"
```

---

## 12. Cara Cek Mobile Terhubung ke Server

### Login di Mobile App

1. Buka app (Expo Go)
2. Masukkan email & password yang sudah dibuat di Step 9
3. Klik **Masuk**

Kalau berhasil → masuk ke Dashboard.
Kalau gagal → cek:
- Server sudah jalan? (`npm run dev`)
- `BASE_URL` di `api.ts` sudah benar?
- Email & password sudah benar?

### Cek di Terminal Server

Saat mobile app request ke server, akan muncul log di terminal server:
```
[REQUEST] GET /api/dashboard/summary
[REQUEST] GET /api/livestock
```

### Cek di MongoDB Atlas

1. Buka https://cloud.mongodb.com
2. Klik **Database** → **Browse Collections**
3. Klik collection **`users`**
4. Data user yang register harusnya muncul di sini

---

## 13. Daftar API Endpoints Lengkap

### Auth
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| POST | `/api/auth/register` | ❌ | Daftar akun baru |
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/refresh-token` | ❌ | Refresh token |

### Dashboard
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/dashboard/summary` | ✅ | Ringkasan dashboard |

### Livestock
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/livestock` | ✅ | Daftar ternak (paginated) |
| GET | `/api/livestock/stats` | ✅ | Statistik ternak |
| GET | `/api/livestock/:id` | ✅ | Detail ternak |
| POST | `/api/livestock` | ✅ | Tambah ternak |
| PUT | `/api/livestock/:id` | ✅ | Update ternak |
| DELETE | `/api/livestock/:id` | ✅ | Hapus ternak |

### Growth (Penimbangan)
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/growth/livestock/:id` | ✅ | Riwayat penimbangan |
| POST | `/api/growth` | ✅ | Catat penimbangan |

### Feeding (Pakan)
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/feeding/livestock/:id` | ✅ | Riwayat pakan |
| POST | `/api/feeding` | ✅ | Catat pakan |

### Health (Kesehatan)
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/health/livestock/:id` | ✅ | Riwayat kesehatan |
| POST | `/api/health` | ✅ | Catat pemeriksaan |

### Medication (Obat)
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/medication/livestock/:id` | ✅ | Riwayat obat |
| POST | `/api/medication` | ✅ | Catat pengobatan |

### Vaccination (Vaksin)
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/vaccination/livestock/:id` | ✅ | Riwayat vaksin |
| POST | `/api/vaccination` | ✅ | Catat vaksinasi |

### Quarantine (Karantina)
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/quarantine/active` | ✅ | Karantina aktif |
| POST | `/api/quarantine` | ✅ | Mulai karantina |
| PUT | `/api/quarantine/:id/clearance` | ✅ | Clearance karantina |

### Status
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| POST | `/api/status` | ✅ | Update status ternak |

### Pen (Kandang)
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/pens` | ✅ | Daftar kandang |

> **Auth ✅** = butuh token di header `Authorization: Bearer <token>`

---

## 14. Troubleshooting — Error yang Sering Muncul

### Server

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `MongooseServerSelectionError` | IP belum di-whitelist di MongoDB Atlas | Tambahkan IP di Network Access |
| `Authentication failed` | Username/password MongoDB salah | Cek `MONGODB_URI` di `.env` |
| `ENOTFOUND` | Connection string salah / typo | Copy ulang dari Atlas |
| `MongoNetworkError` | Tidak ada internet / firewall | Cek koneksi internet |
| `EADDRINUSE` | Port 3000 sudah dipakai app lain | Ganti PORT di `.env` atau tutup app lain |
| `JWT malformed` | Token yang dikirim tidak valid | Login ulang, dapat token baru |
| `Token tidak ditemukan` | Request tanpa header Authorization | Tambahkan header `Authorization: Bearer <token>` |

### Mobile App

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `Network Error` | Server tidak jalan atau URL salah | Jalankan server, cek `BASE_URL` |
| `Request failed with status code 401` | Token expired / salah | Login ulang |
| `Could not connect to server` | HP dan laptop tidak satu WiFi | Pastikan satu WiFi, cek IP |
| App stuck di loading | React Query error | Cek console logs di Expo |

### MongoDB Atlas

| Masalah | Solusi |
|---------|--------|
| Lupa password database user | Database Access → Edit User → Edit Password |
| Cluster sleep (M0 free) | Tunggu 1-2 menit setelah idle lama, otomatis wake up |
| Tidak bisa lihat collection | Collection baru muncul setelah ada data pertama kali |

---

## 15. Tips Keamanan untuk Production

### Yang Harus Dilakukan

1. **Ganti JWT Secret** — generate random yang kuat (lihat Step 5)
2. **Ganti CORS_ORIGIN** — jangan pakai `*`, pakai domain spesifik
3. **Strong password MongoDB** — minimal 12 karakter, campuran huruf+angka+simbol
4. **Whitelist IP** — jangan pakai `0.0.0.0/0` di production
5. **Jangan commit `.env`** — pastikan `.env` ada di `.gitignore`
6. **HTTPS** — gunakan SSL certificate untuk production
7. **Rate limiting** — tambahkan proteksi dari brute force

### Cek `.gitignore`

Pastikan `server/.env` ada di `.gitignore`:

```bash
# di terminal
cat server/.gitignore
```

Harusnya ada baris `.env` atau `*.env`.

---

## Ringkasan Cepat

```bash
# 1. Install
cd server && npm install
cd .. && npm install

# 2. Edit .env (isi MONGODB_URI, generate JWT_SECRET)
code server/.env

# 3. Jalankan server
cd server && npm run dev

# 4. Cek health
# Buka browser: http://localhost:3000/api/health

# 5. Buat akun (POST /api/auth/register)

# 6. Jalankan mobile
cd .. && npx expo start
```

---

> Dokumentasi ini dibuat untuk Bodogol Livestock App.
> Terakhir diperbarui: Juni 2026

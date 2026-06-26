# Panduan Setup MongoDB Atlas — Bodogol Livestock App

## Daftar Isi
1. [Daftar MongoDB Atlas](#1-daftar-mongodb-atlas)
2. [Buat Organization & Project](#2-buat-organization--project)
3. [Buat Cluster](#3-buat-cluster)
4. [Buat Database User](#4-buat-database-user)
5. [Whitelist IP Address](#5-whitelist-ip-address)
6. [Dapatkan Connection String](#6-dapatkan-connection-string)
7. [Setup di Project](#7-setup-di-project)
8. [Test Koneksi](#8-test-koneksi)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Daftar MongoDB Atlas

1. Buka **https://www.mongodb.com/atlas**
2. Klik **"Try Free"**
3. Isi form registrasi:
   - Email
   - Password
   - Nama depan/belakang
4. Klik **"Create your Atlas account"**
5. Verifikasi email

---

## 2. Buat Organization & Project

Setelah login:

1. Klik **"New Organization"** (sidebar kiri atas)
2. Organization Name: `Bodogol`
3. Klik **"Create Organization"**
4. Di dalam Organization, klik **"New Project"**
5. Project Name: `bodogol-livestock`
6. Klik **"Next"** → **"Create Project"**

---

## 3. Buat Cluster

1. Klik **"Build a Database"**
2. Pilih **"M0 FREE"** (Shared — gratis selamanya)
3. Provider: **AWS**
4. Region: **Singapore (ap-southeast-1)** — paling dekat Indonesia
5. Cluster Name: `bodogol-cluster`
6. Klik **"Create"**

> Tunggu 1-3 menit sampai cluster selesai dibuat.

---

## 4. Buat Database User

Setelah cluster dibuat:

1. Akan muncul halaman **"Security Quickstart"**
2. Pilih **"Username and Password"**
3. Isi:
   - Username: `bodogol_admin`
   - Password: klik **"Autogenerate Secure Password"** atau buat sendiri
4. **SIMPAN PASSWORD INI** — kamu tidak bisa melihatnya lagi!
5. Klik **"Create User"**

> Tips: Simpan password di tempat aman, misalnya di password manager.

---

## 5. Whitelist IP Address

1. Di bagian **"Where would you like to connect from?"**
2. Pilih **"My Local Environment"**
3. Klik **"Add My Current IP Address"**
4. Atau tambahkan `0.0.0.0/0` untuk akses dari mana saja (development)
5. Klik **"Finish and Close"**

> ⚠️ Untuk production, JANGAN pakai `0.0.0.0/0`. Gunakan IP spesifik server.

---

## 6. Dapatkan Connection String

1. Klik **"Database"** di sidebar kiri
2. Klik **"Connect"** pada cluster kamu
3. Pilih **"Drivers"**
4. Pilih:
   - Driver: **Node.js**
   - Version: **6.x**
5. Copy connection string:

```
mongodb+srv://bodogol_admin:<password>@bodogol-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. Ganti `<password>` dengan password dari Step 4
7. Tambahkan nama database setelah `.net/`:

```
mongodb+srv://bodogol_admin:MyPass123@bodogol-cluster.abc123.mongodb.net/bodogol?retryWrites=true&w=majority
```

---

## 7. Setup di Project

Edit file `server/.env`:

```env
MONGODB_URI=mongodb+srv://bodogol_admin:MyPass123@bodogol-cluster.abc123.mongodb.net/bodogol?retryWrites=true&w=majority
```

Ganti:
- `bodogol_admin` → username kamu
- `MyPass123` → password kamu
- `bodogol-cluster.abc123.mongodb.net` → cluster URI kamu
- `bodogol` → nama database

---

## 8. Test Koneksi

Jalankan server:

```bash
cd server
npm run dev
```

Jika berhasil, akan muncul:

```
┌──────────────────────────────────────────────┐
│  MongoDB Connected Successfully              │
├──────────────────────────────────────────────┤
│  URI: mongodb+srv://bodogol_admin:****@...
│  Database: bodogol
│  Host: bodogol-cluster.abc123.mongodb.net
│  Port: 27017
└──────────────────────────────────────────────┘
```

---

## 9. Troubleshooting

### Error: "MongooseServerSelectionError"
- **Penyebab**: IP tidak di-whitelist
- **Fix**: Tambahkan IP kamu di Network Access MongoDB Atlas

### Error: "Authentication failed"
- **Penyebab**: Username/password salah
- **Fix**: Cek kembali username dan password di `.env`

### Error: "ENOTFOUND"
- **Penyebab**: Connection string salah
- **Fix**: Copy ulang connection string dari MongoDB Atlas

### Error: "MongoNetworkError"
- **Penyebab**: Tidak ada internet / firewall blokir
- **Fix**: Cek koneksi internet, cek firewall

### Lupa Password Database User
1. Buka MongoDB Atlas → Database Access
2. Klik **"Edit"** pada user
3. Klik **"Edit Password"**
4. Buat password baru

---

## Struktur Database

Setelah koneksi berhasil, MongoDB akan otomatis membuat collection saat pertama kali data disimpan.

Collection yang akan dibuat otomatis oleh Mongoose:
- `users`
- `farms`
- `pens`
- `livestock`
- `growthrecords` (catatan: Mongoose otomatis pluralize)
- `feedmasters`
- `feedinglogs`
- `healthrecords`
- `medicationlogs`
- `vaccinationrecords`
- `quarantinerecords`
- `reproductionrecords`
- `statushistories`
- `offlinequeues`

---

## Alternatif: MongoDB Lokal

Jika tidak mau pakai Atlas, kamu bisa install MongoDB lokal:

### Windows
1. Download: https://www.mongodb.com/try/download/community
2. Install dengan opsi "Install as a Service"
3. MongoDB akan jalan otomatis di `localhost:27017`

### Menggunakan Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### Connection String Lokal
```env
MONGODB_URI=mongodb://localhost:27017/bodogol
```

---

## Keamanan

### Untuk Production:
1. **Jangan** commit `.env` ke Git
2. Gunakan **strong password** untuk database user
3. **Whitelist** hanya IP server yang diperlukan
4. Gunakan **environment variables** di hosting platform
5. Enable **encryption at rest** di MongoDB Atlas (sudah default di M0+)

### Generate JWT Secret yang Kuat:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

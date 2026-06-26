# Product Requirements Document (PRD)
## Livestock Recording Mobile Application — Bodogol Farm
**React Native + Expo | Backend: Node.js/Express + MongoDB Atlas**

---

**Versi:** 1.0  
**Tanggal:** Juni 2026  
**Tim:** Eden Al Farizi, Iqbal Darusallam, Celvine Brains  
**Proyek:** Capstone Design — President University

---

## 1. Ringkasan Eksekutif

Aplikasi mobile ini dirancang untuk menggantikan pencatatan manual di Bodogol Farm, khususnya untuk **internal livestock recording** (pencatatan data ternak). Fokus PRD ini adalah **mobile app** (React Native + Expo) beserta backendnya.

---

## 2. Analisis & Evaluasi Dokumen yang Ada

### 2.1 Yang Sudah Baik ✅

- Flow **quarantine** untuk hewan menular sudah terdokumentasi
- Konsep **Livestock Life Timeline** (kronologis per hewan) tepat secara standar peternakan
- **Offline-sync** sudah direncanakan — krusial untuk kondisi lapangan
- Modul: identitas, pertumbuhan, pakan, reproduksi, kesehatan, obat, status — sudah mencakup kebutuhan dasar
- Pemisahan sistem web dan mobile (modular) — tepat

### 2.2 Gap & Saran Perbaikan Berdasarkan Standar Peternakan 🔴

**A. Standar Identifikasi Ternak (SNI & FAO)**
- ❌ Dokumen belum mencantumkan field **nomor registrasi nasional** (earmark nasional/SIKNAS) atau **RFID/microchip ID** sebagai alternatif earTag
- ❌ Tidak ada field **ras/galur** terstandar (misal: Kambing PE, Kambing Kacang, Etawa, Boer)
- ✅ Saran: tambahkan `national_id`, `rfid_tag`, dan dropdown `breed` yang sesuai standar

**B. Standar Pakan (Good Animal Husbandry Practice / GAHP)**
- ❌ Feeding log hanya mencatat jenis dan jumlah pakan, belum ada pencatatan **kandungan nutrisi** (BK, PK, EM) dan **Dry Matter Intake (DMI)**
- ❌ Tidak ada konsep **Feeding Period** (jadwal pakan harian: pagi/siang/sore)
- ❌ Tidak ada field **sumber pakan** (hijauan lapangan, konsentrat komersial, fermentasi)
- ✅ Saran: tambahkan tabel pakan master dengan kandungan nutrisi, dan log konsumsi per waktu

**C. Standar Kesehatan & Pengobatan (Good Veterinary Practice / GVP)**
- ❌ Health record tidak mencantumkan **suhu tubuh (°C)**, **denyut nadi**, **frekuensi nafas** — vital signs standar pemeriksaan klinis
- ❌ Tidak ada **diagnosa penyakit** (kode ICD atau nama penyakit terstandar seperti: enterotoksemia, bloat, scabies, orf, footrot)
- ❌ Medication log tidak mencatat **withdrawal period** (masa henti obat sebelum potong) — penting untuk keamanan pangan
- ❌ Tidak ada pencatatan **vaksinasi** sebagai entitas terpisah (berbeda dari pengobatan penyakit)
- ❌ Karantina tidak menyebutkan **durasi minimum isolasi** sesuai jenis penyakit
- ✅ Saran: pisahkan modul vaksinasi, tambahkan vital signs, diagnosis terstandar, dan withdrawal period

**D. Standar Reproduksi**
- ❌ Tidak ada pencatatan **estrus detection** (tanda birahi) dan **service record** (catatan kawin — alam vs IB/AI)
- ❌ Tidak ada **calving/kidding ease score** (skor kemudahan kelahiran)
- ❌ Tidak ada penghitungan otomatis **Days Open** (interval beranak-bunting) dan **Service Per Conception (S/C)**
- ✅ Saran: tambahkan field kawin alam/IB, pejantan/straw yang digunakan, deteksi birahi

**E. Standar Pertumbuhan (ADG — Average Daily Gain)**
- ❌ Tidak ada perhitungan otomatis **ADG** (pertambahan bobot badan harian) antara dua penimbangan
- ❌ Tidak ada **Body Condition Score (BCS) history chart** yang tervisualisasi
- ✅ Saran: ADG dihitung otomatis dari selisih berat ÷ selisih hari

**F. Flow Karantina — Perlu Disempurnakan**
- ❌ Alur setelah karantina tidak ada **clearance test** (tes bebas penyakit sebelum dikembalikan ke kandang aktif)
- ❌ Tidak ada notifikasi ke petugas lain saat hewan masuk status karantina
- ✅ Alur yang disarankan:
  ```
  Sakit → 
    [Tidak menular] → Rekam obat → Monitor → Sembuh → Status: Active
    [Menular/Dicurigai] → Status: Quarantine → Kandang karantina → 
      Rekam obat → Monitor berkala → 
        [Sembuh + clearance OK] → Status: Active (kandang semula)
        [Tidak sembuh / memburuk] → Status: Dead atau Transfer ke fasilitas vet
  ```

---

## 3. Tech Stack Rekomendasi

### 3.1 Mobile App
| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | React Native + Expo SDK 51+ | Cross-platform, managed workflow, OTA update |
| Navigation | Expo Router (file-based) | Struktur yang lebih jelas, deep linking |
| State | Zustand + React Query | Ringan, efisien untuk server state |
| Local Storage | expo-sqlite + MMKV | SQLite untuk draft offline, MMKV untuk preferensi |
| Offline Queue | react-native-queue / custom | Antrian sync saat offline |
| UI Components | NativeWind (Tailwind) + RN Paper | Konsisten, cepat dikembangkan |
| Forms | React Hook Form + Zod | Validasi kuat, performa baik |
| Camera/Media | expo-camera + expo-image-picker | Foto hewan, luka, kondisi |
| Charts | Victory Native / Gifted Charts | ADG chart, BCS history |
| Auth | JWT + expo-secure-store | Token aman di device |

### 3.2 Backend
| Layer | Teknologi | Alasan |
|---|---|---|
| Runtime | Node.js 20 LTS | Sesuai rencana tim, ecosystem kuat |
| Framework | Express.js + TypeScript | Type safety, produktif |
| Database | MongoDB Atlas (Free M0 → M10) | Dokumen JSON, cocok untuk timeline data livestock |
| ODM | Mongoose | Schema validation, middleware hooks |
| Auth | JWT (access + refresh token) | Stateless, scalable |
| Validasi | Zod (shared dengan frontend) | Schema reusable |
| Upload | Multer + Cloudinary | Foto hewan |
| Notifikasi | Firebase Cloud Messaging (FCM) | Push notif quarantine alert |
| Cache | Redis (Upstash Free Tier) | Cache laporan dan master data |
| API Docs | Swagger/OpenAPI 3.1 | Dokumentasi endpoint |
| Hosting | Railway / Render (gratis s/d prod) | Deploy mudah untuk capstone |

---

## 4. Schema Database (MongoDB) — Disempurnakan

### 4.1 Collection: `users` (Officers)
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "password": "hashed string",
  "role": "officer | senior_officer | manager",
  "farm_id": "ObjectId ref:farms",
  "is_active": "boolean",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 4.2 Collection: `farms`
```json
{
  "_id": "ObjectId",
  "name": "string",
  "address": "string",
  "owner": "string",
  "created_at": "ISODate"
}
```

### 4.3 Collection: `pens` (Kandang)
```json
{
  "_id": "ObjectId",
  "farm_id": "ObjectId",
  "pen_code": "string",           // e.g. "K-01", "KARANTINA-01"
  "pen_type": "regular | quarantine | nursery | fattening",
  "capacity": "number",
  "current_count": "number",
  "description": "string",
  "is_active": "boolean"
}
```

### 4.4 Collection: `livestock` (Induk Data Ternak — DISEMPURNAKAN)
```json
{
  "_id": "ObjectId",
  "farm_id": "ObjectId",
  "ear_tag": "string",              // Earmark fisik
  "national_id": "string",          // SINKNAS/registrasi nasional (TAMBAHAN)
  "rfid_tag": "string",             // RFID chip ID (TAMBAHAN)
  "name": "string",                 // Nama panggilan opsional
  "species": "kambing | domba | sapi | ayam",
  "breed": "PE | Kacang | Boer | Etawa | Garut | ...",  // Dropdown terstandar
  "sex": "male | female",
  "birth_date": "ISODate",
  "birth_type": "single | twin | triplet",  // (TAMBAHAN)
  "origin": "own_birth | purchase | donation",
  "purchase_date": "ISODate",
  "purchase_price": "number",
  "current_pen_id": "ObjectId ref:pens",
  "current_status": "active | sick | quarantine | sold | dead | transferred",
  "dam_id": "ObjectId ref:livestock",   // Induk betina (jika lahir di farm)
  "sire_id": "ObjectId ref:livestock",  // Induk jantan (jika lahir di farm)
  "photo_url": "string",
  "notes": "string",
  "created_by": "ObjectId ref:users",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 4.5 Collection: `growth_records` (DISEMPURNAKAN)
```json
{
  "_id": "ObjectId",
  "livestock_id": "ObjectId",
  "record_date": "ISODate",
  "weight_kg": "number",
  "bcs": "number (1-5)",            // Body Condition Score
  "height_cm": "number",            // Tinggi badan (TAMBAHAN)
  "chest_girth_cm": "number",       // Lingkar dada (TAMBAHAN)
  "adg_calculated": "number",       // ADG otomatis dihitung backend (g/hari)
  "measured_by": "ObjectId ref:users",
  "notes": "string",
  "created_at": "ISODate"
}
```

### 4.6 Collection: `feed_master` (Master Data Pakan — TAMBAHAN)
```json
{
  "_id": "ObjectId",
  "farm_id": "ObjectId",
  "feed_name": "string",
  "feed_type": "hijauan | konsentrat | silase | limbah | suplemen",
  "source": "lapangan | beli | fermentasi_sendiri",
  "dry_matter_pct": "number",       // % BK
  "crude_protein_pct": "number",    // % PK
  "metabolizable_energy": "number", // kkal/kg EM
  "unit": "kg | liter | ikat",
  "price_per_unit": "number",
  "is_active": "boolean"
}
```

### 4.7 Collection: `feeding_logs` (DISEMPURNAKAN)
```json
{
  "_id": "ObjectId",
  "livestock_id": "ObjectId",
  "feed_master_id": "ObjectId ref:feed_master",
  "feed_date": "ISODate",
  "feeding_time": "morning | afternoon | evening",   // (TAMBAHAN)
  "amount_given_kg": "number",
  "amount_consumed_kg": "number",                    // Estimasi konsumsi nyata (TAMBAHAN)
  "appetite_response": "normal | reduced | refused",
  "dmi_calculated": "number",                        // Dry Matter Intake otomatis
  "cost_calculated": "number",                       // Biaya pakan hari ini
  "recorded_by": "ObjectId ref:users",
  "notes": "string",
  "created_at": "ISODate"
}
```

### 4.8 Collection: `health_records` (DISEMPURNAKAN)
```json
{
  "_id": "ObjectId",
  "livestock_id": "ObjectId",
  "record_date": "ISODate",
  "examiner": "ObjectId ref:users",
  "chief_complaint": "string",      // Keluhan utama
  "symptoms": ["array of string"],
  // === VITAL SIGNS (TAMBAHAN — standar pemeriksaan klinis) ===
  "body_temp_celsius": "number",    // Normal kambing: 38.5-40°C
  "heart_rate_bpm": "number",       // Normal: 70-90 bpm
  "respiratory_rate": "number",     // Normal: 12-20 /menit
  "rumen_motility": "normal | reduced | absent",   // (TAMBAHAN)
  // === DIAGNOSIS ===
  "examination_findings": "string",
  "diagnosis": "string",            // Nama penyakit (TAMBAHAN)
  "diagnosis_code": "string",       // Kode penyakit jika ada standar lokal
  "is_infectious": "boolean",       // Apakah menular
  "disease_category": "metabolic | infectious | parasitic | nutritional | injury | reproductive | other",
  "action_taken": "string",
  "referral_needed": "boolean",     // Perlu dirujuk ke dokter hewan? (TAMBAHAN)
  "follow_up_date": "ISODate",
  "created_at": "ISODate"
}
```

### 4.9 Collection: `medication_logs` (DISEMPURNAKAN)
```json
{
  "_id": "ObjectId",
  "health_record_id": "ObjectId ref:health_records",
  "livestock_id": "ObjectId",
  "medication_type": "treatment | vaccine | vitamin | antiparasitic",  // (DISEMPURNAKAN)
  "medicine_name": "string",
  "active_ingredient": "string",     // Zat aktif (TAMBAHAN)
  "dosage": "number",
  "dosage_unit": "ml | mg | tablet | sachet",
  "route": "oral | injeksi_SC | injeksi_IM | injeksi_IV | topikal",  // (TAMBAHAN)
  "frequency": "string",             // e.g. "2x sehari"
  "duration_days": "number",
  "start_date": "ISODate",
  "end_date": "ISODate",
  "withdrawal_period_days": "number", // Masa henti obat (KRUSIAL — TAMBAHAN)
  "withdrawal_end_date": "ISODate",   // Tanggal aman potong/jual (auto-calculated)
  "response": "improving | no_change | worsening",
  "administered_by": "ObjectId ref:users",
  "batch_number": "string",          // Nomor batch obat (TAMBAHAN)
  "notes": "string",
  "created_at": "ISODate"
}
```

### 4.10 Collection: `vaccination_records` (BARU — DIPISAH dari medication)
```json
{
  "_id": "ObjectId",
  "livestock_id": "ObjectId",
  "vaccine_name": "string",
  "disease_target": "string",        // Penyakit yang dicegah
  "dosage": "number",
  "dosage_unit": "ml",
  "route": "SC | IM | intranasal",
  "vaccination_date": "ISODate",
  "booster_due_date": "ISODate",    // Tanggal booster berikutnya
  "batch_number": "string",
  "manufacturer": "string",
  "administered_by": "ObjectId ref:users",
  "notes": "string",
  "created_at": "ISODate"
}
```

### 4.11 Collection: `quarantine_records` (BARU — dipisah agar lebih terstruktur)
```json
{
  "_id": "ObjectId",
  "livestock_id": "ObjectId",
  "health_record_id": "ObjectId ref:health_records",
  "quarantine_pen_id": "ObjectId ref:pens",
  "start_date": "ISODate",
  "expected_duration_days": "number",  // Durasi minimum sesuai penyakit
  "end_date": "ISODate",
  "reason": "string",
  "disease_suspected": "string",
  "clearance_test_done": "boolean",    // Apakah sudah tes bebas penyakit
  "clearance_test_result": "negative | positive | pending",
  "clearance_date": "ISODate",
  "status": "active | cleared | failed",
  "cleared_by": "ObjectId ref:users",
  "notes": "string",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 4.12 Collection: `reproduction_records` (DISEMPURNAKAN)
```json
{
  "_id": "ObjectId",
  "livestock_id": "ObjectId",         // Harus female
  "event_type": "estrus | mating | pregnancy_check | birth | abortion | weaning",
  "event_date": "ISODate",
  // === ESTRUS ===
  "estrus_signs": ["string"],          // Tanda birahi yang teramati (TAMBAHAN)
  // === MATING ===
  "mating_type": "natural | AI",       // Kawin alam atau Inseminasi Buatan (TAMBAHAN)
  "sire_id": "ObjectId ref:livestock", // Pejantan (kawin alam)
  "straw_code": "string",              // Kode straw IB (TAMBAHAN)
  "bull_id_straw": "string",           // ID pejantan dari straw (TAMBAHAN)
  // === PREGNANCY CHECK ===
  "pregnancy_status": "positive | negative | not_checked",
  "gestation_days_expected": "number", // Dihitung otomatis dari tanggal kawin
  "expected_birth_date": "ISODate",    // Auto-calculated
  // === BIRTH ===
  "offspring_count": "number",
  "birth_type": "normal | assisted | caesarean",  // (TAMBAHAN)
  "kidding_ease_score": "number (1-4)", // Skor kemudahan kelahiran (TAMBAHAN)
  "offspring_ids": ["ObjectId ref:livestock"],
  // === METRICS (auto-calculated) ===
  "days_open": "number",               // Interval beranak ke bunting kembali
  "service_count": "number",           // Jumlah service untuk konsepsi ini
  "notes": "string",
  "recorded_by": "ObjectId ref:users",
  "created_at": "ISODate"
}
```

### 4.13 Collection: `status_history`
```json
{
  "_id": "ObjectId",
  "livestock_id": "ObjectId",
  "status_from": "string",
  "status_to": "string",
  "changed_date": "ISODate",
  "reason": "string",
  "sale_price": "number",            // Jika status = sold
  "sale_buyer": "string",            // (TAMBAHAN)
  "changed_by": "ObjectId ref:users",
  "notes": "string",
  "created_at": "ISODate"
}
```

### 4.14 Collection: `offline_queue` (untuk sync)
```json
{
  "_id": "string (uuid v4)",
  "collection": "string",
  "operation": "create | update | delete",
  "payload": "object",
  "created_at": "ISODate",
  "retry_count": "number",
  "sync_status": "pending | synced | failed"
}
```

---

## 5. API Endpoints — Mobile Backend

### Auth
```
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/logout
```

### Livestock
```
GET    /api/livestock              → List semua ternak (filter: status, pen, species)
POST   /api/livestock              → Daftarkan ternak baru
GET    /api/livestock/:id          → Detail ternak + full timeline
PUT    /api/livestock/:id          → Update data identitas
GET    /api/livestock/:id/timeline → Semua record kronologis per hewan
```

### Growth
```
GET    /api/livestock/:id/growth       → Riwayat pertumbuhan + ADG chart data
POST   /api/livestock/:id/growth       → Catat penimbangan baru (ADG auto-hitung)
```

### Feeding
```
GET    /api/livestock/:id/feeding      → Riwayat pakan
POST   /api/livestock/:id/feeding      → Catat pemberian pakan
GET    /api/feed-master                → List master pakan
POST   /api/feed-master                → Tambah jenis pakan baru
```

### Health
```
GET    /api/livestock/:id/health       → Riwayat kesehatan
POST   /api/livestock/:id/health       → Catat health record baru
```

### Medication
```
GET    /api/livestock/:id/medication   → Riwayat obat
POST   /api/livestock/:id/medication   → Catat pemberian obat
PUT    /api/livestock/:id/medication/:medId → Update response
```

### Vaccination
```
GET    /api/livestock/:id/vaccination  → Riwayat vaksin
POST   /api/livestock/:id/vaccination  → Catat vaksinasi baru
GET    /api/livestock/vaccination/upcoming → Daftar hewan yang perlu booster
```

### Quarantine
```
POST   /api/livestock/:id/quarantine        → Mulai karantina
PUT    /api/livestock/:id/quarantine/:qId   → Update status karantina
POST   /api/livestock/:id/quarantine/:qId/clearance → Clearance test result
```

### Reproduction
```
GET    /api/livestock/:id/reproduction  → Riwayat reproduksi
POST   /api/livestock/:id/reproduction  → Catat event reproduksi
```

### Status
```
POST   /api/livestock/:id/status       → Update status (sold/dead/transferred)
GET    /api/livestock/:id/status-history → Riwayat perubahan status
```

### Pens
```
GET    /api/pens                       → List kandang
POST   /api/pens                       → Tambah kandang
PUT    /api/livestock/:id/pen          → Pindah kandang
```

### Dashboard & Reports
```
GET    /api/dashboard/summary          → Ringkasan: total aktif, sakit, karantina
GET    /api/reports/health             → Laporan kesehatan per periode
GET    /api/reports/growth             → Laporan pertumbuhan & ADG
GET    /api/reports/feed-cost          → Laporan biaya pakan
GET    /api/reports/vaccination-due    → Hewan yang perlu vaksin
GET    /api/reports/withdrawal-alert   → Hewan dalam masa henti obat (!)
```

### Sync (Offline)
```
POST   /api/sync/push                  → Upload antrian offline
GET    /api/sync/pull                  → Download data terbaru
```

---

## 6. Flow Lengkap Mobile App (React Native)

### 6.1 App Navigation Structure
```
(auth)/
  login.tsx

(app)/
  _layout.tsx          ← Tab Navigator
  index.tsx            ← Dashboard
  livestock/
    index.tsx          ← List ternak
    [id]/
      index.tsx        ← Detail + Timeline
      growth.tsx
      feeding.tsx
      health.tsx
      medication.tsx
      vaccination.tsx
      reproduction.tsx
      quarantine.tsx
      status.tsx
  pens/
    index.tsx
  reports/
    index.tsx
  settings/
    index.tsx
```

### 6.2 Flow Pendaftaran Ternak Baru
```
Buka "Tambah Ternak"
→ Input: Ear Tag, Nama, Spesies, Ras, Jenis Kelamin
→ Input: Tanggal Lahir/Beli, Asal Ternak
→ Pilih Kandang (dropdown dari /api/pens)
→ Upload Foto Hewan (opsional)
→ Input National ID / RFID (opsional)
→ Submit → Simpan lokal + sinkron ke server
→ Redirect ke halaman Detail Ternak
```

### 6.3 Flow Pencatatan Kesehatan + Pengobatan (DISEMPURNAKAN)
```
Buka ternak → Tab "Kesehatan" → Tambah Record
→ Input Keluhan Utama & Gejala (multi-select checkbox)
→ Input Vital Signs:
   - Suhu Tubuh (°C) → sistem highlight jika > 40°C atau < 38°C
   - Detak Jantung (bpm)
   - Frekuensi Nafas (/mnt)
   - Motilitas Rumen
→ Input Temuan Pemeriksaan & Diagnosa
→ Pilih Kategori Penyakit
→ Tindakan yang Dilakukan

[Perlu Pemberian Obat?]
  YA → Form Medication:
    - Nama Obat + Zat Aktif
    - Dosis, Rute Pemberian
    - Frekuensi & Durasi
    - Withdrawal Period (hari)
    - Nomor Batch Obat
    → Sistem auto-hitung withdrawal_end_date
    → ALERT jika withdrawal period ada: 
      "⚠️ Hewan ini TIDAK BOLEH dipotong/dijual sebelum [tanggal]"

[Penyakit Menular / Dicurigai Menular?]
  YA → Form Karantina:
    - Pilih Kandang Karantina
    - Penyakit yang Dicurigai
    - Estimasi Durasi (hari)
    → Status ternak → QUARANTINE
    → Push notif ke officer lain: "⚠️ [Ear Tag] masuk karantina: [alasan]"
    → Monitoring berkala (form follow-up)
    → Saat sembuh: Input Clearance Test
      → Clearance Negatif → Status → ACTIVE, kembalikan ke kandang semula
      → Clearance Positif → Lanjut karantina / referral
```

### 6.4 Flow Karantina Lengkap
```
[AWAL KARANTINA]
Livestock status: sick → quarantine
Record: quarantine_records (start_date, pen, disease)
Notifikasi semua officer

[MONITORING HARIAN]
Input health_record follow-up + medication_log
Update response obat

[PEMULIHAN]
Input clearance_test_done: true
Input clearance_test_result:
  → NEGATIVE (bebas penyakit):
      quarantine status: cleared
      livestock status: active
      Kembalikan ke pen semula
      Log status_history: quarantine → active
  → POSITIVE (masih ada penyakit):
      Lanjut karantina atau referral ke drh
      Log kegagalan

[KEMATIAN SAAT KARANTINA]
Update status_history: quarantine → dead
Dokumentasikan penyebab kematian
```

---

## 7. Fitur Dashboard Mobile

### 7.1 Dashboard Utama
- Total ternak aktif, sakit, karantina, terjual bulan ini
- **Alert cards:**
  - 🔴 Hewan dalam karantina aktif
  - 🟡 Hewan mendekati withdrawal period selesai
  - 🟡 Jadwal vaksin yang akan datang (7 hari ke depan)
  - 🟡 Hewan yang perlu follow-up kesehatan hari ini
- ADG summary (rata-rata pertambahan bobot semua ternak aktif)
- Biaya pakan minggu ini

### 7.2 Halaman Detail Ternak (Timeline)
Tampilkan kronologis semua event:
```
[2026-06-01] 📏 Penimbangan: 28 kg (+150g/hari sejak 2026-05-15)
[2026-06-03] 🍃 Pakan: Rumput Gajah 2kg + Konsentrat 0.5kg
[2026-06-05] 🏥 Sakit: Diare — Suhu 39.5°C — Diagnosa: Enteritis
[2026-06-05] 💊 Obat: Sulfadiazin 5ml IM — Withdrawal: 10 hari (s/d 15 Jun)
[2026-06-06] 🔒 KARANTINA: Kandang K-02 (Dicurigai menular)
[2026-06-12] ✅ Clearance Negatif — Kembali ke K-01
```

---

## 8. Fitur Laporan (Reports)

| Laporan | Isi |
|---|---|
| Kesehatan | Daftar kasus penyakit per periode, morbidity rate, penyakit terbanyak |
| Pertumbuhan | ADG per hewan dan rata-rata kandang, progress BCS |
| Biaya Pakan | Total biaya pakan per hewan / per kandang / per bulan, FCR (Feed Conversion Ratio) |
| Reproduksi | Calving rate, Days Open rata-rata, S/C ratio, kelahiran hidup/mati |
| Vaksinasi Jatuh Tempo | Daftar hewan dan jadwal booster |
| Withdrawal Alert | Hewan yang masih dalam masa henti obat — TIDAK BOLEH DIJUAL |
| Status Ternak | Ringkasan: aktif, sakit, karantina, terjual, mati per periode |
| Inventaris Kandang | Occupancy rate per kandang |

---

## 9. Non-Functional Requirements

| Aspek | Requirement |
|---|---|
| Offline | Semua pencatatan bisa dilakukan offline; sync saat online |
| Performance | Halaman list ternak load < 2 detik (max 500 records) |
| Security | JWT refresh token, bcrypt password, HTTPS only |
| Data Integrity | Validasi input (berat > 0, suhu 35–45°C, tanggal tidak di masa depan) |
| Notifikasi | Push notif FCM untuk alert karantina dan jadwal vaksin |
| Backup | MongoDB Atlas auto-backup harian |
| Photo | Kompresi foto sebelum upload (max 1MB) |
| Platform | Android 8.0+ (target), iOS 13+ (opsional via Expo) |
| Akses | Role-based: Officer (CRUD data ternak), Senior Officer (+ manage officer), Manager (+ hapus data + laporan lengkap) |

---

## 10. Testing Scenarios Tambahan

### Skenario Withdrawal Period Alert
- **T-WD-01:** Catat obat dengan withdrawal period 10 hari → sistem hitung tanggal aman
- **T-WD-02:** Coba update status ke "Sold" saat masih dalam withdrawal → sistem tampilkan PERINGATAN KERAS
- **T-WD-03:** Setelah melewati withdrawal_end_date → status sold bisa dilanjutkan

### Skenario ADG Calculation
- **T-ADG-01:** Input dua penimbangan berurutan → ADG dihitung otomatis
- **T-ADG-02:** ADG negatif (BB turun) → ditampilkan dengan highlight merah pada timeline

### Skenario Karantina Clearance
- **T-Q-01:** Hewan karantina → clearance negatif → status kembali active
- **T-Q-02:** Hewan karantina → clearance positif → tetap karantina, notifikasi muncul

### Skenario Vital Signs Alert
- **T-VS-01:** Input suhu > 40°C → sistem tampilkan badge "Demam" pada kartu ternak
- **T-VS-02:** Input suhu < 38°C → badge "Hipotermia"

---

## 11. Rekomendasi Prioritas Implementasi

### Phase 1 (Minggu 1-2): Foundation
- Setup Expo project + folder structure
- Auth (login officer, JWT)
- CRUD Ternak dasar (tanpa modul tambahan)
- CRUD Kandang (Pen)

### Phase 2 (Minggu 3-4): Core Recording
- Growth records + ADG auto-hitung
- Feeding logs + master pakan
- Offline queue foundation (expo-sqlite)

### Phase 3 (Minggu 5-6): Health Module (PRIORITAS TINGGI)
- Health records + vital signs
- Medication logs + withdrawal period calculation
- Quarantine flow lengkap (start → monitor → clearance → active)
- Push notification untuk quarantine alert

### Phase 4 (Minggu 7-8): Advanced Features
- Vaccination records + reminder
- Reproduction records
- Status history
- Dashboard alerts

### Phase 5 (Minggu 9-10): Reports & Polish
- Semua laporan
- Withdrawal alert report
- Sync optimization
- Testing & bug fix

---

## 12. Catatan Penting untuk Standar Peternakan Indonesia

1. **Regulasi:** Mengacu pada Peraturan Menteri Pertanian (Permentan) No. 17/2019 tentang peternakan dan kesehatan hewan
2. **SIKKN:** Sistem Informasi Kesehatan Hewan Nasional — ID ternak sebaiknya kompatibel
3. **Withdrawal period:** Penting untuk kepatuhan terhadap aturan keamanan pangan SNI
4. **Karantina hewan:** Mengacu pada UU No. 21/2019 tentang Karantina Hewan, Ikan, dan Tumbuhan
5. **Penyakit notifiable:** Beberapa penyakit (PMK, Anthrax, Brucellosis) wajib dilaporkan ke Dinas Peternakan — pertimbangkan fitur "lapor ke dinas" di versi lanjutan

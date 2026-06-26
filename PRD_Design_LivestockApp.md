# PRD Design — Mobile App
## Livestock Recording · Bodogol Farm
**React Native + Expo · Platform: Android 8.0+ · iOS 13+**

---

**Versi:** 1.0  
**Tanggal:** Juni 2026  
**Tim:** Eden Al Farizi, Iqbal Darusallam, Celvine Brains  
**Tools:** Figma · NativeWind (Tailwind) · React Native Paper

---

## 1. Design Principles & Identity

### 1.1 Brand Direction

Aplikasi ini digunakan oleh **petugas kandang** di lapangan — kondisinya: tangan kotor, cahaya matahari terik, waktu terbatas, koneksi tidak stabil. Design harus:

- **Functional over decorative** — setiap elemen punya tujuan
- **Glanceable** — informasi penting terbaca dalam 2 detik
- **Error-tolerant** — validasi cepat, konfirmasi sebelum aksi destruktif
- **Earthy & trustworthy** — warna alam yang menenangkan, bukan warna cerah digital

### 1.2 Design Pillars

| Pilar | Artinya dalam App |
|---|---|
| **Ground** | Warna tanah, hijau alam — terasa lokal dan dipercaya |
| **Clear** | Tipografi besar dan kontras tinggi — mudah dibaca di sinar matahari |
| **Fast** | Tap target minimum 48×48dp, form singkat, shortcut di dashboard |
| **Honest** | Status hewan ditampilkan jelas — tidak ada data tersembunyi |

---

## 2. Design Token System

### 2.1 Color Palette

```
Primary (Brand Green)
  --color-primary-900   #1A3A2A   ← teks heading dark mode
  --color-primary-700   #2D6A4F   ← brand utama, navbar, CTA
  --color-primary-500   #52B788   ← accent, icon aktif, badge
  --color-primary-100   #D8F3DC   ← background chip, tag hijau muda
  --color-primary-50    #F0FAF2   ← background card ringan

Neutral (Earthy)
  --color-neutral-900   #1C1C1E   ← teks utama
  --color-neutral-700   #3C3C3E   ← teks sekunder
  --color-neutral-500   #8E8E93   ← placeholder, label disabled
  --color-neutral-300   #D1D1D6   ← border, divider
  --color-neutral-100   #F2F2F7   ← background screen
  --color-neutral-0     #FFFFFF   ← card surface

Semantic — Status
  --color-status-active      #52B788   ← Active (hijau)
  --color-status-sick        #F4A261   ← Sick (oranye)
  --color-status-quarantine  #E63946   ← Quarantine (merah)
  --color-status-sold        #6D6875   ← Sold (ungu abu)
  --color-status-dead        #495057   ← Dead (abu gelap)

Alert / Feedback
  --color-danger-bg    #FDECEA   ← background alert merah
  --color-danger       #D32F2F   ← teks/icon error
  --color-warning-bg   #FFF8E1   ← background warning kuning
  --color-warning      #F57C00   ← teks/icon warning
  --color-success-bg   #E8F5E9   ← background sukses
  --color-success      #2E7D32   ← teks/icon sukses
  --color-info-bg      #E3F2FD   ← background info
  --color-info         #1565C0   ← teks/icon info
```

### 2.2 Typography

**Display / Heading:** `DM Sans` (Google Fonts, free)
- Bold, geometric, terbaca di layar kecil
- Alternatif: `Plus Jakarta Sans`

**Body / Form:** `Inter`
- Neutral, high readability, tersedia lengkap semua weight

**Monospace (ear tag, ID):** `JetBrains Mono`
- Untuk tampilkan nomor earTag, kode obat, batch number

```
Type Scale (sp — scalable pixels)
  --text-display    28sp / Bold    ← nama hewan di header detail
  --text-h1         22sp / SemiBold ← section heading
  --text-h2         18sp / SemiBold ← card title
  --text-h3         16sp / Medium   ← subsection, label group
  --text-body-lg    16sp / Regular  ← body teks utama
  --text-body       14sp / Regular  ← body teks standar
  --text-label      13sp / Medium   ← label form, chip
  --text-caption    12sp / Regular  ← timestamp, keterangan kecil
  --text-micro      11sp / Regular  ← badge count, secondary info

Line Height: 1.5× untuk body; 1.2× untuk heading
Letter Spacing: -0.01em untuk display; 0 untuk body
```

### 2.3 Spacing System (8dp Grid)

```
--space-2    2dp    ← gap antar badge
--space-4    4dp    ← inner padding chip
--space-8    8dp    ← gap antar elemen dalam card
--space-12   12dp   ← padding kecil
--space-16   16dp   ← padding card standar (horizontal screen margin)
--space-20   20dp   ← padding card besar
--space-24   24dp   ← gap antar section
--space-32   32dp   ← jarak heading ke konten
--space-48   48dp   ← minimum tap target height
--space-64   64dp   ← bottom safe area padding
```

### 2.4 Border Radius

```
--radius-sm    6dp    ← badge, chip kecil
--radius-md    12dp   ← card standar, input field
--radius-lg    16dp   ← bottom sheet, modal
--radius-xl    24dp   ← FAB, large card
--radius-full  9999dp ← avatar, status dot, pill button
```

### 2.5 Shadows (Android Elevation)

```
--shadow-xs   elevation: 1  ← card datar
--shadow-sm   elevation: 2  ← card standar
--shadow-md   elevation: 4  ← FAB, modal
--shadow-lg   elevation: 8  ← bottom sheet raised
```

### 2.6 Iconography

**Library:** `@expo/vector-icons` → MaterialCommunityIcons

| Konsep | Icon Name |
|---|---|
| Ternak / Hewan | `cow`, `sheep`, `pig` |
| Kandang | `barn` |
| Kesehatan | `medical-bag` |
| Obat | `pill` |
| Vaksin | `needle` |
| Karantina | `shield-alert` |
| Pakan | `food-apple` |
| Pertumbuhan | `trending-up` |
| Reproduksi | `baby-carriage` |
| Status | `tag` |
| Peringatan | `alert-circle` |
| Sukses | `check-circle` |
| Timeline | `timeline` |
| Laporan | `chart-bar` |
| Sync offline | `cloud-sync` |
| Tambah | `plus-circle` |
| Foto | `camera` |

---

## 3. Component Library

### 3.1 StatusBadge

Menampilkan status ternak dengan warna semantik.

```
Variants:
  ACTIVE      → bg: #D8F3DC  text: #1A3A2A  dot: #52B788
  SICK        → bg: #FFF3E0  text: #BF360C  dot: #F4A261
  QUARANTINE  → bg: #FDECEA  text: #B71C1C  dot: #E63946  (+ animasi pulse)
  SOLD        → bg: #EDE7F6  text: #4527A0  dot: #6D6875
  DEAD        → bg: #ECEFF1  text: #263238  dot: #495057

Anatomy:
  [● STATUS_LABEL]
  Ukuran dot: 8×8dp
  Padding: 4dp vertical, 10dp horizontal
  Border radius: full
  Font: --text-label / SemiBold
```

**Aturan khusus QUARANTINE:**
- Dot merah beranimasi pulse (scale 1.0 → 1.4 → 1.0, loop)
- Badge seluruhnya punya border merah tipis 1dp

### 3.2 LivestockCard (List Item)

```
┌─────────────────────────────────────────────────┐
│  [Foto]   #A-012  Kambing PE · Betina           │
│  [Thumb]  Kandang K-01                          │
│  48×48dp  BCS: 3/5  |  BB: 28.5 kg             │
│           [● ACTIVE]              >             │
└─────────────────────────────────────────────────┘

Specs:
  Tinggi minimum: 80dp
  Photo placeholder: bg #D8F3DC, icon "sheep" 24dp #52B788
  Foto nyata: rounded 8dp, 48×48dp
  Earmark font: JetBrains Mono 13sp Bold
  Tap → navigasi ke Detail Ternak
  Long press → context menu (Edit, Pindah Kandang, Update Status)
```

### 3.3 AlertCard

Untuk Dashboard — 4 tipe priority.

```
DANGER (Karantina aktif)
┌─────────────────────────────────────────────────┐
│ 🔴  KARANTINA AKTIF                            │
│     A-012 · Kandang K-02 · Hari ke-3           │
│     Dicurigai Scabies                 LIHAT > │
└─────────────────────────────────────────────────┘
bg: #FDECEA | border-left: 4dp #D32F2F | radius: 12dp

WARNING (Withdrawal / Vaksin jatuh tempo)
┌─────────────────────────────────────────────────┐
│ 🟡  MASA HENTI OBAT                            │
│     A-007 — Ampicillin                          │
│     Aman jual: 15 Jun 2026            LIHAT > │
└─────────────────────────────────────────────────┘
bg: #FFF8E1 | border-left: 4dp #F57C00

INFO (Jadwal Vaksin)
┌─────────────────────────────────────────────────┐
│ 🔵  BOOSTER VAKSIN                             │
│     3 ekor · Jatuh tempo: 30 Jun 2026  LIHAT > │
└─────────────────────────────────────────────────┘
bg: #E3F2FD | border-left: 4dp #1565C0

SUCCESS (ADG positif)
┌─────────────────────────────────────────────────┐
│ 🟢  ADG MINGGU INI                             │
│     Rata-rata +148g/hari (target: 100g/hari)   │
└─────────────────────────────────────────────────┘
bg: #E8F5E9 | border-left: 4dp #2E7D32
```

### 3.4 FormField

```
Label (text-label, neutral-700)
┌─────────────────────────────┐
│  [Placeholder / Value]      │
└─────────────────────────────┘
Helper text (text-caption, neutral-500)

States:
  Default   → border: 1dp neutral-300, bg: white
  Focused   → border: 2dp primary-700, bg: white
  Filled    → border: 1dp neutral-300, bg: white
  Error     → border: 2dp danger, bg: danger-bg
             + icon alert-circle kanan dalam field
  Disabled  → border: 1dp neutral-200, bg: neutral-100, opacity 0.6

Height: 48dp (minimum tap target)
Padding horizontal: 16dp
Border radius: 12dp
Font: text-body / Inter Regular
```

### 3.5 VitalSignsInput (khusus Health Record)

```
┌──────────────────────────────────────────────────┐
│  VITAL SIGNS                                     │
│                                                  │
│  Suhu Tubuh (°C)     Detak Jantung (bpm)        │
│  ┌──────────┐        ┌──────────┐               │
│  │  39.5 🌡 │        │   82 ♥  │               │
│  └──────────┘        └──────────┘               │
│  ⚠ Normal: 38.5–40°C  Normal: 70–90 bpm        │
│                                                  │
│  Frekuensi Nafas     Motilitas Rumen             │
│  ┌──────────┐        ┌──────────────────┐        │
│  │  18 /mnt │        │ Normal      ▼   │        │
│  └──────────┘        └──────────────────┘        │
│  Normal: 12–20/mnt                               │
└──────────────────────────────────────────────────┘

Auto-alert:
  Suhu > 40.0°C  → border merah + badge "DEMAM"
  Suhu < 38.0°C  → border biru + badge "HIPOTERMIA"
  Nafas > 30     → border kuning + badge "TAKIPNEA"
```

### 3.6 TimelineItem

```
  ●──┤ 05 Jun  ├─────────────────────────────────
  │  │ 🏥 Sakit — Enteritis                      │
  │  │ Suhu: 39.5°C · Nafas: 22/mnt              │
  │  │ [● SICK]                         DETAIL > │
  │  └────────────────────────────────────────────
  │
  ●──┤ 05 Jun  ├─────────────────────────────────
  │  │ 💊 Obat — Sulfadiazin 5ml IM              │
  │  │ Withdrawal: s/d 15 Jun 2026               │
  │  │ [⚠ DALAM MASA HENTI]                     │
  │  └────────────────────────────────────────────

Timeline line: 2dp, neutral-300
Active dot: 10dp, warna sesuai tipe event
Dot types:
  📏 Growth   → primary-500
  🍃 Feeding  → #A8DADC
  🏥 Health   → warning
  💊 Obat     → #F4A261
  💉 Vaksin   → info
  🔒 Karantina → danger
  ✅ Clearance → success
  🔄 Status   → neutral-500
```

### 3.7 SummaryStatCard (Dashboard)

```
┌─────────────────┐  ┌─────────────────┐
│   Aktif         │  │   Karantina     │
│   48            │  │   2             │
│   ekor          │  │   ekor          │
│ ──────────────  │  │ ────────────── │
│ +3 bulan ini    │  │ ⚠ Perlu perhatian│
└─────────────────┘  └─────────────────┘

Ukuran: flex 1, min-height 88dp
Angka: text-display (28sp) Bold primary-700
Label: text-caption neutral-500
Warna card karantina: bg danger-bg, angka danger
```

### 3.8 Primary Button

```
Filled (CTA utama):
  bg: primary-700  |  text: white  |  height: 52dp  |  radius: 12dp
  Pressed: bg primary-900, scale 0.97

Outlined (secondary):
  border: 2dp primary-700  |  text: primary-700  |  height: 52dp
  
Danger:
  bg: danger  |  text: white  (untuk Sold, Dead, Hapus)

Ghost:
  text: primary-700  |  no border, no bg

Disabled:
  bg: neutral-200  |  text: neutral-500  |  opacity 0.6

Loading:
  ActivityIndicator putih di tengah, teks hilang
```

### 3.9 FAB (Floating Action Button)

```
Posisi: bottom-right, 16dp dari tepi, 80dp dari bottom nav
Ukuran: 56×56dp
Icon: plus, warna white
bg: primary-700
Shadow: elevation 6
Long press → Speed Dial:
  ↑ Catat Pakan
  ↑ Catat Kesehatan
  ↑ Catat Penimbangan
  ↑ Ternak Baru (hanya dari halaman list)
```

### 3.10 BottomSheet

```
Digunakan untuk:
  - Konfirmasi aksi destruktif (Update Status → Sold/Dead)
  - Filter & sort di halaman list
  - Context menu ternak

Specs:
  Handle bar: 4×32dp, radius full, neutral-300, center
  Padding: 24dp
  Radius top: 24dp
  Background: white
  Overlay: rgba(0,0,0,0.4)
  Swipe down untuk dismiss
```

---

## 4. Screen Specifications

### Screen 1 — Login

```
┌──────────────────────────────────┐
│                                  │  ← StatusBar transparent
│                                  │
│      [🐐 Logo + Nama App]        │  ← center, mt: 80dp
│   Bodogol Farm Livestock         │
│                                  │
│  ──────────────────────────────  │  ← divider
│                                  │
│  Username / Email                │
│  ┌──────────────────────────┐    │
│  │                          │    │
│  └──────────────────────────┘    │
│                                  │
│  Kata Sandi                      │
│  ┌──────────────────────────┐    │
│  │                    👁    │    │  ← toggle show/hide
│  └──────────────────────────┘    │
│                                  │
│  [        Masuk         ]        │  ← Primary button full-width
│                                  │
│  v1.0.0 · Bodogol Farm          │  ← caption, center, neutral-500
└──────────────────────────────────┘

Notes:
  - Tidak ada "Daftar" — akun dibuat oleh Senior Officer di dalam app
  - Error state: card merah di atas form "Username atau password salah"
  - Loading state: button spinner
  - Keyboard: push screen up, bukan menutupi button
  - Background: gradient subtle neutral-50 → primary-50
```

---

### Screen 2 — Dashboard (Tab 1)

```
┌──────────────────────────────────┐
│ 🌿 Bodogol Farm     [🔔 2] [👤] │  ← Header
│ Selamat pagi, Eden               │  ← Greeting, text-h3
│─────────────────────────────────│
│  RINGKASAN HARI INI              │  ← Section label, text-label
│  ┌──────────┐ ┌──────────┐      │
│  │ Aktif  48│ │ Sakit   3│      │
│  └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐      │
│  │Karant.  2│ │ ADG +148g│      │
│  └──────────┘ └──────────┘      │
│─────────────────────────────────│
│  ⚠ PERLU PERHATIAN              │  ← Section label + badge count
│                                  │
│  [AlertCard DANGER — Karantina] │
│  [AlertCard WARNING — Withdrawal]│
│  [AlertCard INFO — Vaksin]       │
│                                  │
│─────────────────────────────────│
│  AKTIVITAS HARI INI              │
│  [Mini timeline 3 event terakhir]│
│  Lihat semua →                   │
└──────────────────────────────────┘
[🐄 Ternak] [📋 Laporan] [⚙ Setting]  ← Bottom Tab Nav

Alert section: ScrollView vertikal
Tab active: icon + label primary-700; inactive: neutral-500
Bottom nav height: 64dp + safe area inset
```

---

### Screen 3 — Daftar Ternak (Tab: Ternak)

```
┌──────────────────────────────────┐
│  Daftar Ternak         [🔍] [⚙]│
│─────────────────────────────────│
│  [Filter chips: scrollable H]    │
│  [Semua] [Aktif] [Sakit] [Krt.] │
│  [Kambing] [Domba] [K-01] ...   │
│─────────────────────────────────│
│  48 ternak ditemukan             │  ← text-caption, neutral-500
│                                  │
│  [LivestockCard]                 │
│  [LivestockCard]                 │
│  [LivestockCard — SICK badge]    │
│  [LivestockCard — QUARANTINE]    │
│  ...                             │
│                                  │
│                          [+ FAB] │
└──────────────────────────────────┘

Search bar:
  - Collapsed default, expand saat tap 🔍
  - Cari berdasarkan: ear tag, nama, ras
  - Debounce 300ms

Filter Chips:
  - Horizontal ScrollView, no scrollbar visible
  - Active chip: bg primary-700, teks putih
  - Inactive: border 1dp neutral-300, bg white

Sort options (via BottomSheet):
  - Terbaru ditambahkan
  - Ear Tag A→Z
  - Berat (besar ke kecil)
  - Status (Quarantine first)
```

---

### Screen 4 — Detail Ternak

```
┌──────────────────────────────────┐
│ ← [Foto hewan fullwidth 200dp]   │  ← CollapsibleHeader
│    [gradient overlay bawah]      │
│    #A-012  Kambing PE            │  ← earTag mono + nama
│    [● ACTIVE]                    │
│─────────────────────────────────│
│  [Info chips scrollable H]       │
│  Betina · 2 th 3 bln · K-01     │
│─────────────────────────────────│
│  [TAB BAR - scrollable]          │
│  Timeline│Tumbuh│Pakan│Sehat│    │
│          │      │     │Obat│...  │
│─────────────────────────────────│
│  TAB CONTENT (aktif: Timeline)   │
│                                  │
│  [TimelineItem — Growth]         │
│  [TimelineItem — Health]         │
│  [TimelineItem — Medication]     │
│  [TimelineItem — Quarantine]     │
│  ...                             │
│                                  │
│                    [+ Tambah ▼]  │  ← SpeedDial FAB
└──────────────────────────────────┘

Header CollapseScroll:
  - Foto menyusut saat scroll ke atas
  - Saat collapsed: tampilkan earTag + nama di AppBar
  - AppBar bg: primary-700, teks putih

Tab Bar:
  - Tabs: Timeline, Pertumbuhan, Pakan, Kesehatan, Obat, Vaksin, Reproduksi, Status
  - Horizontal scroll
  - Active tab: underline 2dp primary-700, bold
  - Scroll ke tab content terkait

FAB SpeedDial dari layar ini:
  - Catat Penimbangan
  - Catat Pakan
  - Catat Kesehatan
  - Catat Vaksinasi
  - Catat Reproduksi
  - Update Status
```

---

### Screen 5 — Form Pertumbuhan (Growth Record)

```
┌──────────────────────────────────┐
│ ← Catat Penimbangan              │
│   #A-012 — Terakhir: 28.0 kg    │  ← subtitle contextual
│─────────────────────────────────│
│  Tanggal Penimbangan *           │
│  ┌──────────────────────────┐    │
│  │ 25 Jun 2026    📅        │    │
│  └──────────────────────────┘    │
│                                  │
│  Berat Badan (kg) *              │
│  ┌──────────────────────────┐    │
│  │ 28.5              [kg]   │    │  ← suffix unit
│  └──────────────────────────┘    │
│  → ADG: +156g/hari sejak 01 Jun │  ← live calculation preview
│                                  │
│  Body Condition Score (BCS) *    │
│  [1]  [2]  [3✓] [4]  [5]        │  ← pill toggle selector
│  Kurus   Normal   Gemuk          │
│                                  │
│  Tinggi Badan (cm)               │
│  ┌──────────────────────────┐    │
│  │ 62                [cm]   │    │
│  └──────────────────────────┘    │
│                                  │
│  Lingkar Dada (cm)               │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  Catatan                         │
│  ┌──────────────────────────┐    │
│  │                          │    │  ← multiline, 3 baris
│  └──────────────────────────┘    │
│                                  │
│  [        Simpan          ]      │
└──────────────────────────────────┘

UX Notes:
  - ADG preview muncul real-time saat user mengetik berat
  - BCS pill selector: tap untuk pilih, visual berubah langsung
  - Numeric keyboard otomatis untuk field angka
  - Tanggal default: hari ini
  - * = wajib diisi
```

---

### Screen 6 — Form Pakan (Feeding Log)

```
┌──────────────────────────────────┐
│ ← Catat Pakan                    │
│   #A-012 · 25 Jun 2026          │
│─────────────────────────────────│
│  Waktu Pemberian *               │
│  [Pagi] [Siang ✓] [Sore]        │  ← pill toggle
│                                  │
│  Jenis Pakan *                   │
│  ┌──────────────────────────┐    │
│  │ Cari atau pilih pakan ▼  │    │  ← searchable dropdown
│  └──────────────────────────┘    │
│  [+ Tambah pakan baru]           │  ← link ke form feed master
│                                  │
│  Jumlah Diberikan (kg) *         │
│  ┌──────────────────────────┐    │
│  │ 2.0               [kg]   │    │
│  └──────────────────────────┘    │
│                                  │
│  Estimasi Konsumsi (kg)          │
│  ┌──────────────────────────┐    │
│  │ 1.8               [kg]   │    │
│  └──────────────────────────┘    │
│  → DMI: ~1.44 kg BK (BK: 80%)  │  ← auto-hitung jika feed master ada %BK
│                                  │
│  Respons Nafsu Makan *           │
│  [Normal ✓] [Berkurang] [Menolak]│
│                                  │
│  Catatan                         │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  [        Simpan          ]      │
└──────────────────────────────────┘
```

---

### Screen 7 — Form Kesehatan (Health Record)

```
┌──────────────────────────────────┐
│ ← Catat Pemeriksaan Kesehatan    │
│   #A-012                         │
│─────────────────────────────────│
│  Tanggal Pemeriksaan *           │
│  ┌──────────────────────────┐    │
│  │ 25 Jun 2026    📅        │    │
│  └──────────────────────────┘    │
│                                  │
│  VITAL SIGNS                     │
│  [VitalSignsInput component]     │  ← lihat spec 3.5
│                                  │
│  Keluhan Utama *                 │
│  ┌──────────────────────────┐    │
│  │                          │    │
│  └──────────────────────────┘    │
│                                  │
│  Gejala (pilih semua yang ada) * │
│  ☑ Diare     ☑ Lemas     □ Batuk│
│  □ Kembung   □ Nafsu turun      │
│  □ Luka      □ Gatal/kudis      │
│  □ Kaki pincang   □ Demam       │
│  [+ Tambah gejala lain]          │  ← free text append
│                                  │
│  Temuan Pemeriksaan              │
│  ┌──────────────────────────┐    │
│  │                          │    │  ← multiline
│  └──────────────────────────┘    │
│                                  │
│  Diagnosa                        │
│  ┌──────────────────────────┐    │
│  │ Pilih atau ketik...  ▼   │    │  ← autocomplete: common diseases
│  └──────────────────────────┘    │
│                                  │
│  Kategori Penyakit *             │
│  ┌──────────────────────────┐    │
│  │ Infeksi              ▼   │    │
│  └──────────────────────────┘    │
│                                  │
│  Tindakan yang Dilakukan         │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  Perlu pemberian obat?           │
│  ○ Ya     ● Tidak                │
│  [→ Lanjut ke Form Obat]         │  ← muncul jika "Ya"
│                                  │
│  ┌──────────────────────────────┐│
│  │ ⚠️ Penyakit menular /        ││  ← card toggle khusus
│  │ dicurigai menular?           ││
│  │ ○ Ya  — Lanjut ke Karantina  ││
│  │ ● Tidak                      ││
│  └──────────────────────────────┘│
│                                  │
│  Perlu dirujuk ke drh?           │
│  ○ Ya     ● Tidak                │
│                                  │
│  [        Simpan          ]      │
└──────────────────────────────────┘

UX Notes:
  - Gejala: checkbox grid 2 kolom
  - Jika Vital Signs suhu > 40°C, otomatis check "Demam"
  - Jika pilih "Ya" untuk menular → tombol ganti jadi
    [Simpan & Lanjut ke Karantina]
  - Form ini bisa multi-step jika panjang:
    Step 1: Vital Signs + Gejala
    Step 2: Diagnosa + Tindakan
    Step 3: Obat (jika ada) + Karantina (jika perlu)
```

---

### Screen 8 — Form Pengobatan (Medication Log)

```
┌──────────────────────────────────┐
│ ← Catat Pengobatan               │
│   Terhubung ke: Health #H-042    │  ← context badge
│─────────────────────────────────│
│  Tipe Obat *                     │
│  [Pengobatan✓] [Vitamin] [Anti-P]│
│                                  │
│  Nama Obat *                     │
│  ┌──────────────────────────┐    │
│  │ Cari nama obat...        │    │
│  └──────────────────────────┘    │
│                                  │
│  Zat Aktif                       │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  Dosis *          Satuan *       │
│  ┌──────────┐    ┌────────────┐  │
│  │ 5        │    │ ml      ▼  │  │
│  └──────────┘    └────────────┘  │
│                                  │
│  Rute Pemberian *                │
│  ┌──────────────────────────┐    │
│  │ Injeksi IM           ▼   │    │
│  └──────────────────────────┘    │
│                                  │
│  Frekuensi *     Durasi (hari) * │
│  ┌──────────┐    ┌────────────┐  │
│  │ 2× sehari│    │ 5          │  │
│  └──────────┘    └────────────┘  │
│                                  │
│  Tanggal Mulai *                 │
│  ┌──────────────────────────┐    │
│  │ 25 Jun 2026    📅        │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────────┐│
│  │ 🔴 MASA HENTI OBAT          ││  ← card highlight merah
│  │ Withdrawal period (hari)     ││
│  │ ┌──────────────────────────┐ ││
│  │ │ 10                       │ ││
│  │ └──────────────────────────┘ ││
│  │ ⚠ Aman jual/potong: 05 Jul  ││  ← auto-calculated real-time
│  └──────────────────────────────┘│
│                                  │
│  No. Batch Obat                  │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  Respons Awal                    │
│  [Membaik] [Tetap] [Memburuk]    │
│                                  │
│  [        Simpan          ]      │
└──────────────────────────────────┘

Withdrawal UX:
  - Saat user ketik angka withdrawal, tanggal aman auto-update
  - Card withdrawal selalu visible (tidak bisa di-collapse)
  - Warna card: danger-bg dengan border kiri merah 4dp
```

---

### Screen 9 — Form Karantina

```
┌──────────────────────────────────┐
│ ← Mulai Karantina                │
│                                  │
│  ┌──────────────────────────────┐│
│  │ ⚠️ PENYAKIT DICURIGAI        ││  ← warning banner
│  │ MENULAR — Isolasi diperlukan ││
│  └──────────────────────────────┘│
│                                  │
│  Penyakit Dicurigai *            │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  Kandang Karantina *             │
│  ┌──────────────────────────┐    │
│  │ Pilih kandang karantina ▼│    │  ← filter: hanya tipe quarantine
│  └──────────────────────────┘    │
│  Kapasitas: 5 | Terisi: 2       │
│                                  │
│  Tanggal Mulai *                 │
│  ┌──────────────────────────┐    │
│  │ 25 Jun 2026    📅        │    │
│  └──────────────────────────┘    │
│                                  │
│  Estimasi Durasi (hari) *        │
│  ┌──────────────────────────┐    │
│  │ 14                       │    │
│  └──────────────────────────┘    │
│  Estimasi selesai: 09 Jul 2026   │
│                                  │
│  Alasan / Catatan *              │
│  ┌──────────────────────────┐    │
│  │                          │    │
│  └──────────────────────────┘    │
│                                  │
│  [   🔒 Mulai Karantina   ]      │  ← danger button
│  Notifikasi akan dikirim ke      │
│  semua petugas aktif             │  ← caption info
└──────────────────────────────────┘

Post-submit:
  - Status ternak update ke QUARANTINE (badge pulse merah)
  - Toast: "A-012 dipindah ke karantina. Notifikasi terkirim."
  - Push FCM ke semua officer
  - Redirect ke halaman detail ternak (tab Karantina aktif)
```

---

### Screen 10 — Clearance Karantina

```
┌──────────────────────────────────┐
│ ← Clearance Karantina            │
│   #A-012 · Hari ke-14 karantina  │
│─────────────────────────────────│
│  ┌──────────────────────────────┐│
│  │ Karantina Aktif              ││
│  │ Mulai: 25 Jun — Estimasi: 09 Jul
│  │ Penyakit: Scabies            ││
│  │ Kandang: KARANTINA-01        ││
│  └──────────────────────────────┘│
│                                  │
│  Tanggal Clearance *             │
│  ┌──────────────────────────┐    │
│  │ 09 Jul 2026    📅        │    │
│  └──────────────────────────┘    │
│                                  │
│  Tes Bebas Penyakit Dilakukan? * │
│  ● Ya     ○ Tidak                │
│                                  │
│  Hasil Tes *                     │
│  ┌──────────────────────────────┐│
│  │ ✅ NEGATIF (Bebas Penyakit) ││  ← pill selector
│  │ ❌ POSITIF (Masih Terinfeksi)││
│  └──────────────────────────────┘│
│                                  │
│  [jika NEGATIF]                  │
│  Kembalikan ke Kandang *         │
│  ┌──────────────────────────┐    │
│  │ Kandang K-01         ▼   │    │
│  └──────────────────────────┘    │
│                                  │
│  Catatan Dokter/Petugas          │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  [  ✅ Selesaikan Karantina  ]   │  ← success button (jika negatif)
│  [  Lanjutkan Karantina     ]    │  ← outlined (jika positif)
└──────────────────────────────────┘

Post-clearance NEGATIF:
  - Status ternak → ACTIVE
  - Current pen → kandang asal
  - Toast: "✅ A-012 dinyatakan sehat. Dipindahkan ke K-01."
  - Timeline entry baru: "Clearance NEGATIF — Karantina selesai"
```

---

### Screen 11 — Form Vaksinasi

```
┌──────────────────────────────────┐
│ ← Catat Vaksinasi                │
│─────────────────────────────────│
│  Nama Vaksin *                   │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  Penyakit yang Dicegah *         │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  Dosis *     Satuan *            │
│  ┌────────┐  ┌──────────────┐    │
│  │ 2      │  │ ml       ▼   │    │
│  └────────┘  └──────────────┘    │
│                                  │
│  Rute Pemberian *                │
│  ┌──────────────────────────┐    │
│  │ Subkutan (SC)        ▼   │    │
│  └──────────────────────────┘    │
│                                  │
│  Tanggal Vaksinasi *             │
│  ┌──────────────────────────┐    │
│  │ 25 Jun 2026    📅        │    │
│  └──────────────────────────┘    │
│                                  │
│  Jadwal Booster Berikutnya       │
│  ┌──────────────────────────┐    │
│  │ 25 Sep 2026    📅        │    │  ← default +90 hari, editable
│  └──────────────────────────┘    │
│  → Reminder akan dikirim 7 hari  │
│    sebelum tanggal ini           │
│                                  │
│  Produsen                        │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  No. Batch                       │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  [        Simpan          ]      │
└──────────────────────────────────┘
```

---

### Screen 12 — Form Reproduksi

```
┌──────────────────────────────────┐
│ ← Catat Reproduksi               │
│   #A-012 — Betina                │
│─────────────────────────────────│
│  Tipe Event *                    │
│  ┌────────────────────────────┐  │
│  │ Pilih tipe event       ▼  │  │
│  └────────────────────────────┘  │
│                                  │
│  [Birahi] [Kawin] [Cek Bunting]  │
│  [Kelahiran] [Sapih]             │
│                                  │
│  Tanggal Event *                 │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  [Jika Tipe = Kawin]            │
│  Metode Perkawinan *             │
│  ● Kawin Alam   ○ IB (AI)       │
│                                  │
│  [Kawin Alam]: Pilih Pejantan    │
│  ┌──────────────────────────┐    │
│  │ Cari earTag pejantan  ▼  │    │
│  └──────────────────────────┘    │
│                                  │
│  [IB/AI]: Kode Straw             │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│  ID Pejantan Straw               │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  [Jika Tipe = Kelahiran]        │
│  Jumlah Anak *                   │
│  [1]  [2]  [3]                   │
│  Kemudahan Kelahiran (1–4) *     │
│  [1 Mudah] [2] [3] [4 Sulit]   │
│  Tipe Kelahiran *                │
│  ● Normal   ○ Dibantu  ○ Caesar │
│                                  │
│  Catatan                         │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  [        Simpan          ]      │
└──────────────────────────────────┘

Setelah kelahiran:
  - Prompt: "Daftarkan anak yang baru lahir?"
  - [Ya, Daftarkan Sekarang] → form add livestock
    (data dam_id sudah terisi otomatis)
```

---

### Screen 13 — Update Status Akhir

```
┌──────────────────────────────────┐
│ ← Update Status Ternak           │
│   #A-012 — Saat ini: ACTIVE      │
│─────────────────────────────────│
│  Status Baru *                   │
│                                  │
│  ┌──────────────────────────────┐│
│  │ 💰 Terjual (Sold)            ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ 💀 Mati (Dead)               ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ 🔄 Dipindah (Transferred)    ││
│  └──────────────────────────────┘│
│                                  │
│  [Jika Terjual]                 │
│  ┌──────────────────────────────┐│
│  │ ⚠️ PERIKSA WITHDRAWAL       ││  ← muncul jika ada withdrawal aktif
│  │ Hewan ini masih dalam masa   ││
│  │ henti obat hingga: 05 Jul    ││
│  │ Yakin ingin menjual?         ││
│  └──────────────────────────────┘│
│                                  │
│  Harga Jual (Rp)                 │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  Nama Pembeli                    │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  Tanggal *                       │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  Alasan / Keterangan *           │
│  ┌──────────────────────────┐    │
│  └──────────────────────────┘    │
│                                  │
│  [  ⚠ Konfirmasi Perubahan  ]   │  ← danger outlined
│                                  │
│  BottomSheet Konfirmasi:         │
│  "Status tidak dapat dibatalkan. │
│   Lanjutkan?"                    │
│  [Batal] [Ya, Konfirmasi]        │
└──────────────────────────────────┘
```

---

### Screen 14 — Laporan (Tab 2)

```
┌──────────────────────────────────┐
│  Laporan & Analitik              │
│─────────────────────────────────│
│  Periode:  [Jun 2026      ▼]    │
│─────────────────────────────────│
│  [📊 Pertumbuhan & ADG]    >    │
│  [🏥 Rekap Kesehatan]      >    │
│  [🍃 Biaya Pakan & FCR]    >    │
│  [🔄 Reproduksi]           >    │
│  [💉 Status Vaksinasi]     >    │
│  [⚠ Withdrawal Alert]     >    │  ← merah jika ada
│  [📦 Inventaris Kandang]   >    │
└──────────────────────────────────┘

Sub-screen Withdrawal Alert:
┌──────────────────────────────────┐
│ ← Withdrawal Alert               │
│─────────────────────────────────│
│  ⚠️  2 hewan TIDAK BOLEH         │
│     dijual atau dipotong          │
│─────────────────────────────────│
│  ┌────────────────────────────┐  │
│  │ #A-007 — Kambing PE Betina │  │
│  │ Ampicillin 5ml IM          │  │
│  │ Aman jual: 05 Jul 2026     │  │  ← merah jika belum lewat
│  │ Sisa: 10 hari              │  │
│  └────────────────────────────┘  │
│  ...                             │
└──────────────────────────────────┘
```

---

### Screen 15 — Setting (Tab 3)

```
┌──────────────────────────────────┐
│  Pengaturan                      │
│─────────────────────────────────│
│  [👤 Foto] Eden Al Farizi        │
│           Officer · Bodogol Farm │
│─────────────────────────────────│
│  AKUN                           │
│  Profil Saya                 >  │
│  Ganti Password              >  │
│─────────────────────────────────│
│  MANAJEMEN (Senior Officer+)    │
│  Kelola Petugas              >  │
│  Kelola Kandang              >  │
│  Master Data Pakan           >  │
│─────────────────────────────────│
│  SINKRONISASI                   │
│  Status Sync: ✅ Tersinkron      │
│  Terakhir sync: 5 menit lalu    │
│  [Sync Sekarang]                │
│─────────────────────────────────│
│  LAINNYA                        │
│  Notifikasi                  >  │
│  Tentang Aplikasi            >  │
│  Versi: 1.0.0                   │
│─────────────────────────────────│
│  [       Keluar           ]     │  ← outlined danger
└──────────────────────────────────┘
```

---

## 5. Navigation Architecture

### 5.1 Bottom Tab Navigator (3 Tab)

```
Tab 1: Beranda (Dashboard)   → icon: home
Tab 2: Ternak               → icon: cow (aktif saat di halaman apapun /livestock/*)
Tab 3: Laporan              → icon: chart-bar
       + badge count alert jika ada withdrawal/karantina

Tidak ada tab Setting di bottom — akses via icon profil di header
```

### 5.2 Stack Navigation Flow

```
Auth Stack
  Login

App Stack (setelah auth)
  BottomTab
    ├── Dashboard
    ├── LivestockList
    │     └── LivestockDetail
    │           ├── GrowthForm
    │           ├── FeedingForm
    │           ├── HealthForm
    │           │     └── MedicationForm (opsional, lanjutan)
    │           │           └── QuarantineForm (opsional, lanjutan)
    │           ├── VaccinationForm
    │           ├── ReproductionForm
    │           ├── StatusUpdateForm
    │           └── ClearanceForm
    └── Reports
          ├── GrowthReport
          ├── HealthReport
          ├── FeedCostReport
          ├── WithdrawalAlert
          └── VaccinationDue

Setting (modal stack dari profil icon)
  ProfileScreen
  ChangePasswordScreen
  ManageOfficerScreen (senior+)
  ManagePenScreen (senior+)
  FeedMasterScreen (senior+)
  NotificationSettingScreen
  AboutScreen
```

---

## 6. UX Patterns & Micro-interactions

### 6.1 Pull-to-Refresh
Semua list screen mendukung pull-to-refresh untuk trigger sync online.

### 6.2 Optimistic UI
Saat offline: form langsung tersimpan ke local queue, tampil di timeline dengan badge "⏳ Menunggu sync". Saat sync berhasil, badge hilang.

### 6.3 Konfirmasi Aksi Destruktif
Update status ke Sold/Dead/Transferred selalu melalui BottomSheet konfirmasi 2 langkah sebelum eksekusi.

### 6.4 Loading States

```
Skeleton loader → list hewan saat pertama load
Shimmer effect → card di dashboard
Spinner inline → dalam tombol submit
Full-screen loading → hanya saat login pertama kali
```

### 6.5 Empty States

```
Daftar ternak kosong:
  [Ilustrasi kandang kosong]
  "Belum ada ternak terdaftar"
  [+ Daftarkan Ternak Pertama]

Tab Timeline kosong:
  "Belum ada catatan. Mulai dengan menambahkan record."

Laporan kosong:
  "Tidak ada data untuk periode ini."
```

### 6.6 Toast Notifications

```
Sukses: bg success, icon check-circle, teks putih, 3 detik
Warning: bg warning, icon alert
Error: bg danger, icon close-circle
Info: bg info, icon information
Posisi: bawah screen, di atas bottom tab
```

### 6.7 Offline Indicator

```
Banner kuning slim (32dp) di bawah header:
"📵 Tidak ada koneksi — Data disimpan lokal"
Hilang otomatis saat online kembali.
```

### 6.8 Swipe Actions (LivestockCard di list)

```
Swipe kiri → reveal:
  [Edit] [Pindah Kandang]
Swipe kanan → reveal:
  [Catat Cepat ▼]
    → Growth / Feeding / Health
```

---

## 7. Accessibility

| Aspek | Implementasi |
|---|---|
| Tap target | Minimum 48×48dp semua elemen interaktif |
| Kontras teks | Minimum 4.5:1 untuk body, 3:1 untuk heading besar |
| Reduced motion | Animasi dimatikan jika `useReducedMotion()` aktif |
| Screen reader | `accessibilityLabel` di setiap icon-only button |
| Keyboard nav | Form selalu bisa navigasi dengan `returnKeyType` benar |
| Font scaling | UI layout tidak pecah hingga font scale 1.5× |

---

## 8. Design Deliverables Checklist

| Item | Status |
|---|---|
| Color token system | Didokumentasikan di Bab 2 |
| Typography scale | Didokumentasikan di Bab 2 |
| Spacing & grid | Didokumentasikan di Bab 2 |
| Component library (15 komponen) | Didokumentasikan di Bab 3 |
| Wireframe semua screen (15 screen) | Didokumentasikan di Bab 4 |
| Navigation architecture | Didokumentasikan di Bab 5 |
| UX patterns & micro-interactions | Didokumentasikan di Bab 6 |
| Accessibility checklist | Didokumentasikan di Bab 7 |
| Figma file (recommended) | Tim implementasi |
| Prototype interaktif (recommended) | Tim implementasi |

---

## 9. Tools & Handoff

### Figma Setup yang Disarankan
- **Satu file** dengan 3 Pages: `Tokens`, `Components`, `Screens`
- Gunakan **Figma Variables** untuk semua color dan spacing token
- **Auto Layout** di semua komponen untuk responsivitas
- **Component Variants** untuk semua state (default, focused, error, disabled)
- Export semua icon sebagai SVG 24×24dp

### Implementasi di React Native
```
src/
  theme/
    colors.ts       ← semua color token
    typography.ts   ← semua type scale
    spacing.ts      ← spacing system
    shadows.ts      ← elevation values
  components/
    ui/
      StatusBadge.tsx
      AlertCard.tsx
      FormField.tsx
      VitalSignsInput.tsx
      TimelineItem.tsx
      SummaryStatCard.tsx
      Button.tsx
      FAB.tsx
      BottomSheet.tsx
      LivestockCard.tsx
    screens/
      [per screen]
```

---

*PRD Design ini adalah panduan lengkap untuk implementasi UI/UX Livestock Recording App Bodogol Farm. Sesuaikan dengan feedback user testing dan kondisi lapangan aktual.*

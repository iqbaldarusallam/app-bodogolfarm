# Panduan Setup Stitch MCP di Claude Code

## Metode: API Key (Paling Mudah)

### Langkah 1: Generate API Key di Stitch

1. Buka browser → https://stitch.withgoogle.com
2. Login dengan akun Google kamu
3. Klik avatar/profile → **Settings**
4. Scroll ke bagian **API Keys**
5. Klik **"Create API Key"**
6. Beri nama: `claude-code`
7. **Copy API key** yang muncul (simpan baik-baik, tidak bisa dilihat lagi)

### Langkah 2: Tambahkan ke Claude Code

Buka **terminal baru** (bukan di dalam Claude Code), jalankan:

```bash
claude mcp add stitch --transport http https://stitch.googleapis.com/mcp --header "X-Goog-Api-Key: API_KEY_KAMU" -s user
```

Ganti `API_KEY_KAMU` dengan API key dari Langkah 1.

### Langkah 3: Restart Claude Code

Tutup Claude Code, buka ulang.

### Langkah 4: Verifikasi

Di Claude Code, minta:
```
List semua project di Stitch
```

Kalau berhasil, Claude akan menampilkan project "PRD Alignment Tool" dan 10 screen-nya.

---

## Troubleshooting

### API Key expired / tidak valid
- Generate key baru di Stitch Settings
- Jalankan ulang perintah Langkah 2 dengan key baru

### Command `claude` tidak ditemukan
- Pastikan Claude Code CLI terinstall: `npm install -g @anthropic-ai/claude-code`
- Atau jalankan dari dalam VS Code Command Palette

### Masih error "incompatible auth"
- Hapus credential lama: edit `C:\Users\USER\.claude\credentials.json`, hapus bagian `stitch`
- Restart Claude Code
- Jalankan ulang perintah add

---

## Info Project

| Item | Value |
|---|---|
| Project | PRD Alignment Tool |
| Project ID | `2072373004645407569` |
| MCP URL | `https://stitch.googleapis.com/mcp` |
| Total Screen | 10 |

---

## Setelah Berhasil

Minta Claude:
```
Ambil screen Login dari Stitch project PRD Alignment Tool, 
terapkan di app kita mengikuti design-nya
```

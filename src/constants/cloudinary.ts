// ─────────────────────────────────────────────────────────
// Konfigurasi Cloudinary (upload foto ternak)
// ─────────────────────────────────────────────────────────
// Nilai ini TIDAK rahasia (memang terekspos di client untuk unsigned upload),
// jadi aman ditaruh di sini. Isi setelah daftar akun Cloudinary gratis:
//
//   1. Daftar di https://cloudinary.com (gratis)
//   2. CLOUD_NAME ada di Dashboard (mis. "dxxxxxx")
//   3. Buat "Upload preset" UNSIGNED:
//      Settings → Upload → Upload presets → Add upload preset
//      → Signing Mode: Unsigned → simpan namanya di UPLOAD_PRESET
//
// Opsional: set lewat app.json → extra.cloudinary agar tidak hardcode.

import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra as { cloudinary?: { cloudName?: string; uploadPreset?: string } } | undefined)?.cloudinary;

export const CLOUDINARY_CLOUD_NAME = extra?.cloudName ?? 'GANTI_CLOUD_NAME';
export const CLOUDINARY_UPLOAD_PRESET = extra?.uploadPreset ?? 'GANTI_UPLOAD_PRESET';

// Folder di Cloudinary tempat foto ternak disimpan (opsional, rapi).
export const CLOUDINARY_FOLDER = 'bodogol/livestock';

export function isCloudinaryConfigured(): boolean {
  return (
    !!CLOUDINARY_CLOUD_NAME &&
    !CLOUDINARY_CLOUD_NAME.startsWith('GANTI_') &&
    !!CLOUDINARY_UPLOAD_PRESET &&
    !CLOUDINARY_UPLOAD_PRESET.startsWith('GANTI_')
  );
}

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// ─────────────────────────────────────────────────────────
// Upload foto — pilih (kamera/galeri) → kompres → Cloudinary
// ─────────────────────────────────────────────────────────

import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

import {
  CLOUDINARY_UPLOAD_URL,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_FOLDER,
  isCloudinaryConfigured,
} from '@/constants/cloudinary';

export type PickSource = 'camera' | 'gallery';

// ── Pilih gambar dari kamera atau galeri ──
// Mengembalikan URI lokal, atau null jika dibatalkan.
export async function pickImage(source: PickSource): Promise<string | null> {
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      throw new Error('Izin kamera ditolak. Aktifkan di pengaturan HP.');
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    return result.canceled ? null : result.assets[0].uri;
  }

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    throw new Error('Izin galeri ditolak. Aktifkan di pengaturan HP.');
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  return result.canceled ? null : result.assets[0].uri;
}

// ── Kompres + resize agar ringan (target < ~1MB) ──
async function compressImage(uri: string): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    { compress: 0.6, format: SaveFormat.JPEG },
  );
  return result.uri;
}

// ── Upload ke Cloudinary (unsigned) → kembalikan secure_url ──
export async function uploadToCloudinary(localUri: string): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary belum dikonfigurasi. Isi CLOUD_NAME & UPLOAD_PRESET di src/constants/cloudinary.ts',
    );
  }

  const compressedUri = await compressImage(localUri);

  // Pakai expo-file-system uploadAsync (baca file native) — hindari
  // FormData+fetch yang error "Unsupported FormDataPart implementation" di RN baru.
  const res = await FileSystem.uploadAsync(CLOUDINARY_UPLOAD_URL, compressedUri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'file',
    mimeType: 'image/jpeg',
    parameters: {
      upload_preset: CLOUDINARY_UPLOAD_PRESET,
      folder: CLOUDINARY_FOLDER,
    },
  });

  if (res.status < 200 || res.status >= 300) {
    let msg = 'Upload foto gagal';
    try {
      msg = JSON.parse(res.body)?.error?.message ?? msg;
    } catch {
      // abaikan parse error
    }
    throw new Error(msg);
  }

  const data = JSON.parse(res.body) as { secure_url?: string };
  if (!data.secure_url) throw new Error('Upload foto gagal: URL tidak diterima');
  return data.secure_url;
}

// ── Helper gabungan: pilih → kompres → upload ──
export async function pickAndUpload(source: PickSource): Promise<string | null> {
  const localUri = await pickImage(source);
  if (!localUri) return null;
  return uploadToCloudinary(localUri);
}

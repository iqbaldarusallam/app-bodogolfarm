// ─────────────────────────────────────────────────────────
// PhotoPicker — ambil/ganti/hapus foto ternak (upload ke Cloudinary)
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { pickAndUpload, type PickSource } from '@/services/upload';

interface PhotoPickerProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function PhotoPicker({ value, onChange }: PhotoPickerProps) {
  const [uploading, setUploading] = useState(false);

  async function handlePick(source: PickSource) {
    setUploading(true);
    try {
      const url = await pickAndUpload(source);
      if (url) onChange(url);
    } catch (e) {
      Alert.alert('Gagal', e instanceof Error ? e.message : 'Gagal mengunggah foto.');
    } finally {
      setUploading(false);
    }
  }

  function openMenu() {
    if (uploading) return;
    const options: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = [
      { text: 'Ambil Foto (Kamera)', onPress: () => handlePick('camera') },
      { text: 'Pilih dari Galeri', onPress: () => handlePick('gallery') },
    ];
    if (value) {
      options.push({ text: 'Hapus Foto', style: 'destructive', onPress: () => onChange(null) });
    }
    options.push({ text: 'Batal', style: 'cancel' });
    Alert.alert('Foto Ternak', undefined, options);
  }

  return (
    <View className="items-center gap-2">
      <Pressable
        onPress={openMenu}
        disabled={uploading}
        className="h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-lowest active:opacity-80"
      >
        {value ? (
          <Image source={{ uri: value }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="items-center gap-1">
            <MaterialCommunityIcons name="camera-plus-outline" size={32} color="#707973" />
            <Text className="text-caption text-on-surface-variant">Tambah Foto</Text>
          </View>
        )}

        {uploading && (
          <View className="absolute inset-0 items-center justify-center bg-black/40">
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}
      </Pressable>

      {value && !uploading && (
        <Pressable onPress={openMenu} hitSlop={8}>
          <Text className="text-label-md font-medium text-primary">Ganti foto</Text>
        </Pressable>
      )}
    </View>
  );
}

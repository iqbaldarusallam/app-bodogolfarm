// ─────────────────────────────────────────────────────────
// Kelola Petugas — User Management Modal (senior+ akses, hapus = manager)
// ─────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, TextInput, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/auth';
import { usePermissions } from '@/lib/permissions';
import { getUsers, createUser, updateUser, deleteUser, type CreateUserInput } from '@/services/users';
import type { UserRole } from '@/types/auth';

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Petugas', value: 'officer' },
  { label: 'Senior Officer', value: 'senior_officer' },
  { label: 'Manajer', value: 'manager' },
];

function roleLabel(role: UserRole): string {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
}

export default function ManageUsersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const { isManager } = usePermissions();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // ── Create form ──
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('officer');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedRoleLabel = useMemo(() => roleLabel(role), [role]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('officer');
    setErrors({});
  };

  const createMut = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      resetForm();
      setShowForm(false);
    },
    onError: (err: any) => setErrors({ submit: err?.message || 'Gagal menyimpan petugas' }),
  });

  const toggleActiveMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateUser(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: (err: any) => Alert.alert('Gagal', err?.message || 'Gagal memperbarui status'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: (err: any) => Alert.alert('Gagal', err?.message || 'Gagal menghapus petugas'),
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Nama minimal 2 karakter';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'Format email tidak valid';
    if (password.length < 8) e.password = 'Password minimal 8 karakter';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    const input: CreateUserInput = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      farm_id: currentUser!.farm_id,
    };
    createMut.mutate(input);
  };

  const confirmDelete = (id: string, displayName: string) => {
    Alert.alert('Hapus Petugas', `Hapus akun "${displayName}"? Tindakan ini tidak bisa dibatalkan.`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteMut.mutate(id) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View className="flex-row items-center justify-between bg-surface px-gutter py-sm shadow-sm">
        <View className="flex-row items-center gap-md">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F5238" />
          </Pressable>
          <Text className="font-headline text-headline-md font-bold text-primary">Kelola Petugas</Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-primary-fixed">
          <MaterialCommunityIcons name="account-group" size={20} color="#0F5238" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Add Button */}
        <Pressable
          onPress={() => {
            if (showForm) resetForm();
            setShowForm((v) => !v);
          }}
          className="mb-4 flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary bg-primary-container/30 py-3 active:scale-[0.98]"
        >
          <MaterialCommunityIcons name={showForm ? 'close' : 'plus'} size={20} color="#0F5238" />
          <Text className="font-headline text-headline-sm font-semibold text-primary">
            {showForm ? 'Batal' : 'Tambah Petugas'}
          </Text>
        </Pressable>

        {/* Inline Form */}
        {showForm && (
          <View className="mb-6 gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
            <View className="gap-1">
              <Text className="px-1 text-label-md font-medium text-on-surface-variant">Nama</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nama lengkap"
                placeholderTextColor="#BFC9C1"
                className="h-[48px] rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
              />
              {errors.name && <Text className="text-caption text-error">{errors.name}</Text>}
            </View>

            <View className="gap-1">
              <Text className="px-1 text-label-md font-medium text-on-surface-variant">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="nama@bodogol.farm"
                placeholderTextColor="#BFC9C1"
                className="h-[48px] rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
              />
              {errors.email && <Text className="text-caption text-error">{errors.email}</Text>}
            </View>

            <View className="gap-1">
              <Text className="px-1 text-label-md font-medium text-on-surface-variant">Password Awal</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                placeholder="Minimal 8 karakter"
                placeholderTextColor="#BFC9C1"
                className="h-[48px] rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
              />
              {errors.password && <Text className="text-caption text-error">{errors.password}</Text>}
            </View>

            {/* Role */}
            <View className="gap-1">
              <Text className="px-1 text-label-md font-medium text-on-surface-variant">Role</Text>
              <View className="relative">
                <Pressable
                  onPress={() => setShowRoleDropdown((v) => !v)}
                  className="h-[48px] flex-row items-center justify-between rounded-xl border border-outline-variant bg-surface px-4"
                >
                  <Text className="text-body-md text-on-surface">{selectedRoleLabel}</Text>
                  <MaterialCommunityIcons
                    name={showRoleDropdown ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#707973"
                  />
                </Pressable>
                {showRoleDropdown && (
                  <View className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-outline-variant bg-white shadow-lg">
                    {ROLE_OPTIONS.map((r) => (
                      <Pressable
                        key={r.value}
                        onPress={() => {
                          setRole(r.value);
                          setShowRoleDropdown(false);
                        }}
                        className={`border-b border-outline-variant/50 px-4 py-3 active:bg-surface-container-low ${
                          role === r.value ? 'bg-primary-container/30' : ''
                        }`}
                      >
                        <Text className="text-body-md text-on-surface">{r.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {errors.submit && (
              <View className="flex-row items-center gap-2 rounded-lg border border-error-container bg-error-container/30 p-3">
                <MaterialCommunityIcons name="alert-circle" size={16} color="#BA1A1A" />
                <Text className="flex-1 text-caption text-error">{errors.submit}</Text>
              </View>
            )}

            <Pressable
              onPress={onSubmit}
              disabled={createMut.isPending}
              className={`h-12 flex-row items-center justify-center gap-2 rounded-xl shadow-md active:scale-[0.98] ${
                createMut.isPending ? 'bg-primary/60' : 'bg-primary'
              }`}
            >
              {createMut.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
              )}
              <Text className="font-headline text-headline-sm font-bold text-on-primary">
                {createMut.isPending ? 'Menyimpan...' : 'Simpan Petugas'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* User List */}
        {isLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color="#0F5238" />
            <Text className="mt-3 text-body-md text-on-surface-variant">Memuat petugas...</Text>
          </View>
        ) : users.length === 0 ? (
          <View className="items-center rounded-xl border border-outline-variant bg-surface-container-lowest py-10">
            <MaterialCommunityIcons name="account-group" size={48} color="#BFC9C1" />
            <Text className="mt-3 font-headline text-headline-sm text-on-surface-variant">Belum ada petugas</Text>
          </View>
        ) : (
          <View className="gap-3">
            {users.map((u) => {
              const isSelf = u._id === currentUser?._id;
              return (
                <View
                  key={u._id}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 flex-row items-center gap-3">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-container">
                        <MaterialCommunityIcons name="account" size={20} color="#0F5238" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-headline text-headline-sm font-bold text-on-surface">
                          {u.name}{isSelf ? ' (Anda)' : ''}
                        </Text>
                        <Text className="text-caption text-on-surface-variant">{u.email}</Text>
                      </View>
                    </View>
                    <View className="items-end gap-1">
                      <View className="rounded-full bg-primary-container/40 px-2.5 py-1">
                        <Text className="text-[11px] font-bold text-primary">{roleLabel(u.role)}</Text>
                      </View>
                      <View className={`rounded-full px-2.5 py-0.5 ${u.is_active ? 'bg-status-active/10' : 'bg-outline-variant/30'}`}>
                        <Text className={`text-[10px] font-bold ${u.is_active ? 'text-status-active' : 'text-on-surface-variant'}`}>
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions — tidak untuk akun sendiri */}
                  {!isSelf && (
                    <View className="mt-3 flex-row gap-2 border-t border-outline-variant/50 pt-3">
                      <Pressable
                        onPress={() => toggleActiveMut.mutate({ id: u._id, is_active: !u.is_active })}
                        disabled={toggleActiveMut.isPending}
                        className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-outline-variant py-2 active:bg-surface-container"
                      >
                        <MaterialCommunityIcons
                          name={u.is_active ? 'account-cancel-outline' : 'account-check-outline'}
                          size={18}
                          color="#404943"
                        />
                        <Text className="text-label-md font-medium text-on-surface-variant">
                          {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Text>
                      </Pressable>

                      {isManager && (
                        <Pressable
                          onPress={() => confirmDelete(u._id, u.name)}
                          disabled={deleteMut.isPending}
                          className="flex-row items-center justify-center gap-1.5 rounded-lg border border-danger/30 bg-danger-light px-4 py-2 active:opacity-70"
                        >
                          <MaterialCommunityIcons name="delete-outline" size={18} color="#BA1A1A" />
                          <Text className="text-label-md font-semibold text-error">Hapus</Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

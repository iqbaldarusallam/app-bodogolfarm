// ─────────────────────────────────────────────────────────
// Tabs layout — Bodogol main navigation
// ─────────────────────────────────────────────────────────

import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { usePermissions } from '@/lib/permissions';

export default function TabsLayout() {
  const { canViewReports } = usePermissions();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0F5238',
        tabBarInactiveTintColor: '#404943',
        tabBarStyle: {
          height: Platform.select({ ios: 84, android: 72 }),
          paddingBottom: Platform.select({ ios: 22, android: 10 }),
          paddingTop: 8,
          backgroundColor: '#FCF8FB',
          borderTopWidth: 1,
          borderTopColor: '#E4E2E4',
          elevation: 8,
          shadowColor: '#000000',
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          borderRadius: 999,
          marginHorizontal: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'view-dashboard' : 'view-dashboard-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="livestock"
        options={{
          title: 'Ternak',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cow" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          // Laporan hanya untuk senior officer ke atas; sembunyikan tab utk officer.
          href: canViewReports ? undefined : null,
          title: 'Laporan',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hidden tab — accessed via profile icon in header
        }}
      />
    </Tabs>
  );
}

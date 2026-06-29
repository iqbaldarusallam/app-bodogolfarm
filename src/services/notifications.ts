// ─────────────────────────────────────────────────────────
// Notifications API calls — aggregate alerts from various sources
// ─────────────────────────────────────────────────────────

import { api } from './api';

export interface NotificationItem {
  id: string;
  type: 'vaccination_due' | 'withdrawal_active' | 'low_stock' | 'sick_livestock' | 'quarantine_active';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  livestock_id?: string;
  livestock_ear_tag?: string;
  created_at: string;
  is_read: boolean;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unread_count: number;
  summary: {
    vaccination_due: number;
    withdrawal_active: number;
    low_stock: number;
    sick_livestock: number;
    quarantine_active: number;
  };
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(): Promise<NotificationsResponse> {
  const { data } = await api.get<{ success: boolean; data: NotificationsResponse }>('/notifications');
  return data.data;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  await api.put(`/notifications/${notificationId}/read`);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  await api.put('/notifications/read-all');
}

/**
 * Get notification count (for badge)
 */
export async function getNotificationCount(): Promise<{ unread_count: number }> {
  const { data } = await api.get<{ success: boolean; data: { unread_count: number } }>('/notifications/count');
  return data.data;
}

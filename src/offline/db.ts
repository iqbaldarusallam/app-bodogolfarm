// ─────────────────────────────────────────────────────────
// Offline queue — SQLite local storage for pending mutations
// ─────────────────────────────────────────────────────────

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export interface OfflineQueueItem {
  id: number;
  collection: string;
  operation: 'create' | 'update' | 'delete';
  payload: string; // JSON stringified
  endpoint: string; // API endpoint to call
  method: 'POST' | 'PUT' | 'DELETE';
  created_at: string;
  retry_count: number;
  status: 'pending' | 'synced' | 'failed';
}

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('bodogol_offline.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        created_at TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending'
      );
    `);
  }
  return db;
}

export async function enqueue(item: Omit<OfflineQueueItem, 'id' | 'created_at' | 'retry_count' | 'status'>): Promise<number> {
  const database = await getDb();
  const result = await database.runAsync(
    `INSERT INTO offline_queue (collection, operation, payload, endpoint, method, created_at, retry_count, status)
     VALUES (?, ?, ?, ?, ?, ?, 0, 'pending')`,
    [item.collection, item.operation, item.payload, item.endpoint, item.method, new Date().toISOString()],
  );
  return result.lastInsertRowId;
}

export async function getPendingItems(): Promise<OfflineQueueItem[]> {
  const database = await getDb();
  return database.getAllAsync<OfflineQueueItem>(
    `SELECT * FROM offline_queue WHERE status = 'pending' ORDER BY created_at ASC`,
  );
}

export async function markSynced(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `UPDATE offline_queue SET status = 'synced' WHERE id = ?`,
    [id],
  );
}

export async function markFailed(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `UPDATE offline_queue SET status = 'failed', retry_count = retry_count + 1 WHERE id = ?`,
    [id],
  );
}

export async function removeSynced(): Promise<void> {
  const database = await getDb();
  await database.runAsync(`DELETE FROM offline_queue WHERE status = 'synced'`);
}

export async function getQueueStats(): Promise<{ pending: number; failed: number; synced: number }> {
  const database = await getDb();
  const pending = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM offline_queue WHERE status = 'pending'`,
  );
  const failed = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM offline_queue WHERE status = 'failed'`,
  );
  const synced = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM offline_queue WHERE status = 'synced'`,
  );
  return {
    pending: pending?.count ?? 0,
    failed: failed?.count ?? 0,
    synced: synced?.count ?? 0,
  };
}

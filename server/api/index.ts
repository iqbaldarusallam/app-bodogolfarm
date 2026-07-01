// ─────────────────────────────────────────────────────────
// Vercel Serverless entry — membungkus Express app
// Semua request di-rewrite ke sini (lihat vercel.json), lalu diteruskan
// ke Express app yang sama seperti di lokal.
// ─────────────────────────────────────────────────────────

import app from '../src/app';
import { connectDatabase } from '../src/config';

// Cache koneksi DB antar-invocation.
let ready: Promise<void> | null = null;

export default async function handler(req: any, res: any) {
  try {
    if (!ready) ready = connectDatabase();
    await ready;
  } catch {
    ready = null; // biar invocation berikutnya bisa coba lagi
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Koneksi database gagal' }));
    return;
  }

  // Express app adalah request handler — teruskan req/res ke sana.
  return (app as unknown as (req: any, res: any) => void)(req, res);
}

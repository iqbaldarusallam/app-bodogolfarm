// ─────────────────────────────────────────────────────────
// Seed Script — Bodogol Farm Livestock Recording
// Creates realistic demo data for all collections
// ─────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './config';

// ── Helpers ──

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// ── Main Seed ──

async function seed() {
  console.log('🌱 Starting seed...\n');

  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const db = mongoose.connection.db!;

  // Drop existing data
  const collectionsToDrop = [
    'farms', 'users', 'pens', 'livestocks', 'feedmasters',
    'growthrecords', 'feedinglogs', 'healthrecords', 'medicationlogs',
    'vaccinationrecords', 'quarantinerecords', 'reproductionrecords',
    'statushistories', 'offlinequeues',
  ];
  for (const col of collectionsToDrop) {
    try { await db.dropCollection(col); } catch {}
  }
  console.log('🗑️  Cleared existing data\n');

  // ──────────────────────────────────────
  // 1. Farm
  // ──────────────────────────────────────
  const farmResult = await db.collection('farms').insertOne({
    name: 'Bodogol Farm',
    address: 'Jl. Raya Puncak Km 84, Bogor, Jawa Barat',
    owner: 'PT Bodogol Agro Nusantara',
    created_at: new Date(),
    updated_at: new Date(),
  });
  const farmId = farmResult.insertedId;
  console.log('✅ Farm: Bodogol Farm');

  // ──────────────────────────────────────
  // 2. Users
  // ──────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 12);

  const usersResult = await db.collection('users').insertMany([
    { name: 'Eden Al Farizi', email: 'eden@bodogol.farm', password: passwordHash, role: 'manager', farm_id: farmId, is_active: true, created_at: new Date(), updated_at: new Date() },
    { name: 'Iqbal Darusallam', email: 'iqbal@bodogol.farm', password: passwordHash, role: 'senior_officer', farm_id: farmId, is_active: true, created_at: new Date(), updated_at: new Date() },
    { name: 'Celvine Brains', email: 'celvine@bodogol.farm', password: passwordHash, role: 'officer', farm_id: farmId, is_active: true, created_at: new Date(), updated_at: new Date() },
    { name: 'Ahmad Ridwan', email: 'ahmad@bodogol.farm', password: passwordHash, role: 'officer', farm_id: farmId, is_active: true, created_at: new Date(), updated_at: new Date() },
  ]);
  const userIds = Object.values(usersResult.insertedIds);
  const [edenId, iqbalId, celvineId] = userIds;
  console.log(`✅ Users: ${userIds.length} created`);

  // ──────────────────────────────────────
  // 3. Pens
  // ──────────────────────────────────────
  const pensResult = await db.collection('pens').insertMany([
    { farm_id: farmId, pen_code: 'K-01', pen_type: 'regular', capacity: 20, current_count: 5, description: 'Kandang utama kambing', is_active: true, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, pen_code: 'K-02', pen_type: 'regular', capacity: 15, current_count: 3, description: 'Kandang domba', is_active: true, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, pen_code: 'K-03', pen_type: 'fattening', capacity: 12, current_count: 2, description: 'Kandang penggemukan sapi', is_active: true, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, pen_code: 'K-04', pen_type: 'regular', capacity: 10, current_count: 1, description: 'Kandang kerbau', is_active: true, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, pen_code: 'KARANTINA-01', pen_type: 'quarantine', capacity: 5, current_count: 1, description: 'Kandang isolasi penyakit menular', is_active: true, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, pen_code: 'NURSERY-01', pen_type: 'nursery', capacity: 10, current_count: 2, description: 'Kandang indukan dan anak', is_active: true, created_at: new Date(), updated_at: new Date() },
  ]);
  const penIds = Object.values(pensResult.insertedIds);
  const [k01, k02, k03, k04, kar01, nur01] = penIds;
  console.log(`✅ Pens: ${penIds.length} created`);

  // ──────────────────────────────────────
  // 4. Livestock (16 animals)
  // ──────────────────────────────────────
  const livestockEntries = [
    // K-01: Kambing (5 active, 1 dead)
    { farm_id: farmId, ear_tag: 'A-001', national_id: 'SINKNAS-A001', name: 'Jago', species: 'kambing', breed: 'PE', sex: 'male', birth_date: daysAgo(730), origin: 'own_birth', current_pen_id: k01, current_status: 'active', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, ear_tag: 'A-002', national_id: 'SINKNAS-A002', name: 'Ratu', species: 'kambing', breed: 'PE', sex: 'female', birth_date: daysAgo(900), origin: 'purchase', purchase_date: daysAgo(600), purchase_price: 3500000, current_pen_id: k01, current_status: 'active', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, ear_tag: 'A-003', national_id: 'SINKNAS-A003', name: 'Putri', species: 'kambing', breed: 'Kacang', sex: 'female', birth_date: daysAgo(540), origin: 'own_birth', current_pen_id: k01, current_status: 'active', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, ear_tag: 'A-004', national_id: 'SINKNAS-A004', name: 'Bimo', species: 'kambing', breed: 'Etawa', sex: 'male', birth_date: daysAgo(400), origin: 'purchase', purchase_date: daysAgo(200), purchase_price: 5000000, current_pen_id: k01, current_status: 'sick', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, ear_tag: 'A-005', national_id: 'SINKNAS-A005', name: 'Sari', species: 'kambing', breed: 'PE', sex: 'female', birth_date: daysAgo(650), origin: 'own_birth', current_pen_id: k01, current_status: 'active', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, ear_tag: 'A-008', national_id: 'SINKNAS-A008', name: 'Mati1', species: 'kambing', breed: 'Kacang', sex: 'female', birth_date: daysAgo(800), origin: 'purchase', purchase_date: daysAgo(400), purchase_price: 3000000, current_pen_id: k01, current_status: 'dead', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    // K-02: Domba (3)
    { farm_id: farmId, ear_tag: 'D-001', national_id: 'SINKNAS-D001', name: 'Woolly', species: 'domba', breed: 'Garut', sex: 'male', birth_date: daysAgo(500), origin: 'purchase', purchase_date: daysAgo(300), purchase_price: 4000000, current_pen_id: k02, current_status: 'active', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, ear_tag: 'D-002', national_id: 'SINKNAS-D002', name: 'Merino', species: 'domba', breed: 'Garut', sex: 'female', birth_date: daysAgo(600), origin: 'own_birth', current_pen_id: k02, current_status: 'active', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, ear_tag: 'D-003', national_id: 'SINKNAS-D003', name: 'Gemuk', species: 'domba', breed: 'Ekor Gemuk', sex: 'female', birth_date: daysAgo(450), origin: 'purchase', purchase_date: daysAgo(100), purchase_price: 3800000, current_pen_id: k02, current_status: 'active', created_by: celvineId, created_at: new Date(), updated_at: new Date() },
    // K-03: Sapi (2 active, 1 sold)
    { farm_id: farmId, ear_tag: 'S-001', national_id: 'SINKNAS-S001', name: 'Brangus', species: 'sapi', breed: 'Limousin', sex: 'male', birth_date: daysAgo(1100), origin: 'purchase', purchase_date: daysAgo(500), purchase_price: 18000000, current_pen_id: k03, current_status: 'active', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, ear_tag: 'S-002', national_id: 'SINKNAS-S002', name: 'Perah', species: 'sapi', breed: 'Friesian Holstein', sex: 'female', birth_date: daysAgo(1400), origin: 'purchase', purchase_date: daysAgo(800), purchase_price: 22000000, current_pen_id: k03, current_status: 'active', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, ear_tag: 'S-003', national_id: 'SINKNAS-S003', name: 'Jantan', species: 'sapi', breed: 'Ongole', sex: 'male', birth_date: daysAgo(900), origin: 'own_birth', current_pen_id: k03, current_status: 'sold', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    // K-04: Kerbau (1)
    { farm_id: farmId, ear_tag: 'K-001', national_id: 'SINKNAS-K001', name: 'Kerbau Hitam', species: 'kerbau', breed: 'Murrah', sex: 'male', birth_date: daysAgo(1500), origin: 'purchase', purchase_date: daysAgo(700), purchase_price: 25000000, current_pen_id: k04, current_status: 'active', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    // Karantina (1)
    { farm_id: farmId, ear_tag: 'A-006', national_id: 'SINKNAS-A006', name: 'Sakit1', species: 'kambing', breed: 'PE', sex: 'male', birth_date: daysAgo(300), origin: 'own_birth', current_pen_id: kar01, current_status: 'quarantine', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    // Nursery (2)
    { farm_id: farmId, ear_tag: 'A-007', national_id: 'SINKNAS-A007', name: 'Anak1', species: 'kambing', breed: 'PE', sex: 'female', birth_date: daysAgo(30), origin: 'own_birth', current_pen_id: nur01, current_status: 'active', created_by: iqbalId, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, ear_tag: 'D-004', national_id: 'SINKNAS-D004', name: 'AnakDomba', species: 'domba', breed: 'Garut', sex: 'male', birth_date: daysAgo(45), origin: 'own_birth', current_pen_id: nur01, current_status: 'active', created_by: celvineId, created_at: new Date(), updated_at: new Date() },
  ];

  const livestockResult = await db.collection('livestocks').insertMany(livestockEntries);
  const livestockIds = Object.values(livestockResult.insertedIds);
  console.log(`✅ Livestock: ${livestockIds.length} created`);

  // Set dam_id for nursery animals
  const a002Id = livestockIds[1]; // Ratu
  const d002Id = livestockIds[7]; // Merino
  const a007Id = livestockIds[14]; // Anak1
  const d004Id = livestockIds[15]; // AnakDomba
  await db.collection('livestocks').updateOne({ ear_tag: 'A-007' }, { $set: { dam_id: a002Id } });
  await db.collection('livestocks').updateOne({ ear_tag: 'D-004' }, { $set: { dam_id: d002Id } });
  console.log('✅ Parent (dam) links set');

  // ──────────────────────────────────────
  // 5. Feed Masters (7 types)
  // ──────────────────────────────────────
  const feedResult = await db.collection('feedmasters').insertMany([
    { farm_id: farmId, feed_name: 'Rumput Gajah', feed_type: 'hijauan', source: 'lapangan', dry_matter_pct: 20, crude_protein_pct: 10, metabolizable_energy: 2200, unit: 'kg', price_per_unit: 1500, is_active: true, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, feed_name: 'Rumput Odot', feed_type: 'hijauan', source: 'lapangan', dry_matter_pct: 22, crude_protein_pct: 12, metabolizable_energy: 2400, unit: 'kg', price_per_unit: 2000, is_active: true, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, feed_name: 'Konsentrat CP 16%', feed_type: 'konsentrat', source: 'beli', dry_matter_pct: 88, crude_protein_pct: 16, metabolizable_energy: 2800, unit: 'kg', price_per_unit: 5500, is_active: true, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, feed_name: 'Konsentrat CP 20%', feed_type: 'konsentrat', source: 'beli', dry_matter_pct: 90, crude_protein_pct: 20, metabolizable_energy: 3000, unit: 'kg', price_per_unit: 7000, is_active: true, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, feed_name: 'Jerami Padi', feed_type: 'hijauan', source: 'beli', dry_matter_pct: 85, crude_protein_pct: 4, metabolizable_energy: 1800, unit: 'ikat', price_per_unit: 3000, is_active: true, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, feed_name: 'Silase Jagung', feed_type: 'silase', source: 'fermentasi_sendiri', dry_matter_pct: 35, crude_protein_pct: 8, metabolizable_energy: 2500, unit: 'kg', price_per_unit: 2500, is_active: true, created_at: new Date(), updated_at: new Date() },
    { farm_id: farmId, feed_name: 'Vitamin Premix', feed_type: 'suplemen', source: 'beli', dry_matter_pct: 95, crude_protein_pct: 0, metabolizable_energy: 0, unit: 'kg', price_per_unit: 45000, is_active: true, created_at: new Date(), updated_at: new Date() },
  ]);
  const feedIds = Object.values(feedResult.insertedIds);
  console.log(`✅ Feed Masters: ${feedIds.length} created`);

  // ──────────────────────────────────────
  // 6. Growth Records (3-5 per active animal)
  // ──────────────────────────────────────
  const growthDocs = [];
  const activeAnimalIndices = [0,1,2,3,4,6,7,8,9,10,12,13,14,15]; // indices of active/sick/quarantine animals
  for (const idx of activeAnimalIndices) {
    const animal = livestockEntries[idx];
    const numRecords = 3 + Math.floor(Math.random() * 3);
    let baseWeight = animal.species === 'sapi' ? 250 : animal.species === 'kerbau' ? 300 : animal.species === 'domba' ? 30 : 25;
    for (let i = numRecords; i >= 1; i--) {
      const weight = baseWeight + randomBetween(0.5, 3) * (numRecords - i);
      const adg = i < numRecords ? randomBetween(100, 300) : undefined;
      growthDocs.push({
        livestock_id: livestockIds[idx],
        record_date: daysAgo(i * 14),
        weight_kg: Math.round(weight * 10) / 10,
        bcs: Math.floor(Math.random() * 3) + 2,
        height_cm: animal.species === 'sapi' ? 120 + i * 2 : 50 + i,
        chest_girth_cm: animal.species === 'sapi' ? 160 + i * 3 : 60 + i * 2,
        adg_calculated: adg ? Math.round(adg) : undefined,
        measured_by: iqbalId,
        notes: i === 1 ? 'Kondisi sehat, nafsu makan baik' : undefined,
        created_at: daysAgo(i * 14),
      });
    }
  }
  await db.collection('growthrecords').insertMany(growthDocs);
  console.log(`✅ Growth Records: ${growthDocs.length} created`);

  // ──────────────────────────────────────
  // 7. Feeding Logs (last 14 days, 2-3x/day)
  // ──────────────────────────────────────
  const feedingDocs = [];
  const rumputId = feedIds[0];
  const konsentratId = feedIds[2];

  for (const idx of activeAnimalIndices) {
    for (let day = 0; day < 14; day++) {
      for (const time of ['morning', 'afternoon', 'evening'] as const) {
        if (time === 'evening' && Math.random() > 0.7) continue;
        const feedId = time === 'afternoon' ? konsentratId : rumputId;
        const given = time === 'afternoon' ? randomBetween(0.3, 1.0) : randomBetween(1.0, 3.0);
        const consumed = given * randomBetween(0.8, 1.0);
        feedingDocs.push({
          livestock_id: livestockIds[idx],
          feed_master_id: feedId,
          feed_date: daysAgo(day),
          feeding_time: time,
          amount_given_kg: Math.round(given * 10) / 10,
          amount_consumed_kg: Math.round(consumed * 10) / 10,
          appetite_response: Math.random() > 0.9 ? 'reduced' : 'normal',
          recorded_by: celvineId,
          created_at: daysAgo(day),
        });
      }
    }
  }
  await db.collection('feedinglogs').insertMany(feedingDocs);
  console.log(`✅ Feeding Logs: ${feedingDocs.length} created`);

  // ──────────────────────────────────────
  // 8. Health Records (3 records)
  // ──────────────────────────────────────
  const healthResult = await db.collection('healthrecords').insertMany([
    {
      livestock_id: livestockIds[3], // A-004 Bimo (sick)
      record_date: daysAgo(3),
      examiner: iqbalId,
      chief_complaint: 'Nafsu makan menurun, lemas',
      symptoms: ['Lemas', 'Nafsu turun', 'Demam'],
      body_temp_celsius: 40.2,
      heart_rate_bpm: 95,
      respiratory_rate: 28,
      rumen_motility: 'reduced',
      examination_findings: 'Suhu tinggi, dehidrasi ringan, tinja agak cair',
      diagnosis: 'Enteritis',
      diagnosis_code: 'ENT-01',
      is_infectious: false,
      disease_category: 'infectious',
      action_taken: 'Pemberian antibiotik dan cairan elektrolit',
      referral_needed: false,
      follow_up_date: daysFromNow(3),
      created_at: daysAgo(3),
    },
    {
      livestock_id: livestockIds[13], // A-006 (quarantine)
      record_date: daysAgo(7),
      examiner: iqbalId,
      chief_complaint: 'Luka di kaki, bengkak',
      symptoms: ['Luka', 'Pincang', 'Kaki bengkak'],
      body_temp_celsius: 39.8,
      heart_rate_bpm: 80,
      respiratory_rate: 22,
      rumen_motility: 'normal',
      examination_findings: 'Luka terbuka di kaki kanan belakang, bengkak, ada nanah',
      diagnosis: 'Footrot (Kuku Busuk)',
      diagnosis_code: 'FTR-01',
      is_infectious: true,
      disease_category: 'infectious',
      action_taken: 'Bersihkan luka, antibiotik, isolasi ke karantina',
      referral_needed: false,
      follow_up_date: daysFromNow(7),
      created_at: daysAgo(7),
    },
    {
      livestock_id: livestockIds[0], // A-001 Jago (routine)
      record_date: daysAgo(14),
      examiner: celvineId,
      chief_complaint: 'Pemeriksaan rutin',
      symptoms: [],
      body_temp_celsius: 39.0,
      heart_rate_bpm: 72,
      respiratory_rate: 18,
      rumen_motility: 'normal',
      examination_findings: 'Kondisi fisik baik, bulu bersih',
      is_infectious: false,
      disease_category: 'other',
      action_taken: 'Tidak ada tindakan, kondisi sehat',
      referral_needed: false,
      created_at: daysAgo(14),
    },
  ]);
  const healthIds = Object.values(healthResult.insertedIds);
  console.log(`✅ Health Records: ${healthIds.length} created`);

  // ──────────────────────────────────────
  // 9. Medication Logs (3 records)
  // ──────────────────────────────────────
  await db.collection('medicationlogs').insertMany([
    {
      health_record_id: healthIds[0],
      livestock_id: livestockIds[3], // A-004
      medication_type: 'treatment',
      medicine_name: 'Sulfadiazin',
      active_ingredient: 'Sulfadiazine',
      dosage: 5,
      dosage_unit: 'ml',
      route: 'injeksi_IM',
      frequency: '2x sehari',
      duration_days: 5,
      start_date: daysAgo(3),
      end_date: daysFromNow(2),
      withdrawal_period_days: 10,
      withdrawal_end_date: daysFromNow(12),
      response: 'improving',
      administered_by: iqbalId,
      batch_number: 'B-2024-SD-01',
      notes: 'Respons baik setelah hari ke-2',
      created_at: daysAgo(3),
    },
    {
      health_record_id: healthIds[1],
      livestock_id: livestockIds[13], // A-006
      medication_type: 'treatment',
      medicine_name: 'Oxytetracycline LA',
      active_ingredient: 'Oxytetracycline',
      dosage: 10,
      dosage_unit: 'ml',
      route: 'injeksi_IM',
      frequency: '1x sehari',
      duration_days: 3,
      start_date: daysAgo(7),
      end_date: daysAgo(4),
      withdrawal_period_days: 14,
      withdrawal_end_date: daysFromNow(7),
      response: 'no_change',
      administered_by: iqbalId,
      batch_number: 'B-2024-OXY-05',
      created_at: daysAgo(7),
    },
    {
      health_record_id: healthIds[0],
      livestock_id: livestockIds[3], // A-004
      medication_type: 'vitamin',
      medicine_name: 'Vitamin B Complex',
      active_ingredient: 'Thiamine, Riboflavin',
      dosage: 3,
      dosage_unit: 'ml',
      route: 'injeksi_SC',
      frequency: '1x sehari',
      duration_days: 3,
      start_date: daysAgo(3),
      end_date: daysAgo(0),
      response: 'improving',
      administered_by: celvineId,
      created_at: daysAgo(3),
    },
  ]);
  console.log('✅ Medication Logs: 3 created');

  // ──────────────────────────────────────
  // 10. Vaccination Records (10 + 3 upcoming booster)
  // ──────────────────────────────────────
  const vaccDocs = [];
  for (let i = 0; i < 10; i++) {
    vaccDocs.push({
      livestock_id: livestockIds[i],
      vaccine_name: livestockEntries[i].species === 'sapi' ? 'Anthravax' : 'Aftopor',
      disease_target: livestockEntries[i].species === 'sapi' ? 'Anthraks' : 'PMK',
      dosage: livestockEntries[i].species === 'sapi' ? 5 : 2,
      dosage_unit: 'ml',
      route: 'IM',
      vaccination_date: daysAgo(60),
      booster_due_date: daysFromNow(30),
      batch_number: `VAX-2024-01`,
      manufacturer: 'Pusvetma',
      administered_by: iqbalId,
      created_at: daysAgo(60),
    });
  }
  // Upcoming boosters (due in 5 days — triggers alert)
  for (let i = 0; i < 3; i++) {
    vaccDocs.push({
      livestock_id: livestockIds[i],
      vaccine_name: 'Septigen',
      disease_target: 'Septicaemia Epizootica (SE)',
      dosage: 2,
      dosage_unit: 'ml',
      route: 'SC',
      vaccination_date: daysAgo(85),
      booster_due_date: daysFromNow(5),
      batch_number: 'VAX-SE-2024-02',
      manufacturer: 'Medion',
      administered_by: celvineId,
      created_at: daysAgo(85),
    });
  }
  await db.collection('vaccinationrecords').insertMany(vaccDocs);
  console.log(`✅ Vaccination Records: ${vaccDocs.length} created`);

  // ──────────────────────────────────────
  // 11. Quarantine Record
  // ──────────────────────────────────────
  await db.collection('quarantinerecords').insertOne({
    livestock_id: livestockIds[13], // A-006
    health_record_id: healthIds[1],
    quarantine_pen_id: kar01,
    start_date: daysAgo(7),
    expected_duration_days: 14,
    reason: 'Luka kaki terbuka, dicurigai footrot menular',
    disease_suspected: 'Footrot (Kuku Busuk)',
    clearance_test_done: false,
    clearance_test_result: 'pending',
    status: 'active',
    notes: 'Isolasi dari kandang utama, monitoring harian',
    created_at: daysAgo(7),
    updated_at: daysAgo(7),
  });
  console.log('✅ Quarantine Records: 1 created');

  // ──────────────────────────────────────
  // 12. Reproduction Records (5 records)
  // ──────────────────────────────────────
  await db.collection('reproductionrecords').insertMany([
    {
      livestock_id: livestockIds[1], // Ratu (female)
      event_type: 'estrus',
      event_date: daysAgo(30),
      estrus_signs: ['bengkak vulva', 'lendir bening', 'gelisah'],
      notes: 'Tanda birahi jelas',
      recorded_by: celvineId,
      created_at: daysAgo(30),
    },
    {
      livestock_id: livestockIds[1], // Ratu
      event_type: 'mating',
      event_date: daysAgo(28),
      mating_type: 'natural',
      sire_id: livestockIds[0], // Jago
      recorded_by: iqbalId,
      created_at: daysAgo(28),
    },
    {
      livestock_id: livestockIds[1], // Ratu
      event_type: 'pregnancy_check',
      event_date: daysAgo(10),
      pregnancy_status: 'positive',
      gestation_days_expected: 150,
      expected_birth_date: daysFromNow(120),
      recorded_by: iqbalId,
      created_at: daysAgo(10),
    },
    {
      livestock_id: livestockIds[7], // Merino
      event_type: 'birth',
      event_date: daysAgo(45),
      offspring_count: 1,
      birth_type: 'normal',
      kidding_ease_score: 1,
      offspring_ids: [d004Id],
      notes: 'Kelahiran normal, anak sehat',
      recorded_by: iqbalId,
      created_at: daysAgo(45),
    },
    {
      livestock_id: livestockIds[7], // Merino
      event_type: 'weaning',
      event_date: daysAgo(5),
      notes: 'Anak sudah bisa makan sendiri',
      recorded_by: celvineId,
      created_at: daysAgo(5),
    },
  ]);
  console.log('✅ Reproduction Records: 5 created');

  // ──────────────────────────────────────
  // 13. Status History (3 records)
  // ──────────────────────────────────────
  await db.collection('statushistories').insertMany([
    {
      livestock_id: livestockIds[11], // S-003 (sold)
      status_from: 'active',
      status_to: 'sold',
      changed_date: daysAgo(15),
      reason: 'Dijual ke Rumah Potong Hewan Cianjur',
      sale_price: 22000000,
      sale_buyer: 'RPH Cianjur',
      changed_by: edenId,
      notes: 'Berat jual 380kg',
      created_at: daysAgo(15),
    },
    {
      livestock_id: livestockIds[5], // A-008 (dead)
      status_from: 'sick',
      status_to: 'dead',
      changed_date: daysAgo(20),
      reason: 'Bloat (kembung) akut',
      changed_by: iqbalId,
      notes: 'Tidak tertolong meski sudah diobati',
      created_at: daysAgo(20),
    },
    {
      livestock_id: livestockIds[13], // A-006 (quarantine)
      status_from: 'sick',
      status_to: 'quarantine',
      changed_date: daysAgo(7),
      reason: 'Dicurigai footrot menular',
      changed_by: iqbalId,
      created_at: daysAgo(7),
    },
  ]);
  console.log('✅ Status History: 3 created');

  // ──────────────────────────────────────
  // Summary
  // ──────────────────────────────────────
  console.log('\n════════════════════════════════════════════');
  console.log('🌱 SEED COMPLETED');
  console.log('════════════════════════════════════════════');
  console.log('  Farm:               1');
  console.log('  Users:              4');
  console.log('  Pens:               6');
  console.log('  Livestock:          16');
  console.log('  Feed Masters:       7');
  console.log(`  Growth Records:     ${growthDocs.length}`);
  console.log(`  Feeding Logs:       ${feedingDocs.length}`);
  console.log('  Health Records:     3');
  console.log('  Medication Logs:    3');
  console.log(`  Vaccinations:       ${vaccDocs.length}`);
  console.log('  Quarantine:         1');
  console.log('  Reproduction:       5');
  console.log('  Status History:     3');
  console.log('════════════════════════════════════════════');
  console.log('  Login: eden@bodogol.farm / password123');
  console.log('  Login: iqbal@bodogol.farm / password123');
  console.log('  Login: celvine@bodogol.farm / password123');
  console.log('════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

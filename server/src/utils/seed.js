const bcrypt = require('bcryptjs');
const { getDb, queryRow, run } = require('../config/db');

async function seedData() {
  await getDb();

  // Check if data already exists
  const existingUsers = queryRow('SELECT COUNT(*) AS count FROM users');
  if (existingUsers && existingUsers.count > 0) {
    console.log('Database already populated with initial data.');
    return;
  }

  console.log('Seeding demo users, equipment, and requests...');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('farmer123', salt);

  // 1. Create Users
  const user1 = run(`
    INSERT INTO users (name, email, phone, password_hash, village, taluka, district, state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, ['Suresh Patil', 'suresh@farmshare.in', '+91 98220 11234', passwordHash, 'Karanje', 'Baramati', 'Pune', 'Maharashtra']);

  const user2 = run(`
    INSERT INTO users (name, email, phone, password_hash, village, taluka, district, state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, ['Ramesh Shinde', 'ramesh@farmshare.in', '+91 98220 55678', passwordHash, 'Malegaon', 'Baramati', 'Pune', 'Maharashtra']);

  const user3 = run(`
    INSERT INTO users (name, email, phone, password_hash, village, taluka, district, state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, ['Anita Deshmukh', 'anita@farmshare.in', '+91 98220 77890', passwordHash, 'Shirur', 'Shirur', 'Pune', 'Maharashtra']);

  const user4 = run(`
    INSERT INTO users (name, email, phone, password_hash, village, taluka, district, state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, ['Balasaheb Jadhav', 'bala@farmshare.in', '+91 98220 99012', passwordHash, 'Indapur', 'Indapur', 'Pune', 'Maharashtra']);

  const uSuresh = user1.lastInsertRowid;
  const uRamesh = user2.lastInsertRowid;
  const uAnita = user3.lastInsertRowid;
  const uBala = user4.lastInsertRowid;

  // 2. Create Equipment
  const now = new Date();
  const dateFrom = new Date(now);
  dateFrom.setDate(now.getDate() - 2);
  const dateUntil = new Date(now);
  dateUntil.setDate(now.getDate() + 90);

  const dfStr = dateFrom.toISOString().split('T')[0];
  const duStr = dateUntil.toISOString().split('T')[0];

  const eq1 = run(`
    INSERT INTO equipment (
      owner_id, name, category, description, village, taluka, district, state,
      price_per_day, price_per_hour, available_from, available_until, condition, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
  `, [
    uSuresh,
    'Mahindra 575 DI 45HP Tractor',
    'Tractor',
    'Fuel-efficient 45HP Mahindra tractor with dual clutch, power steering, and heavy-duty hitch. Ideal for plowing, rotavator attachment, and sugarcane trolley transport.',
    'Karanje',
    'Baramati',
    'Pune',
    'Maharashtra',
    1400,
    220,
    dfStr,
    duStr,
    'Good',
    'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=1000&q=80'
  ]);

  const eq2 = run(`
    INSERT INTO equipment (
      owner_id, name, category, description, village, taluka, district, state,
      price_per_day, price_per_hour, available_from, available_until, condition, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
  `, [
    uSuresh,
    'Shaktiman 6-Feet Heavy Duty Rotavator',
    'Rotavator',
    '48 curved boron steel L-blades. Produces superior soil pulverization and uniform tilth in a single run. Compatible with all 40HP+ tractors.',
    'Karanje',
    'Baramati',
    'Pune',
    'Maharashtra',
    800,
    130,
    dfStr,
    duStr,
    'Excellent',
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80'
  ]);

  const eq3 = run(`
    INSERT INTO equipment (
      owner_id, name, category, description, village, taluka, district, state,
      price_per_day, price_per_hour, available_from, available_until, condition, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
  `, [
    uBala,
    'John Deere W70 Multi-Crop Combine Harvester',
    'Harvester',
    'High throughput harvester with self-cleaning sieve system. Suitable for wheat, soybean, rice, and pulses with negligible grain loss. Skilled operator available.',
    'Indapur',
    'Indapur',
    'Pune',
    'Maharashtra',
    4500,
    750,
    dfStr,
    duStr,
    'Excellent',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80'
  ]);

  const eq4 = run(`
    INSERT INTO equipment (
      owner_id, name, category, description, village, taluka, district, state,
      price_per_day, price_per_hour, available_from, available_until, condition, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
  `, [
    uRamesh,
    'Kirloskar 5HP Diesel Portable Water Pump',
    'Water Pump',
    'Self-priming 5HP portable diesel engine pump set. Comes with 60m delivery pipe and 15m suction pipe. Very economical on fuel for field inundation.',
    'Malegaon',
    'Baramati',
    'Pune',
    'Maharashtra',
    350,
    60,
    dfStr,
    duStr,
    'Good',
    'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1000&q=80'
  ]);

  const eq5 = run(`
    INSERT INTO equipment (
      owner_id, name, category, description, village, taluka, district, state,
      price_per_day, price_per_hour, available_from, available_until, condition, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
  `, [
    uAnita,
    'Aspee HTP Tractor-Mounted Power Sprayer',
    'Sprayer',
    'Heavy-duty triple plunger sprayer with 250-liter chemical tank and dual spray nozzles. Perfect for sugarcane, cotton, onion, and pomegranate orchards.',
    'Shirur',
    'Shirur',
    'Pune',
    'Maharashtra',
    500,
    90,
    dfStr,
    duStr,
    'Good',
    'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=1000&q=80'
  ]);

  const eq6 = run(`
    INSERT INTO equipment (
      owner_id, name, category, description, village, taluka, district, state,
      price_per_day, price_per_hour, available_from, available_until, condition, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
  `, [
    uSuresh,
    'National 9-Tyne Seed Cum Fertilizer Drill',
    'Seed Drill',
    'Accurate seed spacing and fertilizer placement at adjustable root depth. Maximizes germination rate for wheat, chickpea, soybean, and sorghum.',
    'Karanje',
    'Baramati',
    'Pune',
    'Maharashtra',
    650,
    110,
    dfStr,
    duStr,
    'Excellent',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1000&q=80'
  ]);

  const eq7 = run(`
    INSERT INTO equipment (
      owner_id, name, category, description, village, taluka, district, state,
      price_per_day, price_per_hour, available_from, available_until, condition, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
  `, [
    uAnita,
    'Swaraj 744 FE 48HP Tractor',
    'Tractor',
    'Clean, high torque 48HP Swaraj tractor. Features multi-speed forward and reverse PTO with high breakout force hydraulic lift.',
    'Shirur',
    'Shirur',
    'Pune',
    'Maharashtra',
    1500,
    240,
    dfStr,
    duStr,
    'Excellent',
    'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=1000&q=80'
  ]);

  // 3. Create Demo Requests
  // Request 1: Accepted booking for rotavator
  const bStart1 = new Date(now);
  bStart1.setDate(now.getDate() + 3);
  const bEnd1 = new Date(now);
  bEnd1.setDate(now.getDate() + 5);

  run(`
    INSERT INTO requests (
      equipment_id, requester_id, owner_id,
      requested_from, requested_until, duration_days,
      total_price, message, contact_number, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Accepted')
  `, [
    eq2.lastInsertRowid,
    uRamesh,
    uSuresh,
    bStart1.toISOString().split('T')[0],
    bEnd1.toISOString().split('T')[0],
    3,
    2400,
    'Need the Shaktiman rotavator for preparing sugarcane ratoon soil in Malegaon.',
    '+91 98220 55678'
  ]);

  // Request 2: Pending request for Mahindra tractor
  const bStart2 = new Date(now);
  bStart2.setDate(now.getDate() + 7);
  const bEnd2 = new Date(now);
  bEnd2.setDate(now.getDate() + 9);

  run(`
    INSERT INTO requests (
      equipment_id, requester_id, owner_id,
      requested_from, requested_until, duration_days,
      total_price, message, contact_number, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
  `, [
    eq1.lastInsertRowid,
    uRamesh,
    uSuresh,
    bStart2.toISOString().split('T')[0],
    bEnd2.toISOString().split('T')[0],
    3,
    4200,
    'Need the tractor with trolley hitch for onion haulage to APMC market.',
    '+91 98220 55678'
  ]);

  console.log('Demo data seeded successfully!');
}

module.exports = { seedData };

if (require.main === module) {
  seedData().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

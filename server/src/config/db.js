const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../', process.env.DATABASE_FILE || 'farmshare.sqlite');

let db = null;
let SQL = null;

function saveDb() {
  if (db && dbPath) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

async function getDb() {
  if (db) return db;

  SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign key constraints
  db.run('PRAGMA foreign_keys = ON;');

  initSchema();
  saveDb();

  return db;
}

function initSchema() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      village TEXT NOT NULL,
      taluka TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      village TEXT NOT NULL,
      taluka TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      price_per_day REAL NOT NULL,
      price_per_hour REAL DEFAULT NULL,
      available_from DATE NOT NULL,
      available_until DATE NOT NULL,
      condition TEXT NOT NULL,
      image_url TEXT NOT NULL,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
      requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      requested_from DATE NOT NULL,
      requested_until DATE NOT NULL,
      duration_days INTEGER NOT NULL,
      total_price REAL NOT NULL,
      message TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
    CREATE INDEX IF NOT EXISTS idx_equipment_village ON equipment(village);
    CREATE INDEX IF NOT EXISTS idx_equipment_district ON equipment(district);
    CREATE INDEX IF NOT EXISTS idx_requests_equipment ON requests(equipment_id);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
  `;
  db.run(schema);
}

function query(sqlText, params = []) {
  if (!db) throw new Error('Database not initialized. Call getDb() first.');
  const stmt = db.prepare(sqlText);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryRow(sqlText, params = []) {
  const rows = query(sqlText, params);
  return rows.length > 0 ? rows[0] : null;
}

function run(sqlText, params = []) {
  if (!db) throw new Error('Database not initialized. Call getDb() first.');
  db.run(sqlText, params);
  const lastIdRes = db.exec('SELECT last_insert_rowid() AS id;');
  const changesRes = db.exec('SELECT changes() AS changes;');
  saveDb();
  
  const lastInsertRowid = lastIdRes && lastIdRes[0] && lastIdRes[0].values[0][0];
  const changes = changesRes && changesRes[0] && changesRes[0].values[0][0];
  return { lastInsertRowid, changes };
}

module.exports = {
  getDb,
  query,
  queryRow,
  run,
  saveDb
};

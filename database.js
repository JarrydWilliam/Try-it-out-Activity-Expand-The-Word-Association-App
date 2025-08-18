// database.js - MySQL access helpers for Word Association (Module 4)
const mysql = require('mysql2/promise');
const connectionInfo = require('./lib/dbconfig');

const pool = mysql.createPool({
  host: connectionInfo.host || '127.0.0.1',
  port: connectionInfo.port || 3306,
  user: connectionInfo.user || 'root',
  password: connectionInfo.password || '',
  database: connectionInfo.database || 'wordassociation',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});

async function init() {
  // Assumes database already exists (we create tables if missing)
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NULL,
        email VARCHAR(100) NULL,
        gender VARCHAR(20) NULL,
        education VARCHAR(50) NULL,
        salt VARCHAR(128) NOT NULL,
        password_hash CHAR(64) NOT NULL,
        role ENUM('user','admin') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS timings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        timing_ms INT NOT NULL,
        type ENUM('font','text') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    // Seed admin (username: admin, password: admin123; salt: adminsalt)
    await conn.query(
      `INSERT IGNORE INTO users (username, name, email, gender, education, salt, password_hash, role)
       VALUES ('admin','Administrator','admin@example.com','N/A','All','adminsalt',
               '78f7929bd867e0e01568682c1a2ab22cf51ce07f252d3a44c7789e351296ae3e','admin')`
    );
  } finally {
    conn.release();
  }
}

// Lookups
async function getUserByUsername(username) {
  const [rows] = await pool.query(`SELECT * FROM users WHERE username = :username`, { username });
  return rows[0] || null;
}

async function getSalt(username) {
  const user = await getUserByUsername(username);
  return user ? user.salt : null;
}

// Stored Procedure helpers
// register_user(username, name, email, gender, education, salt, password_hash)
async function registerUserSP({ username, name, email, gender, education, salt, password_hash }) {
  const [results] = await pool.query(
    `CALL register_user(:username,:name,:email,:gender,:education,:salt,:password_hash)`,
    { username, name, email, gender, education, salt, password_hash }
  );
  return results;
}

// get_median_times(education, type) -> { median }
async function getMedianSP(education, type) {
  const [results] = await pool.query(
    `CALL get_median_times(:education,:type)`,
    { education, type }
  );
  const rows = Array.isArray(results) ? results[0] : results;
  return rows && rows[0] ? rows[0].median : null;
}

// get_top_ten_times(education, type) -> rows { username, timing_ms }
async function getTopTenSP(education, type) {
  const [results] = await pool.query(
    `CALL get_top_ten_times(:education,:type)`,
    { education, type }
  );
  const rows = Array.isArray(results) ? results[0] : results;
  return rows || [];
}

// Legacy helpers (non-admin result page)
async function addTiming({ username, timing_ms, type }) {
  const user = await getUserByUsername(username);
  if (!user) throw new Error('User not found for addTiming');
  const [result] = await pool.query(
    `INSERT INTO timings (user_id, timing_ms, type) VALUES (:uid, :timing_ms, :type)`,
    { uid: user.id, timing_ms, type }
  );
  return result.insertId;
}

async function getTopTen(type) {
  const [rows] = await pool.query(
    `SELECT u.username, t.timing_ms
     FROM timings t
     JOIN users u ON u.id = t.user_id
     WHERE t.type = :type
     ORDER BY t.timing_ms ASC
     LIMIT 10`,
    { type }
  );
  return rows;
}

async function getAllTimings(type) {
  const [rows] = await pool.query(
    `SELECT timing_ms FROM timings WHERE type = :type ORDER BY timing_ms ASC`,
    { type }
  );
  return rows.map(r => r.timing_ms);
}

function computeMedian(sortedNums) {
  if (!sortedNums.length) return null;
  const n = sortedNums.length;
  const mid = Math.floor(n / 2);
  if (n % 2 === 1) return sortedNums[mid];
  return Math.round((sortedNums[mid - 1] + sortedNums[mid]) / 2);
}

async function getMedian(type) {
  const arr = await getAllTimings(type);
  return computeMedian(arr);
}

module.exports = {
  pool,
  init,
  getUserByUsername,
  getSalt,
  registerUserSP,
  getMedianSP,
  getTopTenSP,
  addTiming,
  getTopTen,
  getMedian
};

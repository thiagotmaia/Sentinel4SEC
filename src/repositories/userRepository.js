const db = require("../models/schema");

function create(username, passwordHash, role) {
  const stmt = db.prepare(
    `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`
  );
  return stmt.run(username, passwordHash, role);
}

function findByUsername(username) {
  return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
}

module.exports = { create, findByUsername };

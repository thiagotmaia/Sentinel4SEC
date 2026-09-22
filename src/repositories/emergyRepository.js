const db = require("../models/schema");

function create(userId, description, valueEncrypted, unit) {
  const stmt = db.prepare(
    `INSERT INTO emergy_data (user_id, description, value_encrypted, unit) VALUES (?, ?, ?, ?)`
  );
  return stmt.run(userId, description, valueEncrypted, unit);
}

function findAllByUser(userId) {
  return db
    .prepare(`SELECT id, description, value_encrypted, unit, created_at FROM emergy_data WHERE user_id = ?`)
    .all(userId);
}

function findById(id) {
  return db.prepare(`SELECT id, user_id, description FROM emergy_data WHERE id = ?`).get(id);
}

function deleteById(id) {
  return db.prepare(`DELETE FROM emergy_data WHERE id = ?`).run(id);
}

module.exports = { create, findAllByUser, findById, deleteById };

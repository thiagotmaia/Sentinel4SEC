const db = require("../models/schema");

function logAccess(usernameAttempted, ip, action, details) {
  db.prepare(
    `INSERT INTO access_logs (username_attempted, ip, action, details) VALUES (?, ?, ?, ?)`
  ).run(usernameAttempted, ip, action, details);
}

function findRecent(limit = 20) {
  return db
    .prepare(`SELECT * FROM access_logs ORDER BY id DESC LIMIT ?`)
    .all(limit);
}

module.exports = { logAccess, findRecent };

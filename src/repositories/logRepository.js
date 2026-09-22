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

function countRecentFailedLogins(username, windowMinutes) {
  const row = db
    .prepare(
      `SELECT COUNT(*) as count FROM access_logs
       WHERE username_attempted = ? AND action = 'login_failed'
       AND created_at >= datetime('now', ?)`
    )
    .get(username, `-${windowMinutes} minutes`);
  return row.count;
}

module.exports = { logAccess, findRecent, countRecentFailedLogins };

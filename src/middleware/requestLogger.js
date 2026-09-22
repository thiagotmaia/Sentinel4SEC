const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "..", "..", "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, "access.log");

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const user = req.user ? req.user.username : "anonimo";
    const line = `[${new Date().toISOString()}] ${req.ip} "${req.method} ${req.originalUrl}" user=${user} status=${res.statusCode} ${durationMs}ms\n`;
    fs.appendFile(logFile, line, () => {});
  });

  next();
}

module.exports = requestLogger;

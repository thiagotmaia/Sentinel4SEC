const logRepository = require("../repositories/logRepository");

function listLogs(req, res) {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const logs = logRepository.findRecent(limit);
  res.json(logs);
}

module.exports = { listLogs };

const authService = require("../services/authService");

function register(req, res) {
  const { username, password, role } = req.body || {};

  try {
    const result = authService.register(username, password, role, req.ip);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

function login(req, res) {
  const { username, password } = req.body || {};

  try {
    const result = authService.login(username, password, req.ip);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { register, login };

const authService = require("../services/authService");
const { respondError } = require("../utils/errors");

function register(req, res) {
  const { username, password } = req.body || {};

  try {
    const result = authService.register(username, password, req.ip);
    res.status(201).json(result);
  } catch (err) {
    respondError(res, err);
  }
}

function login(req, res) {
  const { username, password } = req.body || {};

  try {
    const result = authService.login(username, password, req.ip);
    res.json(result);
  } catch (err) {
    respondError(res, err);
  }
}

module.exports = { register, login };

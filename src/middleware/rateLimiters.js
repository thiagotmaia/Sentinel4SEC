const rateLimit = require("express-rate-limit");
const logRepository = require("../repositories/logRepository");

const LOGIN_MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS || 5);
const LOGIN_WINDOW_MINUTES = Number(process.env.LOGIN_WINDOW_MINUTES || 10);

const loginLimiter = rateLimit({
  windowMs: LOGIN_WINDOW_MINUTES * 60 * 1000,
  max: LOGIN_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas de login. Tente novamente mais tarde." },
  handler: (req, res, next, options) => {
    logRepository.logAccess(
      req.body?.username || null,
      req.ip,
      "rate_limited",
      "Bloqueado por excesso de tentativas de login"
    );
    res.status(429).json(options.message);
  },
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisicoes em pouco tempo. Tente novamente em instantes." },
  handler: (req, res, next, options) => {
    logRepository.logAccess(null, req.ip, "rate_limited", "Bloqueado por excesso de requisicoes gerais");
    res.status(429).json(options.message);
  },
});

module.exports = { loginLimiter, generalLimiter };

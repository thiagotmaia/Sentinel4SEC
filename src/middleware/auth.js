const jwt = require("jsonwebtoken");
const logRepository = require("../repositories/logRepository");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logRepository.logAccess(null, req.ip, "access_denied", "Requisicao sem token");
    return res.status(401).json({ error: "Token de autenticacao ausente." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logRepository.logAccess(null, req.ip, "access_denied", "Token invalido ou expirado");
      return res.status(403).json({ error: "Token invalido ou expirado." });
    }
    req.user = user;
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      logRepository.logAccess(
        req.user ? req.user.username : null,
        req.ip,
        "access_denied",
        `Tentativa de acesso a recurso restrito a '${role}'`
      );
      return res.status(403).json({ error: "Voce nao tem permissao para acessar este recurso." });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const logRepository = require("../repositories/logRepository");

const SALT_ROUNDS = 12;
const LOGIN_MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS || 5);
const LOGIN_WINDOW_MINUTES = Number(process.env.LOGIN_WINDOW_MINUTES || 10);

function isValidCredentials(username, password) {
  return (
    typeof username === "string" &&
    typeof password === "string" &&
    username.trim().length >= 3 &&
    password.length >= 8
  );
}

function register(username, password, ip) {
  if (!isValidCredentials(username, password)) {
    logRepository.logAccess(username, ip, "user_register_failed", "Dados invalidos");
    const error = new Error("Dados invalidos. Usuario >= 3 caracteres e senha >= 8 caracteres.");
    error.status = 400;
    throw error;
  }

  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);

  try {
    const info = userRepository.create(username.trim(), passwordHash, "user");
    logRepository.logAccess(username, ip, "user_registered", "role=user");
    return { id: info.lastInsertRowid, username, role: "user" };
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      logRepository.logAccess(username, ip, "user_register_failed", "Usuario ja existe");
      const error = new Error("Usuario ja existe.");
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

function login(username, password, ip) {
  if (!isValidCredentials(username, password)) {
    const error = new Error("Usuario ou senha invalidos.");
    error.status = 400;
    throw error;
  }

  const trimmedUsername = username.trim();
  const recentFailures = logRepository.countRecentFailedLogins(trimmedUsername, LOGIN_WINDOW_MINUTES);

  if (recentFailures >= LOGIN_MAX_ATTEMPTS) {
    logRepository.logAccess(
      trimmedUsername,
      ip,
      "account_locked",
      "Bloqueado por excesso de tentativas para este usuario"
    );
    const error = new Error("Conta temporariamente bloqueada por excesso de tentativas. Tente novamente mais tarde.");
    error.status = 429;
    throw error;
  }

  const user = userRepository.findByUsername(trimmedUsername);
  const passwordMatches = user && bcrypt.compareSync(password, user.password_hash);

  if (!passwordMatches) {
    logRepository.logAccess(trimmedUsername, ip, "login_failed", "Usuario ou senha incorretos");
    const error = new Error("Usuario ou senha invalidos.");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "2h" });

  logRepository.logAccess(trimmedUsername, ip, "login_success", `role=${user.role}`);
  return { token, role: user.role, expiresIn: "2h" };
}

module.exports = { register, login };

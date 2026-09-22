const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const logRepository = require("../repositories/logRepository");

const SALT_ROUNDS = 12;

function isValidCredentials(username, password) {
  return (
    typeof username === "string" &&
    typeof password === "string" &&
    username.trim().length >= 3 &&
    password.length >= 8
  );
}

function register(username, password, role, ip) {
  if (!isValidCredentials(username, password)) {
    const error = new Error("Dados invalidos. Usuario >= 3 caracteres e senha >= 8 caracteres.");
    error.status = 400;
    throw error;
  }

  const finalRole = role === "admin" ? "admin" : "user";
  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);

  try {
    const info = userRepository.create(username.trim(), passwordHash, finalRole);
    logRepository.logAccess(username, ip, "user_registered", `role=${finalRole}`);
    return { id: info.lastInsertRowid, username, role: finalRole };
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
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

  const user = userRepository.findByUsername(username.trim());
  const passwordMatches = user && bcrypt.compareSync(password, user.password_hash);

  if (!passwordMatches) {
    logRepository.logAccess(username, ip, "login_failed", "Usuario ou senha incorretos");
    const error = new Error("Usuario ou senha invalidos.");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  logRepository.logAccess(username, ip, "login_success", `role=${user.role}`);
  return { token, role: user.role, expiresIn: "2h" };
}

module.exports = { register, login };

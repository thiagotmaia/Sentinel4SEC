require("dotenv").config();
const bcrypt = require("bcryptjs");
require("../src/models/schema");
const userRepository = require("../src/repositories/userRepository");

const SALT_ROUNDS = 12;
const [username, password] = process.argv.slice(2);

if (!username || !password || password.length < 8) {
  console.error("Uso: node scripts/create-admin.js <usuario> <senha (min 8 caracteres)>");
  process.exit(1);
}

try {
  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
  userRepository.create(username.trim(), passwordHash, "admin");
  console.log(`Administrador '${username}' criado com sucesso.`);
} catch (err) {
  if (String(err.message).includes("UNIQUE")) {
    console.error("Usuario ja existe.");
  } else {
    console.error(err.message);
  }
  process.exitCode = 1;
}

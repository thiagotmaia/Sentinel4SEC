const emergyRepository = require("../repositories/emergyRepository");
const logRepository = require("../repositories/logRepository");
const cryptoService = require("./cryptoService");

function list(userId) {
  const rows = emergyRepository.findAllByUser(userId);
  return rows.map((row) => ({
    id: row.id,
    description: row.description,
    value: Number(cryptoService.decrypt(row.value_encrypted)),
    unit: row.unit,
    created_at: row.created_at,
  }));
}

function create(userId, description, value, unit, username, ip) {
  if (typeof description !== "string" || description.trim().length === 0 || typeof value !== "number") {
    const error = new Error("Campos 'description' (texto) e 'value' (numero) sao obrigatorios.");
    error.status = 400;
    throw error;
  }

  const encryptedValue = cryptoService.encrypt(value);
  const finalUnit = unit || "seJ";
  const info = emergyRepository.create(userId, description.trim(), encryptedValue, finalUnit);

  logRepository.logAccess(username, ip, "emergy_data_created", `id=${info.lastInsertRowid}`);
  return { id: info.lastInsertRowid, description, value, unit: finalUnit };
}

function remove(id, username, ip) {
  const record = emergyRepository.findById(id);

  if (!record) {
    const error = new Error("Registro nao encontrado.");
    error.status = 404;
    throw error;
  }

  emergyRepository.deleteById(id);
  logRepository.logAccess(username, ip, "emergy_data_deleted", `id=${id} owner_id=${record.user_id}`);
}

module.exports = { list, create, remove };

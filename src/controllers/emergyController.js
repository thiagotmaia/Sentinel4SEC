const emergyService = require("../services/emergyService");
const { respondError } = require("../utils/errors");

function list(req, res) {
  try {
    const result = emergyService.list(req.user.id);
    res.json(result);
  } catch (err) {
    respondError(res, err);
  }
}

function create(req, res) {
  const { description, value, unit } = req.body || {};

  try {
    const result = emergyService.create(req.user.id, description, value, unit, req.user.username, req.ip);
    res.status(201).json(result);
  } catch (err) {
    respondError(res, err);
  }
}

function remove(req, res) {
  const { id } = req.params;

  try {
    emergyService.remove(id, req.user.username, req.ip);
    res.json({ message: "Registro excluido com sucesso." });
  } catch (err) {
    respondError(res, err);
  }
}

module.exports = { list, create, remove };

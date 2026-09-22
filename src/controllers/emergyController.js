const emergyService = require("../services/emergyService");

function list(req, res) {
  const result = emergyService.list(req.user.id);
  res.json(result);
}

function create(req, res) {
  const { description, value, unit } = req.body || {};

  try {
    const result = emergyService.create(req.user.id, description, value, unit, req.user.username, req.ip);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

function remove(req, res) {
  const { id } = req.params;

  try {
    emergyService.remove(id, req.user.username, req.ip);
    res.json({ message: "Registro excluido com sucesso." });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { list, create, remove };

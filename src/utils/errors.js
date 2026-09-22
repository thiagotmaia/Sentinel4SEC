function respondError(res, err) {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor." });
}

module.exports = { respondError };

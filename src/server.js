require("dotenv").config();
const express = require("express");
const helmet = require("helmet");

const requestLogger = require("./middleware/requestLogger");
const { generalLimiter } = require("./middleware/rateLimiters");
const authRoutes = require("./routes/authRoutes");
const emergyRoutes = require("./routes/emergyRoutes");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(generalLimiter);
app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({ status: "ok", project: "Sentinel4SEC" });
});

app.use("/api/auth", authRoutes);
app.use("/api/emergy", emergyRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

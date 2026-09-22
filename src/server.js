require("dotenv").config();
const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const helmet = require("helmet");

const requestLogger = require("./middleware/requestLogger");
const { generalLimiter } = require("./middleware/rateLimiters");
const authRoutes = require("./routes/authRoutes");
const emergyRoutes = require("./routes/emergyRoutes");
const adminRoutes = require("./routes/adminRoutes");

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
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 3000;
const TLS_KEY_PATH = process.env.TLS_KEY_PATH || path.join(__dirname, "..", "certs", "key.pem");
const TLS_CERT_PATH = process.env.TLS_CERT_PATH || path.join(__dirname, "..", "certs", "cert.pem");

if (fs.existsSync(TLS_KEY_PATH) && fs.existsSync(TLS_CERT_PATH)) {
  const tlsOptions = {
    key: fs.readFileSync(TLS_KEY_PATH),
    cert: fs.readFileSync(TLS_CERT_PATH),
  };
  https.createServer(tlsOptions, app).listen(PORT, () => {
    console.log(`Servidor rodando em https://localhost:${PORT}`);
  });
} else {
  console.warn("Certificado TLS nao encontrado em certs/. Rodando em HTTP (execute scripts/generate-cert.sh para habilitar HTTPS).");
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

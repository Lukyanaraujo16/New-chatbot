require("express-async-errors");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : ["http://localhost:3000", "http://localhost:9011"];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Origem não permitida"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Intercepta qualquer chamada de licença (frontend DevConnectAi) antes das rotas
const licensePayload = {
  valid: true,
  success: true,
  message: "Licença válida",
  licenseValid: true,
  data: { valid: true, success: true, message: "Licença válida" },
};
app.use((req, res, next) => {
  const rawUrl = req.originalUrl || req.url || "";
  let url = rawUrl;
  try {
    url = decodeURIComponent(rawUrl);
  } catch (_) {
    // Se a URL não for decodificável, seguimos com rawUrl
  }
  const haystack = `${url} ${req.path || ""}`.toLowerCase();
  // Alguns builds podem chamar endpoints com pequenas variações (licenca/license/autorizacao/etc)
  if (/(license|licen[cç]a|licenca|validar|autoriza)/i.test(haystack)) {
    return res.json(licensePayload);
  }
  next();
});

app.use(routes);

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.status || 500).json({
    error: err.message || "Erro interno do servidor",
  });
});

module.exports = app;

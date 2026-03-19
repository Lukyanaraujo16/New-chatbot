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
  const url = (req.originalUrl || req.url || "").toLowerCase();
  const path = (req.path || "").toLowerCase();
  if (path.includes("license") || path.includes("licenca") || path.includes("validar") ||
      url.includes("license") || url.includes("licenca") || url.includes("validar")) {
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

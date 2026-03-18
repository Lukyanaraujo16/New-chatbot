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

app.use(routes);

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.status || 500).json({
    error: err.message || "Erro interno do servidor",
  });
});

module.exports = app;

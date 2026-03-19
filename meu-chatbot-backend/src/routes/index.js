const express = require("express");

const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const settingRoutes = require("./settingRoutes");
const contactRoutes = require("./contactRoutes");
const ticketRoutes = require("./ticketRoutes");
const messageRoutes = require("./messageRoutes");
const whatsappRoutes = require("./whatsappRoutes");
const whatsappSessionRoutes = require("./whatsappSessionRoutes");
const queueRoutes = require("./queueRoutes");
const quickMessageRoutes = require("./quickMessageRoutes");

const routes = express.Router();

// Qualquer rota que contenha "license" ou "licenca" retorna válida (frontend DevConnectAi)
const licensePayload = { valid: true, message: "Licença válida", success: true };
routes.use((req, res, next) => {
  const path = (req.path || "").toLowerCase();
  if (path.includes("license") || path.includes("licenca") || path.includes("validar")) {
    return res.json(licensePayload);
  }
  next();
});

routes.get("/", (req, res) => res.json({ status: "OK", message: "Meu Chatbot API" }));
routes.get("/status", (req, res) => res.json({ status: "OK" }));

routes.use(userRoutes);
routes.use("/auth", authRoutes);
routes.use(settingRoutes);
routes.use(contactRoutes);
routes.use(ticketRoutes);
routes.use(whatsappRoutes);
routes.use(whatsappSessionRoutes);
routes.use(queueRoutes);
routes.use(quickMessageRoutes);
routes.use(messageRoutes);

module.exports = routes;

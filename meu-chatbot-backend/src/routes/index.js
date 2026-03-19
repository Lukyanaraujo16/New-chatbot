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

routes.get("/", (req, res) => res.json({ status: "OK", message: "Meu Chatbot API" }));
routes.get("/status", (req, res) => res.json({ status: "OK" }));

// Compatibilidade com frontend DevConnectAi: sempre retorna licença válida (uso próprio)
routes.get("/license", (req, res) => res.json({ valid: true, message: "Licença válida" }));
routes.get("/license/check", (req, res) => res.json({ valid: true }));
routes.post("/license/check", (req, res) => res.json({ valid: true }));
routes.get("/licenca", (req, res) => res.json({ valid: true }));
routes.get("/api/license", (req, res) => res.json({ valid: true }));

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

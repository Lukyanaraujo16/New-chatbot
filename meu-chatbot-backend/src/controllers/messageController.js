const db = require("../models");
const whatsappApi = require("../services/whatsappApi");
const { getIO } = require("../lib/socket");

exports.index = async (req, res) => {
  const messages = await db.Message.findAll({
    where: { ticketId: req.params.ticketId },
    order: [["createdAt", "ASC"]],
  });
  return res.json(messages);
};

exports.store = async (req, res) => {
  const { ticketId } = req.params;
  const { body } = req.body;
  const ticket = await db.Ticket.findByPk(ticketId, {
    include: [
      { model: db.Contact, as: "Contact" },
      { model: db.Whatsapp, as: "Whatsapp" },
    ],
  });
  if (!ticket) return res.status(404).json({ error: "Ticket não encontrado" });
  const whatsapp = ticket.Whatsapp;
  if (!whatsapp || !whatsapp.instanceKey) {
    return res.status(400).json({ error: "Conexão WhatsApp não configurada para este ticket" });
  }
  const number = ticket.Contact.number.replace(/\D/g, "");
  const jid = number.includes("@") ? number : `${number}@s.whatsapp.net`;
  let sent = false;
  try {
    await whatsappApi.sendText(whatsapp.instanceKey, jid, body || "");
    sent = true;
  } catch (err) {
    return res.status(502).json({
      error: "Falha ao enviar pela API WhatsApp",
      detail: err.message,
    });
  }
  const message = await db.Message.create({
    body: body || "",
    ticketId: parseInt(ticketId, 10),
    fromMe: true,
    read: true,
    ack: 1,
  });
  const io = getIO();
  if (io) io.emit("appMessage", { message, ticketId: parseInt(ticketId, 10) });
  return res.status(201).json(message);
};

exports.remove = async (req, res) => {
  const message = await db.Message.findByPk(req.params.messageId);
  if (!message) return res.status(404).json({ error: "Mensagem não encontrada" });
  await message.destroy();
  return res.json({ message: "Mensagem removida" });
};

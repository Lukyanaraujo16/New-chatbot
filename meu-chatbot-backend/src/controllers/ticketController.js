const db = require("../models");

exports.index = async (req, res) => {
  const { status } = req.query;
  const where = { companyId: 1 };
  if (status) where.status = status;
  const tickets = await db.Ticket.findAll({
    where,
    include: [
      { model: db.Contact, as: "Contact" },
      { model: db.Queue, as: "Queue" },
      { model: db.Whatsapp, as: "Whatsapp" },
    ],
    order: [["updatedAt", "DESC"]],
  });
  return res.json(tickets);
};

exports.show = async (req, res) => {
  const ticket = await db.Ticket.findByPk(req.params.ticketId, {
    include: [
      { model: db.Contact, as: "Contact" },
      { model: db.Queue, as: "Queue" },
      { model: db.Whatsapp, as: "Whatsapp" },
      { model: db.User, as: "User" },
    ],
  });
  if (!ticket) return res.status(404).json({ error: "Ticket não encontrado" });
  return res.json(ticket);
};

exports.store = async (req, res) => {
  const { contactId, whatsappId, queueId, userId } = req.body;
  if (!contactId || !whatsappId) {
    return res.status(400).json({ error: "contactId e whatsappId são obrigatórios" });
  }
  const ticket = await db.Ticket.create({
    contactId,
    whatsappId,
    queueId: queueId || null,
    userId: userId || req.userId || null,
    companyId: 1,
    status: "open",
  });
  const withIncludes = await db.Ticket.findByPk(ticket.id, {
    include: [
      { model: db.Contact, as: "Contact" },
      { model: db.Queue, as: "Queue" },
      { model: db.Whatsapp, as: "Whatsapp" },
    ],
  });
  return res.status(201).json(withIncludes);
};

exports.update = async (req, res) => {
  const ticket = await db.Ticket.findByPk(req.params.ticketId);
  if (!ticket) return res.status(404).json({ error: "Ticket não encontrado" });
  const { status, userId, queueId } = req.body;
  if (status != null) ticket.status = status;
  if (userId != null) ticket.userId = userId;
  if (queueId != null) ticket.queueId = queueId;
  await ticket.save();
  return res.json(ticket);
};

exports.remove = async (req, res) => {
  const ticket = await db.Ticket.findByPk(req.params.ticketId);
  if (!ticket) return res.status(404).json({ error: "Ticket não encontrado" });
  await ticket.destroy();
  return res.json({ message: "Ticket removido" });
};

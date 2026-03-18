const db = require("../models");

exports.index = async (req, res) => {
  const list = await db.QuickMessage.findAll({
    where: { companyId: 1 },
    order: [["shortcode", "ASC"]],
  });
  return res.json(list);
};

exports.store = async (req, res) => {
  const { shortcode, message } = req.body;
  if (!shortcode || !message) {
    return res.status(400).json({ error: "shortcode e message são obrigatórios" });
  }
  const quick = await db.QuickMessage.create({
    shortcode,
    message,
    companyId: 1,
  });
  return res.status(201).json(quick);
};

exports.update = async (req, res) => {
  const quick = await db.QuickMessage.findByPk(req.params.id);
  if (!quick) return res.status(404).json({ error: "Resposta rápida não encontrada" });
  const { shortcode, message } = req.body;
  if (shortcode != null) quick.shortcode = shortcode;
  if (message != null) quick.message = message;
  await quick.save();
  return res.json(quick);
};

exports.remove = async (req, res) => {
  const quick = await db.QuickMessage.findByPk(req.params.id);
  if (!quick) return res.status(404).json({ error: "Resposta rápida não encontrada" });
  await quick.destroy();
  return res.json({ message: "Removido" });
};

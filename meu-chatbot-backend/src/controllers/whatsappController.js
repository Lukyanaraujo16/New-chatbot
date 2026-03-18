const db = require("../models");

exports.index = async (req, res) => {
  const whatsapps = await db.Whatsapp.findAll({
    where: { companyId: 1 },
    order: [["name", "ASC"]],
  });
  return res.json(whatsapps);
};

exports.show = async (req, res) => {
  const whatsapp = await db.Whatsapp.findByPk(req.params.whatsappId);
  if (!whatsapp) return res.status(404).json({ error: "Conexão não encontrada" });
  return res.json(whatsapp);
};

exports.store = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nome é obrigatório" });
  const instanceKey = `session_${Date.now()}`;
  const whatsapp = await db.Whatsapp.create({
    name,
    status: "DISCONNECTED",
    companyId: 1,
    instanceKey,
  });
  return res.status(201).json(whatsapp);
};

exports.update = async (req, res) => {
  const whatsapp = await db.Whatsapp.findByPk(req.params.whatsappId);
  if (!whatsapp) return res.status(404).json({ error: "Conexão não encontrada" });
  const { name } = req.body;
  if (name != null) whatsapp.name = name;
  await whatsapp.save();
  return res.json(whatsapp);
};

exports.remove = async (req, res) => {
  const whatsapp = await db.Whatsapp.findByPk(req.params.whatsappId);
  if (!whatsapp) return res.status(404).json({ error: "Conexão não encontrada" });
  await whatsapp.destroy();
  return res.json({ message: "Conexão removida" });
};

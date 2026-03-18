const db = require("../models");

exports.index = async (req, res) => {
  const queues = await db.Queue.findAll({
    where: { companyId: 1 },
    order: [["name", "ASC"]],
  });
  return res.json(queues);
};

exports.show = async (req, res) => {
  const queue = await db.Queue.findByPk(req.params.queueId);
  if (!queue) return res.status(404).json({ error: "Fila não encontrada" });
  return res.json(queue);
};

exports.store = async (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: "Nome é obrigatório" });
  const queue = await db.Queue.create({
    name,
    color: color || "#000000",
    companyId: 1,
  });
  return res.status(201).json(queue);
};

exports.update = async (req, res) => {
  const queue = await db.Queue.findByPk(req.params.queueId);
  if (!queue) return res.status(404).json({ error: "Fila não encontrada" });
  const { name, color } = req.body;
  if (name != null) queue.name = name;
  if (color != null) queue.color = color;
  await queue.save();
  return res.json(queue);
};

exports.remove = async (req, res) => {
  const queue = await db.Queue.findByPk(req.params.queueId);
  if (!queue) return res.status(404).json({ error: "Fila não encontrada" });
  await queue.destroy();
  return res.json({ message: "Fila removida" });
};

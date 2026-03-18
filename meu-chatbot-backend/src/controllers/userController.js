const db = require("../models");

exports.index = async (req, res) => {
  const users = await db.User.findAll({
    attributes: ["id", "name", "email", "profile", "createdAt"],
  });
  return res.json(users);
};

exports.show = async (req, res) => {
  const user = await db.User.findByPk(req.params.userId, {
    attributes: ["id", "name", "email", "profile", "createdAt"],
  });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  return res.json(user);
};

exports.store = async (req, res) => {
  const { name, email, password, profile } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
  }
  const exists = await db.User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ error: "Email já cadastrado" });
  const user = await db.User.create({ name, email, password, profile: profile || "user" });
  return res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
  });
};

exports.update = async (req, res) => {
  const user = await db.User.findByPk(req.params.userId);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  const { name, email, password, profile } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;
  if (profile) user.profile = profile;
  await user.save();
  return res.json({ id: user.id, name: user.name, email: user.email, profile: user.profile });
};

exports.remove = async (req, res) => {
  const user = await db.User.findByPk(req.params.userId);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  await user.destroy();
  return res.json({ message: "Usuário removido" });
};

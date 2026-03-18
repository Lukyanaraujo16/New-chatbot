const db = require("../models");

exports.index = async (req, res) => {
  const contacts = await db.Contact.findAll({ order: [["name", "ASC"]] });
  return res.json(contacts);
};

exports.show = async (req, res) => {
  const contact = await db.Contact.findByPk(req.params.contactId);
  if (!contact) return res.status(404).json({ error: "Contato não encontrado" });
  return res.json(contact);
};

exports.store = async (req, res) => {
  const { name, number, email } = req.body;
  if (!number) return res.status(400).json({ error: "Número é obrigatório" });
  const contact = await db.Contact.create({
    name: name || number,
    number: number.replace(/\D/g, ""),
    email: email || null,
    companyId: 1,
  });
  return res.status(201).json(contact);
};

exports.getContact = async (req, res) => {
  const { number } = req.body;
  if (!number) return res.status(400).json({ error: "Número é obrigatório" });
  const num = number.replace(/\D/g, "");
  let contact = await db.Contact.findOne({ where: { number: num, companyId: 1 } });
  if (!contact) {
    contact = await db.Contact.create({ name: number, number: num, companyId: 1 });
  }
  return res.json(contact);
};

exports.update = async (req, res) => {
  const contact = await db.Contact.findByPk(req.params.contactId);
  if (!contact) return res.status(404).json({ error: "Contato não encontrado" });
  const { name, email, profilePicUrl } = req.body;
  if (name != null) contact.name = name;
  if (email != null) contact.email = email;
  if (profilePicUrl != null) contact.profilePicUrl = profilePicUrl;
  await contact.save();
  return res.json(contact);
};

exports.remove = async (req, res) => {
  const contact = await db.Contact.findByPk(req.params.contactId);
  if (!contact) return res.status(404).json({ error: "Contato não encontrado" });
  await contact.destroy();
  return res.json({ message: "Contato removido" });
};

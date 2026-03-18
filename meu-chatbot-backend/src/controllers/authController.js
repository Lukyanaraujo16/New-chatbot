const jwt = require("jsonwebtoken");
const db = require("../models");

const generateTokens = (user) => {
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" }
  );
  return { token, refreshToken };
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }
  const user = await db.User.findOne({ where: { email } });
  if (!user || !(await user.checkPassword(password))) {
    return res.status(401).json({ error: "Email ou senha inválidos" });
  }
  const { token, refreshToken } = generateTokens(user);
  return res.json({
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
    },
  });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: ref } = req.body;
  const token = req.body.refreshToken || req.headers.refreshtoken;
  const r = ref || token;
  if (!r) return res.status(400).json({ error: "Refresh token não informado" });
  try {
    const decoded = jwt.verify(r, process.env.JWT_REFRESH_SECRET);
    const user = await db.User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });
    const tokens = generateTokens(user);
    return res.json(tokens);
  } catch (err) {
    return res.status(401).json({ error: "Refresh token inválido" });
  }
};

exports.logout = async (req, res) => {
  return res.json({ message: "Logout realizado" });
};

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
  }
  const exists = await db.User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ error: "Email já cadastrado" });
  const user = await db.User.create({ name, email, password });
  const { token, refreshToken } = generateTokens(user);
  return res.status(201).json({
    token,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, profile: user.profile },
  });
};

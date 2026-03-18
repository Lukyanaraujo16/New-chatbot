const db = require("../models");
const whatsappApi = require("../services/whatsappApi");
const { getIO } = require("../lib/socket");

exports.store = async (req, res) => {
  const { whatsappId } = req.params;
  const whatsapp = await db.Whatsapp.findByPk(whatsappId);
  if (!whatsapp) return res.status(404).json({ error: "Conexão não encontrada" });
  const key = whatsapp.instanceKey || `session_${whatsappId}`;
  whatsapp.instanceKey = key;
  await whatsapp.save();
  try {
    await whatsappApi.initInstance(key);
  } catch (err) {
    return res.status(502).json({
      error: "Falha ao iniciar sessão na API WhatsApp",
      detail: err.message,
    });
  }
  let qr = null;
  try {
    const qrData = await whatsappApi.getQrBase64(key);
    qr = qrData?.base64 || qrData?.qr;
  } catch (_) {}
  await whatsapp.update({ status: "qrcode", qrcode: qr || "" });
  const io = getIO();
  if (io) io.emit("whatsappSession", { whatsappId: parseInt(whatsappId, 10), qrcode: qr, status: "qrcode" });
  return res.json({ qrcode: qr, status: "qrcode" });
};

exports.update = async (req, res) => {
  const { whatsappId } = req.params;
  const whatsapp = await db.Whatsapp.findByPk(whatsappId);
  if (!whatsapp) return res.status(404).json({ error: "Conexão não encontrada" });
  const { status, number } = req.body;
  if (status != null) whatsapp.status = status;
  if (number != null) whatsapp.number = number;
  if (status === "CONNECTED") whatsapp.qrcode = "";
  await whatsapp.save();
  const io = getIO();
  if (io) io.emit("whatsappSession", { whatsappId: parseInt(whatsappId, 10), status: whatsapp.status });
  return res.json(whatsapp);
};

exports.remove = async (req, res) => {
  const { whatsappId } = req.params;
  const whatsapp = await db.Whatsapp.findByPk(whatsappId);
  if (!whatsapp) return res.status(404).json({ error: "Conexão não encontrada" });
  if (whatsapp.instanceKey) {
    try {
      await whatsappApi.logoutInstance(whatsapp.instanceKey);
    } catch (_) {}
  }
  await whatsapp.update({ status: "DISCONNECTED", qrcode: "" });
  const io = getIO();
  if (io) io.emit("whatsappSession", { whatsappId: parseInt(whatsappId, 10), status: "DISCONNECTED" });
  return res.json({ message: "Sessão desconectada" });
};

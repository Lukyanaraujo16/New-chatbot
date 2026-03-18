const axios = require("axios");

const baseURL = process.env.WHATSAPP_API_URL || "http://localhost:9898";
const token = process.env.WHATSAPP_API_TOKEN || "";

const api = axios.create({
  baseURL,
  headers: {
    apikey: token,
    "Content-Type": "application/json",
  },
});

exports.sendText = async (instanceKey, remoteJid, text) => {
  const id = remoteJid.includes("@") ? remoteJid : `${remoteJid}@s.whatsapp.net`;
  const { data } = await api.post(
    "/message/text",
    { id, typeId: "user", message: text },
    { params: { key: instanceKey } }
  );
  return data;
};

exports.getQrBase64 = async (instanceKey) => {
  const { data } = await api.get("/instance/qrbase64", {
    params: { key: instanceKey },
  });
  return data;
};

exports.initInstance = async (instanceKey) => {
  const { data } = await api.post("/instance/init", { key: instanceKey });
  return data;
};

exports.getInstanceInfo = async (instanceKey) => {
  const { data } = await api.get("/instance/info", {
    params: { key: instanceKey },
  });
  return data;
};

exports.logoutInstance = async (instanceKey) => {
  const { data } = await api.get("/instance/logout", {
    params: { key: instanceKey },
  });
  return data;
};

exports.listInstances = async () => {
  const { data } = await api.get("/instance/list");
  return data;
};

exports.checkHealth = async () => {
  try {
    const { data } = await api.get("/status");
    return data === "OK" || data?.status === "OK";
  } catch {
    return false;
  }
};

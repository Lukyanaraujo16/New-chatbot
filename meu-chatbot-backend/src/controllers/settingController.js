const db = require("../models");

exports.index = async (req, res) => {
  const settings = await db.Setting.findAll();
  const obj = {};
  settings.forEach((s) => (obj[s.key] = s.value));
  return res.json(obj);
};

exports.update = async (req, res) => {
  const { settingKey } = req.params;
  const { value } = req.body;
  const [setting] = await db.Setting.findOrCreate({
    where: { key: settingKey },
    defaults: { value: value != null ? String(value) : "" },
  });
  if (!setting.isNewRecord) {
    setting.value = value != null ? String(value) : setting.value;
    await setting.save();
  }
  return res.json(setting);
};

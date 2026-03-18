module.exports = (sequelize, DataTypes) => {
  const Whatsapp = sequelize.define(
    "Whatsapp",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: "DISCONNECTED" },
      qrcode: { type: DataTypes.TEXT },
      retries: { type: DataTypes.INTEGER, defaultValue: 0 },
      number: { type: DataTypes.STRING },
      companyId: { type: DataTypes.INTEGER, defaultValue: 1 },
      // Chave da instância na API Baileys (ex.: session_1)
      instanceKey: { type: DataTypes.STRING },
    },
    { tableName: "whatsapps", underscored: true }
  );
  return Whatsapp;
};

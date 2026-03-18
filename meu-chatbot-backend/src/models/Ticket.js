module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define(
    "Ticket",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      status: { type: DataTypes.STRING, defaultValue: "open" },
      contactId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER },
      queueId: { type: DataTypes.INTEGER },
      whatsappId: { type: DataTypes.INTEGER, allowNull: false },
      companyId: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    { tableName: "tickets", underscored: true }
  );
  return Ticket;
};

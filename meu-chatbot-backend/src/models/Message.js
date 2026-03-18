module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      body: { type: DataTypes.TEXT },
      ack: { type: DataTypes.INTEGER, defaultValue: 0 },
      read: { type: DataTypes.BOOLEAN, defaultValue: false },
      fromMe: { type: DataTypes.BOOLEAN, defaultValue: false },
      mediaUrl: { type: DataTypes.STRING },
      ticketId: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: "messages", underscored: true, updatedAt: false }
  );
  return Message;
};

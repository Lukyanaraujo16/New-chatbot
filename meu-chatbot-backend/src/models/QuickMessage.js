module.exports = (sequelize, DataTypes) => {
  const QuickMessage = sequelize.define(
    "QuickMessage",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      shortcode: { type: DataTypes.STRING, allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      companyId: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    { tableName: "quick_messages", underscored: true }
  );
  return QuickMessage;
};

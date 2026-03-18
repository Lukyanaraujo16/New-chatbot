module.exports = (sequelize, DataTypes) => {
  const Queue = sequelize.define(
    "Queue",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      color: { type: DataTypes.STRING, defaultValue: "#000000" },
      companyId: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    { tableName: "queues", underscored: true }
  );
  return Queue;
};

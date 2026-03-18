module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define(
    "Contact",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING },
      number: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING },
      profilePicUrl: { type: DataTypes.STRING },
      companyId: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    { tableName: "contacts", underscored: true }
  );
  return Contact;
};

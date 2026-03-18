const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      password: { type: DataTypes.VIRTUAL },
      profile: { type: DataTypes.STRING, defaultValue: "user" },
    },
    { tableName: "users", underscored: true }
  );

  User.beforeSave(async (user) => {
    if (user.changed("password") && user.password) {
      user.passwordHash = await bcrypt.hash(user.password, 8);
    }
    if (user.changed("passwordHash") && user.passwordHash && !user.passwordHash.startsWith("$2")) {
      user.passwordHash = await bcrypt.hash(user.passwordHash, 8);
    }
  });

  User.prototype.checkPassword = function (password) {
    return bcrypt.compare(password, this.passwordHash);
  };

  return User;
};

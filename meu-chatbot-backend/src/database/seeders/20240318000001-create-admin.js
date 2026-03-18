"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hash = await bcrypt.hash("admin123", 8);
    await queryInterface.bulkInsert("users", [
      {
        name: "Administrador",
        email: "admin@meuchatbot.com",
        password_hash: hash,
        profile: "admin",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", { email: "admin@meuchatbot.com" });
  },
};

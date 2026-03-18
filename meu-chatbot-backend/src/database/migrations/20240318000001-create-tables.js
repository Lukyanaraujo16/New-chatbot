"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      profile: { type: Sequelize.STRING, defaultValue: "user" },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("users", ["email"], { unique: true });

    await queryInterface.createTable("settings", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      key: { type: Sequelize.STRING, allowNull: false },
      value: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("settings", ["key"], { unique: true });

    await queryInterface.createTable("contacts", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING },
      number: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING },
      profile_pic_url: { type: Sequelize.STRING },
      company_id: { type: Sequelize.INTEGER, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("queues", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      color: { type: Sequelize.STRING, defaultValue: "#000000" },
      company_id: { type: Sequelize.INTEGER, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("whatsapps", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, defaultValue: "DISCONNECTED" },
      qrcode: { type: Sequelize.TEXT },
      retries: { type: Sequelize.INTEGER, defaultValue: 0 },
      number: { type: Sequelize.STRING },
      company_id: { type: Sequelize.INTEGER, defaultValue: 1 },
      instance_key: { type: Sequelize.STRING },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("tickets", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      status: { type: Sequelize.STRING, defaultValue: "open" },
      contact_id: { type: Sequelize.INTEGER, allowNull: false },
      user_id: { type: Sequelize.INTEGER },
      queue_id: { type: Sequelize.INTEGER },
      whatsapp_id: { type: Sequelize.INTEGER, allowNull: false },
      company_id: { type: Sequelize.INTEGER, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("messages", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      body: { type: Sequelize.TEXT },
      ack: { type: Sequelize.INTEGER, defaultValue: 0 },
      read: { type: Sequelize.BOOLEAN, defaultValue: false },
      from_me: { type: Sequelize.BOOLEAN, defaultValue: false },
      media_url: { type: Sequelize.STRING },
      ticket_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("quick_messages", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      shortcode: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      company_id: { type: Sequelize.INTEGER, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("messages");
    await queryInterface.dropTable("tickets");
    await queryInterface.dropTable("whatsapps");
    await queryInterface.dropTable("queues");
    await queryInterface.dropTable("contacts");
    await queryInterface.dropTable("quick_messages");
    await queryInterface.dropTable("settings");
    await queryInterface.dropTable("users");
  },
};

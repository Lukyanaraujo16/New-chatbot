require("dotenv").config();

module.exports = {
  development: {
    dialect: process.env.DB_DIALECT || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "meu_chatbot",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "",
    timezone: process.env.DB_TIMEZONE || "-03:00",
    logging: process.env.DB_DEBUG === "true" ? console.log : false,
    define: { timestamps: true, underscored: true },
  },
  test: {
    dialect: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME ? `${process.env.DB_NAME}_test` : "meu_chatbot_test",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "",
    timezone: process.env.DB_TIMEZONE || "-03:00",
    logging: false,
    define: { timestamps: true, underscored: true },
  },
  production: {
    dialect: process.env.DB_DIALECT || "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    timezone: process.env.DB_TIMEZONE || "-03:00",
    logging: false,
    define: { timestamps: true, underscored: true },
  },
};

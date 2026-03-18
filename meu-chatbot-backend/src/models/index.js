const { Sequelize } = require("sequelize");
const config = require("../config/database.js");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    timezone: dbConfig.timezone,
    logging: dbConfig.logging,
    define: dbConfig.define || { timestamps: true, underscored: true },
  }
);

const db = {
  sequelize,
  Sequelize,
  User: require("./User")(sequelize, Sequelize.DataTypes),
  Setting: require("./Setting")(sequelize, Sequelize.DataTypes),
  Contact: require("./Contact")(sequelize, Sequelize.DataTypes),
  Queue: require("./Queue")(sequelize, Sequelize.DataTypes),
  Whatsapp: require("./Whatsapp")(sequelize, Sequelize.DataTypes),
  Ticket: require("./Ticket")(sequelize, Sequelize.DataTypes),
  Message: require("./Message")(sequelize, Sequelize.DataTypes),
  QuickMessage: require("./QuickMessage")(sequelize, Sequelize.DataTypes),
};

// Associações
db.Contact.hasMany(db.Ticket, { foreignKey: "contactId" });
db.Ticket.belongsTo(db.Contact, { foreignKey: "contactId" });

db.Queue.hasMany(db.Ticket, { foreignKey: "queueId" });
db.Ticket.belongsTo(db.Queue, { foreignKey: "queueId" });

db.Whatsapp.hasMany(db.Ticket, { foreignKey: "whatsappId" });
db.Ticket.belongsTo(db.Whatsapp, { foreignKey: "whatsappId" });

db.User.hasMany(db.Ticket, { foreignKey: "userId" });
db.Ticket.belongsTo(db.User, { foreignKey: "userId" });

db.Ticket.hasMany(db.Message, { foreignKey: "ticketId" });
db.Message.belongsTo(db.Ticket, { foreignKey: "ticketId" });

module.exports = db;

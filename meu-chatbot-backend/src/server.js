require("dotenv").config();

const http = require("http");
const app = require("./app");
const db = require("./models");
const { initIO } = require("./lib/socket");

const PORT = process.env.PORT || 9003;

const server = http.createServer(app);

server.listen(PORT, async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Banco de dados conectado.");
  } catch (e) {
    console.error("Erro ao conectar no banco:", e.message);
    process.exit(1);
  }

  initIO(server);
  console.log(`Servidor rodando na porta ${PORT}`);
});

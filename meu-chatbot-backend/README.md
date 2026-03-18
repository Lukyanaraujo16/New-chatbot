# Meu Chatbot Backend

Backend limpo e 100% editável para o painel de atendimento WhatsApp. Funciona com o frontend existente e com a API WhatsApp (Baileys) em `dev-connect-ai-wa/src`.

## Requisitos

- Node.js 18+
- PostgreSQL
- API WhatsApp (Baileys) rodando em `http://localhost:9898` (pasta `dev-connect-ai-wa/src`)

## Instalação

```bash
cd meu-chatbot-backend
npm install
cp .env.example .env
# Edite .env com banco, JWT_SECRET, etc.
```

## Banco de dados

Crie o banco no PostgreSQL (ex.: `meu_chatbot`) e rode as migrações:

```bash
npm run db:migrate
npm run db:seed
```

Isso cria as tabelas e um usuário admin:

- **Email:** admin@meuchatbot.com  
- **Senha:** admin123  

Altere a senha após o primeiro login.

## Rodar

```bash
# Produção
npm start

# Desenvolvimento (nodemon)
npm run dev
```

O servidor sobe em **http://localhost:9003** (ou a porta definida em `PORT` no `.env`).

## Frontend

No frontend (React), configure o `.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:9003
```

## API WhatsApp (Baileys)

Suba a API em `dev-connect-ai-wa/src` na porta 9898:

```bash
cd ../dev-connect-ai-wa
npm run dev
```

No `.env` do backend, confira:

- `WHATSAPP_API_URL=http://localhost:9898`
- `WHATSAPP_API_TOKEN=` (o mesmo token do `config.js` da API Baileys)

## Rotas principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/login | Login (email, password) |
| POST | /auth/refresh_token | Renovar token |
| POST | /auth/signup | Cadastro |
| DELETE | /auth/logout | Logout (Bearer token) |
| GET | /users | Listar usuários |
| GET | /contacts | Listar contatos |
| GET | /tickets | Listar tickets |
| GET | /messages/:ticketId | Mensagens do ticket |
| POST | /messages/:ticketId | Enviar mensagem |
| GET/POST/PUT/DELETE | /whatsapp/ | Conexões WhatsApp |
| POST | /whatsappsession/:whatsappId | Gerar QR da sessão |
| GET/POST | /queue | Filas |

Todas as rotas (exceto auth e status) exigem header: `Authorization: Bearer <token>`.

## Estrutura do projeto

```
src/
  config/       # Banco
  controllers/  # Lógica das rotas
  database/     # Migrations e seeders
  lib/          # Socket.IO
  middleware/   # isAuth (JWT)
  models/       # Sequelize
  routes/       # Rotas Express
  services/     # whatsappApi (chamadas à API Baileys)
  app.js
  server.js
```

## Licença

MIT.

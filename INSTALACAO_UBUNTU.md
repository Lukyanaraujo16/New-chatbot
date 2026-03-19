# Instalação no Ubuntu Server 20.04

Script **não interativo**: instala dependências, banco, backend, API WhatsApp e frontend, e sobe tudo com PM2. O sistema fica acessível na **porta 80**.

## Requisitos

- Ubuntu 20.04 (ou 22.04) com acesso root/sudo
- Acesso à internet no servidor

## Passo a passo

1. **Envie o projeto para o servidor** (por exemplo em `/opt/meu-chatbot`):
   - Raiz deve conter: `install.sh`, `meu-chatbot-backend/`, `dev-connect-ai-wa/`.
   - Dentro de `dev-connect-ai-wa/frontend/` deve existir a pasta **`automatizaai/`** (build do frontend com index.html, static/, config.json). Sem ela o site não sobe na porta 80.

2. **No servidor, execute:**
   ```bash
   cd /opt/meu-chatbot
   chmod +x install.sh
   sudo bash install.sh
   ```
   Não é necessário responder nenhuma pergunta; o script usa valores padrão e ao final exibe como acessar o sistema.

3. **Configuração opcional (antes de rodar):** defina variáveis de ambiente ou use `install.conf`:
   ```bash
   source install.conf && sudo -E bash install.sh
   ```

## O que o script instala

- Pacotes: `curl`, `git`, `build-essential`, `postgresql`, `postgresql-contrib`
- **Node.js 20.x** (NodeSource)
- **PM2** e **serve** (globais)
- Cria usuário e banco **PostgreSQL** (senha padrão: `MeuChatbot2024!`)
- Gera **.env** do backend (JWT, banco, CORS, API WhatsApp)
- **npm install** e **build** do frontend (React)
- **PM2**: inicia backend (9003), API WhatsApp (9898), frontend na **porta 80**
- **pm2 save** e **pm2 startup** para subir tudo após reinício
- Se **ufw** estiver ativo, libera as portas 80 e 9003

## Após a instalação

- **Acesse o sistema em:** `http://IP_DO_SERVIDOR` (porta 80). Use **http://** (não https).
- **Login:** `admin@meuchatbot.com` / `admin123` (troque a senha depois)
- Se não conectar, libere a porta 80 no **firewall do provedor** (painel do VPS).

A senha do PostgreSQL e dados do banco ficam em `.install-db-info.txt` na pasta do projeto (leitura apenas para root).

Comandos úteis:
- `pm2 status` — ver processos
- `pm2 logs` — ver logs
- `pm2 restart all` — reiniciar tudo

## Variáveis opcionais (install.conf ou ambiente)

| Variável | Descrição |
|----------|-----------|
| `DB_PASS` | Senha do PostgreSQL |
| `DB_NAME` | Nome do banco (padrão: meu_chatbot) |
| `DB_USER` | Usuário do banco (padrão: meuchatbot) |
| `PORT_BACKEND` | Porta do backend (9003) |
| `PORT_FRONTEND` | Porta do frontend (3000) |
| `BACKEND_PUBLIC_URL` | URL que o navegador usa para o backend (ex: com domínio) |
| `WHATSAPP_API_TOKEN` | Token da API Baileys (igual ao config.js) |

## Reinstalação / atualização

Para apenas atualizar o código e reiniciar, sem rodar o install de novo:

```bash
cd /opt/meu-chatbot/meu-chatbot-backend && npm install && npx sequelize-cli db:migrate
cd /opt/meu-chatbot/dev-connect-ai-wa && npm install
cd /opt/meu-chatbot/dev-connect-ai-wa/frontend && npm install && npm run build
pm2 restart all
```

# Mapeamento do Projeto – Chatbot WhatsApp

Este documento descreve a estrutura do código que você comprou, para instalação, correção de bugs e futuras implementações.

---

## Visão geral

O projeto é um **sistema de atendimento/chatbot para WhatsApp** com:

- **Painel web** (frontend React + backend Node) para gerenciar contatos, conversas, campanhas, fluxos etc.
- **Conexão com WhatsApp** feita de duas formas no código:
  1. **DevConnectAI (pasta raiz)** – API própria usando **Baileys** (biblioteca não-oficial).
  2. **ConnectZap** – Conector em Go (binário), que usa **WhatsMeow** e envia eventos via webhook.

---

## Estrutura de pastas

```
chat novo alex/
├── connectzap/          # Conector WhatsApp (binário + config)
├── dev-connect-ai-wa/   # Projeto principal
│   ├── src/             # API WhatsApp (Baileys) – porta 9898
│   ├── backend/         # Backend do painel (Node + Sequelize)
│   │   └── automatizaai/
│   └── frontend/        # Painel React (Automatiza AI)
├── whaticket/           # Cópia alternativa do backend + frontend (automatizaai)
└── *.zip                # Arquivos compactados
```

---

## 1. ConnectZap (`connectzap/`)

- **Função:** Conector WhatsApp (provavelmente WhatsMeow), roda como serviço.
- **Binários:** `connectzap-linux-arm64`, `connectzap-x86_64` (Linux).
- **Porta:** 3487 (configurável no `.env`).
- **Banco:** PostgreSQL (`DB_*` no `.env`).
- **Outros:** Redis, NATS.
- **Webhook:** No `.env` está apontando para `https://back.desktopchat.com.br/api/whatsmeow/receive` (URL externa). Para usar no seu sistema, isso precisará apontar para a URL do seu backend.
- **Observação:** O backend em `dev-connect-ai-wa/backend` e em `whaticket/backend` não parece ter rota `/api/whatsmeow/receive` no código que foi possível analisar; pode ser que o projeto original use outro backend ou que essa integração ainda precise ser feita.

---

## 2. DevConnectAI – API WhatsApp (`dev-connect-ai-wa/src/`)

- **Função:** API que mantém sessões WhatsApp usando **Baileys** (fork em `@whiskeysockets/baileys`).
- **Porta:** 9898 (definida em `src/config/config.js` ou `PORT` no `.env`).
- **Sessões:** Salvas em `sessions.json` na raiz de `dev-connect-ai-wa`.
- **Banco:** Não usa banco; apenas arquivos (sessions, media).
- **Script de início:** `node src/server.js` ou `npm run dev` (nodemon).
- **Config:** `src/config/config.js` (token, webhook, tipos de mídia, etc.).

Este é o “coração” da conexão WhatsApp da DevConnectAi: o painel (backend) provavelmente se comunica com esta API para criar instâncias, enviar mensagens e receber eventos (muitas vezes via webhook).

---

## 3. Backend do painel (`dev-connect-ai-wa/backend/` e `whaticket/backend/`)

- **Pasta principal:** `backend/automatizaai/` (nome interno “Automatiza AI”).
- **Stack:** Node.js, Express, **Sequelize** (PostgreSQL), **Redis**, **Socket.io**, filas (Bull/BullMQ).
- **Porta:** 9003 (variável `PORT` no `.env`).
- **Script:** `npm start` → `nodemon automatizaai/server.js`.

Estrutura lógica dentro de `automatizaai/`:

- `config/` – configurações (banco, Redis, upload, etc.)
- `controllers/` – lógica de atendimento, campanhas, chatbot, contatos, etc.
- `models/` – modelos Sequelize
- `routes/` – rotas da API
- `services/`, `jobs/`, `queues/` – regras de negócio e filas
- `libs/` – bibliotecas internas (ex.: integração WhatsApp)

**Importante:** Alguns arquivos críticos estão **ofuscados** (código ilegível), por exemplo:

- `config/database.js`
- `server.js`

Isso dificulta **corrigir bugs** e **alterar configurações de banco** diretamente nesses arquivos. Para mudar coisas que dependem deles, seria necessário ter os fontes originais não ofuscados ou autorização do fornecedor.

---

## 4. Frontend do painel (`dev-connect-ai-wa/frontend/` e `whaticket/frontend/`)

- **Stack:** React 16, Material-UI (MUI), react-scripts, react-app-rewired.
- **Nome exibido:** “Automatiza AI” (configurável no `.env` do frontend).
- **Porta de desenvolvimento:** 9011 (`SERVER_PORT` no `.env`).
- **Variáveis importantes (`.env`):**
  - `REACT_APP_BACKEND_URL` – URL do backend (ex.: `https://autoriza.dominio` ou `http://localhost:9003`).
  - `REACT_APP_ENV_TOKEN`, `REACT_APP_NAME_SYSTEM`, cores, etc.

O frontend consome a API do backend e, indiretamente, a API WhatsApp (via backend).

---

## 5. Whaticket (`whaticket/`)

- É praticamente uma **cópia** do backend e do frontend do `dev-connect-ai-wa` (mesmo código “automatizaai”, mesmas dependências).
- Pode ter sido usado para outro cliente/ambiente ou outra versão. Para instalar e editar, você pode escolher **um** deles (por exemplo, só `dev-connect-ai-wa`) e manter o outro como backup.

---

## Requisitos para rodar

- **Node.js** (versão compatível com os `package.json` – ex.: Node 16 ou 18).
- **PostgreSQL** – usado pelo backend (e pelo ConnectZap, se for usar).
- **Redis** – usado pelo backend para filas e cache.
- **npm** (ou yarn) em cada pasta: raiz de `dev-connect-ai-wa`, `backend`, `frontend`.
- **ConnectZap (opcional):** se for usar o conector em Go, Redis + NATS + PostgreSQL conforme o `.env` do connectzap.

---

## Fluxo resumido (como o sistema pode funcionar)

1. **Painel (frontend)** → usuário acessa o React (ex.: porta 9011).
2. **Frontend** → chama **backend** (ex.: porta 9003) para login, contatos, conversas, campanhas, etc.
3. **Backend** → para enviar/receber WhatsApp pode:
   - falar com a **API DevConnectAI** (`dev-connect-ai-wa/src`, porta 9898), ou
   - receber webhooks do **ConnectZap** (se o webhook for apontado para esse backend e a rota existir).
4. **API DevConnectAI** (Baileys) ou **ConnectZap** (WhatsMeow) → conectam de fato ao WhatsApp.

Ainda não está claro no código se o painel que você tem usa apenas a API em `src/`, apenas o ConnectZap, ou os dois em cenários diferentes. Isso pode ser esclarecido quando você rodar e testar (e checando qual URL o frontend/backend usam para “conexão WhatsApp”).

---

## Posso te ajudar com o quê?

- **Instalação:** montar um passo a passo para instalar backend, frontend e (se quiser) a API em `src/` e o ConnectZap no seu ambiente (incluindo .env e dependências).
- **Correção de bugs:** em todo código **não ofuscado** (frontend, maioria dos controllers, rotas, serviços, `src/api`, etc.). Nos arquivos ofuscados, só é possível sugerir substituição se você tiver os fontes originais.
- **Implementações:** novas funcionalidades, melhorias de UX, integrações, desde que não dependam de alterar a lógica interna dos arquivos ofuscados.
- **Preparação para revenda:** README, `.env.example`, documentação de instalação, dicas de segurança (não commitar senhas/tokens).

---

## Próximos passos sugeridos

1. Definir qual “stack” de WhatsApp você quer usar primeiro: **só a API em `src/` (Baileys)** ou **ConnectZap (WhatsMeow)**. Isso define o que instalar e configurar.
2. Preencher os `.env` do backend e do frontend com seus valores (banco, Redis, URL do backend, etc.).
3. Instalar dependências e subir backend e frontend; em seguida, se for o caso, a API em `src/` e/ou o ConnectZap.
4. Quando algo quebrar ou você quiser uma nova função, dizer em qual parte (frontend, backend, API WhatsApp, ConnectZap) e podemos corrigir ou implementar no código não ofuscado.

Se quiser, o próximo passo pode ser um **guia de instalação passo a passo** (por exemplo: 1) PostgreSQL + Redis, 2) Backend, 3) Frontend, 4) API WhatsApp em `src/`) já adaptado ao seu projeto.

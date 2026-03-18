# Independência do sistema e chamadas externas

Este documento explica o que foi feito para deixar o sistema mais independente e como eliminar/ajustar chamadas externas.

---

## 1. O que foi feito (código limpo)

### Arquivos substituídos (eram ofuscados)

- **`backend/automatizaai/config/database.js`**  
  Substituído por uma versão **limpa** que lê todas as variáveis do `.env` (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, DB_DIALECT, DB_TIMEZONE, DB_DEBUG, DB_SSL). Você pode editar esse arquivo à vontade (mudar dialect, opções do Sequelize, etc.).

- **`backend/automatizaai/server.js`**  
  Substituído por uma versão **limpa** que:
  - Carrega `dotenv` e a config do banco
  - Sobe o app Express na porta `PORT`
  - Chama `queues.startQueueProcess()` (se existir)
  - Inicializa Socket.IO com `initIO(server)`
  - Usa `http-graceful-shutdown` no mesmo servidor

Assim, **configuração de banco** e **subida do servidor** ficam sob seu controle e editáveis.

---

## 2. O que continua ofuscado (e como conviver)

Ainda estão ofuscados, entre outros:

- `app.js`, `bootstrap.js`, `primary.js`
- `queues.js`, `worker.js`
- `libs/socket.js`, vários `controllers`, `services`, `models`

**Não é possível** alterar a lógica interna desses arquivos sem o código-fonte original. O que você **pode** fazer:

- Corrigir bugs e novas funcionalidades em **qualquer arquivo que não esteja ofuscado** (rotas que você criar, helpers, integrações novas).
- Ajustar **configuração** via `.env` e via `config/database.js` (já limpo).
- Trocar a **API de WhatsApp**: usar só a API em `dev-connect-ai-wa/src` (Baileys) e, se quiser, no futuro substituir o uso interno do backend nessa API por uma integração sua (veja seção 4).

---

## 3. Chamadas externas e como ficar independente

### 3.1 ConnectZap (conector WhatsApp)

- **Onde:** pasta `connectzap/`, arquivo `.env`.
- **Chamada externa:**  
  `CONNECTZAP_GLOBAL_WEBHOOK=https://back.desktopchat.com.br/api/whatsmeow/receive`  
  Ou seja, os eventos do WhatsApp são enviados para um servidor **externo** (da empresa que vendeu o código).

**Para ficar independente:**

1. **Opção A – Não usar ConnectZap**  
   Use apenas a API em `dev-connect-ai-wa/src` (Baileys). O painel (backend atual) já está preparado para falar com essa API. Nesse caso você não precisa configurar o ConnectZap nem o webhook.

2. **Opção B – Usar ConnectZap apontando para o seu backend**  
   - No `.env` do ConnectZap, altere para algo como:  
     `CONNECTZAP_GLOBAL_WEBHOOK=https://SEU_DOMINIO/api/whatsmeow/receive`  
     (ou `http://localhost:9003/api/whatsmeow/receive` em desenvolvimento.)
   - No **seu** backend você precisará ter uma rota que **receba** esse webhook (ex.: `POST /api/whatsmeow/receive`). Hoje o backend que você tem pode não expor essa rota (o código que a implementaria pode estar ofuscado ou em outro projeto). Se não existir, será preciso **criar essa rota** em código novo (não ofuscado) e, nela, processar o JSON que o ConnectZap envia e atualizar tickets/mensagens no seu banco.

### 3.2 Frontend (React)

- **Onde:** `frontend/.env`.
- **Chamada “externa”:**  
  `REACT_APP_BACKEND_URL = https://autoriza.dominio`  
  Isso é a URL do **seu** backend. Não é dependência de terceiro.

**Para ficar independente:**  
Altere para a URL do seu próprio backend, por exemplo:

- Desenvolvimento: `REACT_APP_BACKEND_URL=http://localhost:9003`
- Produção: `REACT_APP_BACKEND_URL=https://seu-dominio.com`

Assim o frontend usa só o seu backend.

### 3.3 API DevConnectAI (Baileys) – `dev-connect-ai-wa/src`

- Essa API **roda na sua máquina/servidor** (porta 9898). Não há chamada para servidor da empresa.
- O backend (painel) se comunica com ela por **localhost** (ou pela URL que você configurar). Não é “chamada externa” no sentido de terceiro.

Conclusão: **dá para ter um chatbot só seu** usando essa API + backend + frontend, sem depender de servidor externo.

---

## 4. Sistema “espelho” (idêntico) com frontend igual

Você perguntou se dá para **criar um sistema nosso idêntico** e usar **o mesmo frontend**.

- **Usar o mesmo frontend:** sim. Basta apontar `REACT_APP_BACKEND_URL` para o backend que você quiser (o atual ou um novo).
- **Sistema “idêntico” por baixo:**  
  - O backend atual já é “seu” no sentido de rodar aí; parte dele (app, filas, socket, vários services/models) continua ofuscada, então você **não** consegue reescrever essa parte de forma idêntica sem os fontes.
  - O que **dá para fazer** é:
    1. Manter esse backend + frontend e só trocar o que está limpo (config, server, e qualquer módulo novo que você criar).
    2. Ou, no longo prazo, **criar um backend novo** que:
       - Fale a **mesma API** que o frontend espera (mesmas rotas, mesmo formato de dados),
       - Use a **mesma base de dados** (mesmo schema/tabelas) ou um schema migrado,
       - Integre com a API WhatsApp em `src/` (Baileys) ou com o ConnectZap (webhook) em código seu, limpo.

Ou seja: **sim, dá para ter um chatbot só seu e usar essa mesma frontend**; hoje isso é feito mantendo o backend atual (com os arquivos que já foram “limpos” e o restante ofuscado) e controlando configuração e chamadas externas como acima. Um backend 100% novo e idêntico em comportamento só seria viável reimplementando as rotas e a lógica (com ou sem os fontes originais).

---

## 5. Resumo prático

| O quê | Situação | O que fazer |
|-------|----------|-------------|
| **database.js** | Substituído por versão limpa | Já editável; ajuste .env e opções do Sequelize aqui. |
| **server.js** | Substituído por versão limpa | Já editável; pode mudar porta, ordem de inicialização, etc. |
| **Restante do backend** | Ainda ofuscado | Não editar; evoluir via novos arquivos/rotas e .env. |
| **ConnectZap webhook** | Aponta para servidor externo | Trocar no .env do ConnectZap para sua URL; criar rota `/api/whatsmeow/receive` no backend se for usar ConnectZap. |
| **Frontend BACKEND_URL** | Aponta para um domínio exemplo | Trocar no frontend/.env para a URL do seu backend. |
| **API WhatsApp (src/)** | Local (Baileys) | Nenhuma dependência externa; usar como está. |

Com isso você fica **independente de servidores externos** para o fluxo principal (frontend → seu backend → sua API WhatsApp). As únicas “chamadas externas” que precisam de ação são o webhook do ConnectZap (se for usá-lo) e a URL do backend no frontend (sempre sua).

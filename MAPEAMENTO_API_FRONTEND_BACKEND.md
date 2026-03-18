# Mapeamento: o que o frontend espera do backend

Este documento lista **rotas, autenticação e integrações** que o novo backend precisa implementar para funcionar com o **frontend atual** e com a **API WhatsApp** (Baileys) em `dev-connect-ai-wa/src`.

Use como referência para construir o backend novo (localhost, 100% seu).

---

## 1. Configuração do frontend

O frontend usa variáveis de ambiente. No **build** elas viram valores fixos; em **desenvolvimento** o React lê do `.env`.

| Variável | Uso | Exemplo para localhost |
|----------|-----|-------------------------|
| `REACT_APP_BACKEND_URL` | URL base das chamadas HTTP e do Socket.IO | `http://localhost:9003` |
| `REACT_APP_ENV_TOKEN` | Token de ambiente (pode ser usado em algumas APIs) | Qualquer string; manter se o frontend validar |
| `REACT_APP_NAME_SYSTEM` | Nome do sistema na interface | "Meu Chatbot" |
| `REACT_APP_VERSION` | Versão exibida | "1.0.0" |
| `REACT_APP_PRIMARY_COLOR` | Cor primária da UI | #0b5394 |
| Outras | Suporte, Facebook, etc. | Conforme necessidade |

**Para localhost:** no `.env` do frontend defina:

```env
REACT_APP_BACKEND_URL=http://localhost:9003
```

O frontend deve fazer as requisições para `REACT_APP_BACKEND_URL + path` (ex.: `http://localhost:9003/auth/login`). O Socket.IO provavelmente conecta na mesma origem (mesmo host/porta do backend).

---

## 2. Autenticação (JWT)

Padrão compatível com o **whaticket-community** (e com o painel Automatiza AI):

| Método | Rota | Uso |
|--------|------|-----|
| POST | `/auth/login` | Login: body `{ email, password }` → retorna token (e refresh token, se houver) |
| POST | `/auth/refresh_token` | Renovar token (body ou header com refresh token) |
| POST | `/auth/signup` | Cadastro de usuário (se o frontend tiver tela de registro) |
| DELETE | `/auth/logout` | Logout (token no header) |

O frontend deve enviar o **token** nas requisições seguintes, em geral no header:

- `Authorization: Bearer <token>`

O novo backend deve:

- Ter middleware `isAuth` que lê o JWT e anexa o usuário em `req`.
- Proteger as rotas que precisam de login com esse middleware.

---

## 3. Rotas da API do backend (painel)

O backend atual (automatizaai) monta muitas rotas; o **whaticket-community** é uma base parecida e em código aberto. Abaixo está o **núcleo** que o frontend de atendimento WhatsApp costuma usar, mais a lista de **módulos** que o index do backend atual registra.

### 3.1 Rotas base (estilo whaticket-community)

Todas sob a **mesma base** (ex.: `http://localhost:9003`). Nada de prefixo `/api` obrigatório, a não ser onde indicado.

| Método | Rota | Descrição |
|--------|------|-----------|
| **Auth** | | |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh_token` | Refresh token |
| POST | `/auth/signup` | Cadastro |
| DELETE | `/auth/logout` | Logout |
| **Usuários** | | |
| GET | `/users` | Listar usuários |
| GET | `/users/:userId` | Ver usuário |
| POST | `/users` | Criar usuário |
| PUT | `/users/:userId` | Atualizar usuário |
| DELETE | `/users/:userId` | Remover usuário |
| **Configurações** | | |
| GET | `/settings` | Listar configurações |
| PUT | `/settings/:settingKey` | Atualizar configuração |
| **Contatos** | | |
| GET | `/contacts` | Listar contatos |
| GET | `/contacts/:contactId` | Ver contato |
| POST | `/contacts` | Criar contato |
| POST | `/contact` | Obter contato (ex.: por número) |
| PUT | `/contacts/:contactId` | Atualizar contato |
| DELETE | `/contacts/:contactId` | Remover contato |
| POST | `/contacts/import` | Importar contatos |
| **Tickets (conversas)** | | |
| GET | `/tickets` | Listar tickets |
| GET | `/tickets/:ticketId` | Ver ticket |
| POST | `/tickets` | Criar ticket |
| PUT | `/tickets/:ticketId` | Atualizar ticket |
| DELETE | `/tickets/:ticketId` | Remover ticket |
| **Mensagens** | | |
| GET | `/messages/:ticketId` | Mensagens do ticket |
| POST | `/messages/:ticketId` | Enviar mensagem (multipart para mídia) |
| DELETE | `/messages/:messageId` | Remover mensagem |
| **WhatsApp (conexão)** | | |
| GET | `/whatsapp/` | Listar conexões WhatsApp |
| POST | `/whatsapp/` | Criar conexão |
| GET | `/whatsapp/:whatsappId` | Ver conexão |
| PUT | `/whatsapp/:whatsappId` | Atualizar conexão |
| DELETE | `/whatsapp/:whatsappId` | Remover conexão |
| **Sessão WhatsApp** | | |
| POST | `/whatsappsession/:whatsappId` | Iniciar/gerar QR sessão |
| PUT | `/whatsappsession/:whatsappId` | Atualizar sessão |
| DELETE | `/whatsappsession/:whatsappId` | Desconectar sessão |
| **Filas** | | |
| GET | `/queue` | Listar filas |
| GET | `/queue/:queueId` | Ver fila |
| POST | `/queue` | Criar fila |
| PUT | `/queue/:queueId` | Atualizar fila |
| DELETE | `/queue/:queueId` | Remover fila |
| **Respostas rápidas** | | |
| Rotas de quick answer / quick message | Conforme nome no backend atual | Listar, criar, editar, excluir |
| **API externa (envio de mensagem)** | | |
| POST | `/api/messages/send` | Envio via API (ex.: webhook) – pode usar token de API |

### 3.2 Módulos extras do backend atual (automatizaai)

O `routes/index.js` do backend atual registra também (paths exatos podem variar; o frontend pode chamar com prefixos como `/company`, `/campaigns`, etc.):

- **Company** – empresas
- **Plan** – planos
- **Ticket notes** – notas do ticket
- **Help** – ajuda
- **Dashboard** – métricas
- **Schedule** – agendamentos
- **Tags** – tags
- **Contact list / contact list item** – listas de contato
- **Campaign / campaign setting** – campanhas
- **Announcement** – anúncios
- **Chat** – chat
- **Chatbot** – fluxos de chatbot
- **Integrations / webhook** – integrações
- **Subscription** – assinaturas
- **Invoices** – faturas
- **Version** – versão do sistema
- **Rating** – avaliação
- **Queue option** – opções de fila
- **Ticket tag** – vínculo ticket–tag
- **Task** – tarefas
- **Forgot password** – recuperar senha
- **Email** – envio de e-mail
- **OpenAI** – IA
- **Calendar** – calendário
- **Config** – configurações adicionais
- **Import archive chat** – importar conversas
- **Storage** – armazenamento
- **Files** – arquivos
- **Prompt** – prompts
- **Queue integration** – integração com filas
- **Confirm account** – confirmar conta
- **Update** – atualização do sistema
- **Token API** – token de API
- **Search** – busca
- **Atendimento panel** – painel de atendimento
- **Flow** – fluxos
- **Pixel** – pixel (ex.: Facebook)
- **Site integration** – integração site
- **Server** – servidor
- **Ticket status** – status do ticket
- **Omnichannel** – omnichannel
- **Events** – eventos (Socket)
- **Dashboard Connect** – dashboard da conexão
- **Administration** – administração
- **ApiRest** – API REST
- **Black list** – blacklist
- **Group** – grupos
- **Message flow** – fluxo de mensagens

Para o **primeiro MVP** do backend novo, implemente pelo menos: **auth**, **users**, **settings**, **contacts**, **tickets**, **messages**, **whatsapp**, **whatsappsession**, **queue** e **quick message**. O restante pode ser acrescentado conforme você for usando as telas do frontend.

---

## 4. Socket.IO (tempo real)

O frontend provavelmente usa **Socket.IO** para:

- Novas mensagens
- Atualização de status do WhatsApp (QR, conectado, etc.)
- Atualização de tickets (novo ticket, ticket fechado, etc.)

O cliente Socket.IO costuma conectar na **mesma URL do backend** (ex.: `http://localhost:9003`). O backend atual usa Socket.IO com Redis (adapter) em produção; para localhost você pode usar só o Socket.IO em uma instância.

O novo backend deve:

- Anexar o Socket.IO ao mesmo servidor HTTP do Express.
- Emitir eventos que o frontend já escuta (ex.: novo ticket, nova mensagem, atualização de sessão WhatsApp). Os nomes exatos dos eventos podem estar no código do frontend (build) ou você pode inspecionar no DevTools (aba Network, WS).

---

## 5. API WhatsApp (Baileys) – `dev-connect-ai-wa/src`

Essa API roda em **outro processo**, em geral na porta **9898** (configurável). O **backend (painel)** é quem chama essa API, não o frontend.

**Base URL:** `http://localhost:9898` (ou a que você configurar).

**Autenticação:** as rotas costumam usar um **token** no header (ex.: `apikey: TOKEN`). No `config.js` da API há um `TOKEN`; use o mesmo no backend ao chamar.

### 5.1 Rotas da API WhatsApp (Baileys)

Prefixos montados no `src/api/routes/index.js`:

| Prefixo | Arquivo | Uso |
|---------|---------|-----|
| (raiz) | - | GET `/status` → OK |
| `/instance` | instance.route.js | Instância WhatsApp |
| `/message` | message.route.js | Envio e gestão de mensagens |
| `/group` | group.route.js | Grupos |
| `/misc` | misc.route.js | Contatos e outros |

**Instance (exemplos):**

- POST `/instance/init` – criar/iniciar instância
- POST `/instance/editar` – editar instância
- GET `/instance/qr` – obter QR code
- GET `/instance/qrbase64` – QR em base64
- GET `/instance/info` – informações da instância
- GET `/instance/restore` – restaurar sessões
- GET `/instance/logout` – logout da sessão
- GET `/instance/delete` – deletar instância
- GET `/instance/list` – listar instâncias
- POST `/instance/getcode` – código de pareamento

**Message (exemplos):**

- POST `/message/text` – enviar texto
- POST `/message/image` – enviar imagem (multipart)
- POST `/message/audio` – áudio
- POST `/message/video` – vídeo
- POST `/message/doc` – documento
- POST `/message/contact` – contato
- POST `/message/read` – marcar como lida
- Outras: button, list, mediaurl, etc.

**Misc:**

- GET `/misc/contacts` – contatos (com keyVerify, loginVerify)

O novo backend, ao receber “enviar mensagem” do frontend, deve:

1. Validar usuário/ticket.
2. Chamar a API WhatsApp (ex.: `POST http://localhost:9898/message/text` com o token no header e body compatível).

---

## 6. Fluxo resumido (localhost)

```
[Browser]  REACT_APP_BACKEND_URL = http://localhost:9003
    ↓
[Frontend]  HTTP: GET/POST .../auth, /tickets, /messages, ...
[Frontend]  WebSocket: Socket.IO em http://localhost:9003
    ↓
[Backend novo]  Express + Socket.IO (porta 9003)
    ↓
[Backend novo]  Chama API WhatsApp quando precisar enviar/ler WhatsApp
    ↓
[API WhatsApp]  Baileys (porta 9898) – já existente em dev-connect-ai-wa/src
```

---

## 7. Próximos passos sugeridos

1. **Backend novo (Node/Express):**
   - Projeto limpo (ex.: `meu-chatbot-backend`).
   - Rotas de auth (login, refresh, logout) + middleware JWT.
   - Rotas de users, settings, contacts, tickets, messages, whatsapp, whatsappsession, queue (e quick message se o frontend usar).
   - Integração com a API em `http://localhost:9898` (token no header) para criar sessão, enviar mensagem, etc.
   - Socket.IO no mesmo servidor e emissão dos eventos que o frontend espera.
2. **Banco de dados:** PostgreSQL (ou o que o frontend/backend antigo usem). Definir modelos (User, Contact, Ticket, Message, Whatsapp, Queue, Setting, etc.) e migrações.
3. **Frontend:** manter como está; apenas `REACT_APP_BACKEND_URL=http://localhost:9003` (e outras variáveis se precisar).
4. **API WhatsApp:** manter `dev-connect-ai-wa/src` rodando em localhost:9898; não depender de nada externo.

Com isso você tem o mapeamento para “ter o projeto na mão”: front e API WhatsApp atuais; backend novo implementando essa interface em localhost.

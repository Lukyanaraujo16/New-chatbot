#!/bin/bash
# =============================================================================
# install.sh - Instalação completa do sistema de chatbot WhatsApp no Ubuntu 20.04
# Não interativo. Execute: sudo bash install.sh
# Sistema fica acessível na porta 80.
# =============================================================================

set -e

# --- Configurações (todas com valor padrão; sem perguntas) ---
INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_NAME="${DB_NAME:-meu_chatbot}"
DB_USER="${DB_USER:-meuchatbot}"
# Senha do banco: padrão fixa (troque depois se quiser). Defina DB_PASS no ambiente para usar outra.
DB_PASS="${DB_PASS:-MeuChatbot2024!}"
PORT_BACKEND="${PORT_BACKEND:-9003}"
PORT_API="${PORT_API:-9898}"
PORT_HTTP="${PORT_HTTP:-80}"
NODE_VERSION="${NODE_VERSION:-20}"
BACKEND_PUBLIC_URL="${BACKEND_PUBLIC_URL:-}"
WHATSAPP_API_TOKEN="${WHATSAPP_API_TOKEN:-ss94soj4rc4aK1g8-n7irHnfDipMrgssO2exV12Oo-U}"
SERVER_IP="${SERVER_IP:-}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[AVISO]${NC} $1"; }
log_error() { echo -e "${RED}[ERRO]${NC} $1"; }

# --- Verificar root ---
if [ "$(id -u)" -ne 0 ]; then
  log_error "Execute com sudo: sudo bash install.sh"
  exit 1
fi

# --- Detectar IP do servidor ---
if [ -z "$SERVER_IP" ]; then
  SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
  [ -z "$SERVER_IP" ] && SERVER_IP="127.0.0.1"
fi
if [ -z "$BACKEND_PUBLIC_URL" ]; then
  BACKEND_PUBLIC_URL="http://${SERVER_IP}:${PORT_BACKEND}"
fi
# Origens CORS: frontend na porta 80 (ou PORT_HTTP)
if [ "$PORT_HTTP" = "80" ]; then
  FRONTEND_ORIGIN="http://${SERVER_IP}"
  ALLOWED_ORIGINS_LIST="http://localhost,http://127.0.0.1,http://${SERVER_IP}"
else
  FRONTEND_ORIGIN="http://${SERVER_IP}:${PORT_HTTP}"
  ALLOWED_ORIGINS_LIST="http://localhost:${PORT_HTTP},http://127.0.0.1:${PORT_HTTP},${FRONTEND_ORIGIN}"
fi

log_info "Diretório de instalação: $INSTALL_DIR"
cd "$INSTALL_DIR"

# =============================================================================
# 1. Atualizar sistema e instalar dependências
# =============================================================================
log_info "Atualizando sistema e instalando dependências..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl git build-essential software-properties-common

# =============================================================================
# 2. Node.js 20.x (NodeSource)
# =============================================================================
if ! command -v node &>/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]; then
  log_info "Instalando Node.js $NODE_VERSION.x..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y -qq nodejs
fi
log_info "Node $(node -v) | npm $(npm -v)"

# =============================================================================
# 3. PostgreSQL
# =============================================================================
if ! command -v psql &>/dev/null; then
  log_info "Instalando PostgreSQL..."
  apt-get install -y -qq postgresql postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
fi

log_info "Configurando banco de dados PostgreSQL..."
EXISTS=$(sudo -u postgres psql -q -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER';" 2>/dev/null || true)
if [ "$EXISTS" != "1" ]; then
  sudo -u postgres psql -q -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS' CREATEDB;"
else
  sudo -u postgres psql -q -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
fi
EXISTS_DB=$(sudo -u postgres psql -q -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>/dev/null || true)
if [ "$EXISTS_DB" != "1" ]; then
  sudo -u postgres psql -q -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
fi
log_info "Banco '$DB_NAME' e usuário '$DB_USER' configurados."

# =============================================================================
# 4. PM2 e serve (global)
# =============================================================================
log_info "Instalando PM2 e serve globalmente..."
npm install -g pm2 serve --silent 2>/dev/null || true

# =============================================================================
# 5. Backend (meu-chatbot-backend)
# =============================================================================
BACKEND_DIR="$INSTALL_DIR/meu-chatbot-backend"
if [ ! -d "$BACKEND_DIR" ]; then
  log_error "Pasta não encontrada: $BACKEND_DIR"
  exit 1
fi

log_info "Configurando backend..."
cd "$BACKEND_DIR"

# Gerar JWT secrets se não existirem
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
JWT_REFRESH="${JWT_REFRESH_SECRET:-$(openssl rand -hex 32)}"

cat > .env << EOF
NODE_ENV=production
PORT=$PORT_BACKEND

DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=$DB_PASS
DB_TIMEZONE=-03:00

JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

ALLOWED_ORIGINS=$ALLOWED_ORIGINS_LIST

WHATSAPP_API_URL=http://127.0.0.1:$PORT_API
WHATSAPP_API_TOKEN=$WHATSAPP_API_TOKEN
EOF

npm install --silent
# Corrigir permissão de execução (arquivos vindos do Windows podem perder +x)
chmod -R u+x "$BACKEND_DIR/node_modules/.bin" 2>/dev/null || true
log_info "Executando migrações do banco..."
node "$BACKEND_DIR/node_modules/sequelize-cli/lib/sequelize" db:migrate --env production
log_info "Executando seed (usuário admin)..."
node "$BACKEND_DIR/node_modules/sequelize-cli/lib/sequelize" db:seed:all --env production 2>/dev/null || true

# =============================================================================
# 6. API WhatsApp (dev-connect-ai-wa) - não interrompe se npm falhar
# =============================================================================
API_DIR="$INSTALL_DIR/dev-connect-ai-wa"
if [ -d "$API_DIR" ]; then
  log_info "Instalando dependências da API WhatsApp (Baileys)..."
  cd "$API_DIR"
  npm install --silent 2>&1 || { log_warn "API WhatsApp: npm install falhou (conexão WhatsApp pode não funcionar). Continuando..."; true; }
  mkdir -p db media
else
  log_warn "Pasta dev-connect-ai-wa não encontrada; pulando API WhatsApp."
fi

# =============================================================================
# 7. Frontend (build e serve) - não interrompe se npm/build falhar
# =============================================================================
FRONTEND_DIR="$INSTALL_DIR/dev-connect-ai-wa/frontend"
if [ -d "$FRONTEND_DIR" ]; then
  log_info "Configurando frontend..."
  cd "$FRONTEND_DIR"
  echo "REACT_APP_BACKEND_URL=$BACKEND_PUBLIC_URL" > .env
  npm install --silent 2>&1 || { log_warn "Frontend: npm install falhou. Continuando..."; true; }
  log_info "Gerando build do frontend (pode demorar)..."
  npm run build 2>&1 || { log_warn "Frontend: build falhou. Continuando..."; true; }
else
  log_warn "Pasta frontend não encontrada; pulando build."
fi

# =============================================================================
# 8. PM2 - iniciar aplicações
# =============================================================================
log_info "Configurando PM2..."

cd "$INSTALL_DIR"
pm2 delete all 2>/dev/null || true

# Backend
pm2 start "$BACKEND_DIR/src/server.js" --name "meu-chatbot-backend" --cwd "$BACKEND_DIR" || true

# API WhatsApp
if [ -d "$API_DIR" ]; then
  pm2 start "$API_DIR/src/server.js" --name "whatsapp-api" --cwd "$API_DIR" || { log_warn "PM2: whatsapp-api não iniciado."; true; }
fi

# Frontend (porta 80)
if [ -d "$FRONTEND_DIR/build" ]; then
  pm2 serve "$FRONTEND_DIR/build" "$PORT_HTTP" --name "meu-chatbot-frontend" --spa || true
else
  log_warn "Pasta build do frontend não existe; frontend não será servido na porta $PORT_HTTP."
fi

pm2 save || true
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# =============================================================================
# 9. Firewall (opcional)
# =============================================================================
if command -v ufw &>/dev/null && ufw status 2>/dev/null | grep -q "Status: active"; then
  log_info "Liberando portas no firewall: $PORT_HTTP, $PORT_BACKEND"
  ufw allow "$PORT_HTTP"/tcp
  ufw allow "$PORT_BACKEND"/tcp
  ufw allow 22/tcp
  ufw --force reload 2>/dev/null || true
fi

# Salvar senha do banco para referência (opcional)
echo "DB_USER=$DB_USER" > "$INSTALL_DIR/.install-db-info.txt"
echo "DB_PASS=$DB_PASS" >> "$INSTALL_DIR/.install-db-info.txt"
echo "DB_NAME=$DB_NAME" >> "$INSTALL_DIR/.install-db-info.txt"
chmod 600 "$INSTALL_DIR/.install-db-info.txt" 2>/dev/null || true

# =============================================================================
# Fim - mensagem de sucesso
# =============================================================================
URL_ACESSO="http://${SERVER_IP}"
[ "$PORT_HTTP" != "80" ] && URL_ACESSO="http://${SERVER_IP}:${PORT_HTTP}"

echo
echo "============================================================================="
echo -e "${GREEN}  INSTALAÇÃO CONCLUÍDA COM SUCESSO${NC}"
echo "============================================================================="
echo
echo "  Acesse o sistema em:"
echo ""
echo "    $URL_ACESSO"
echo ""
echo "  Login padrão:"
echo "    E-mail: admin@meuchatbot.com"
echo "    Senha:  admin123"
echo ""
echo "  (Recomendado alterar a senha após o primeiro acesso.)"
echo ""
echo "  Comandos úteis: pm2 status | pm2 logs | pm2 restart all"
echo "============================================================================="
echo

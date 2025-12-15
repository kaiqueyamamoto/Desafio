#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Inicializando projeto da API...${NC}\n"

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
  exit 1
fi

# 1. Verificar se pnpm está instalado
echo -e "${YELLOW}📦 Verificando pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
  echo -e "${RED}❌ pnpm não está instalado. Instalando...${NC}"
  npm install -g pnpm
else
  echo -e "${GREEN}✅ pnpm encontrado${NC}"
fi

# 2. Instalar dependências
echo -e "\n${YELLOW}📦 Instalando dependências...${NC}"
pnpm install
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Erro ao instalar dependências${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# 3. Verificar/criar arquivo .env
echo -e "\n${YELLOW}⚙️  Verificando arquivo .env...${NC}"
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}📝 Criando arquivo .env a partir do env.example...${NC}"
  cp env.example .env
  
  # Atualizar senha padrão do MySQL baseado no docker-compose
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's/DB_PASSWORD=your_password/DB_PASSWORD=root/' .env
    sed -i '' 's/JWT_SECRET=your_super_secret_jwt_key_change_in_production/JWT_SECRET=dev_secret_key_change_in_production/' .env
  else
    # Linux
    sed -i 's/DB_PASSWORD=your_password/DB_PASSWORD=root/' .env
    sed -i 's/JWT_SECRET=your_super_secret_jwt_key_change_in_production/JWT_SECRET=dev_secret_key_change_in_production/' .env
  fi
  
  echo -e "${GREEN}✅ Arquivo .env criado${NC}"
  echo -e "${YELLOW}⚠️  Por favor, revise o arquivo .env e ajuste as configurações se necessário${NC}"
else
  echo -e "${GREEN}✅ Arquivo .env já existe${NC}"
fi

# 4. Verificar se Docker está instalado e rodando
echo -e "\n${YELLOW}🐳 Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
  echo -e "${RED}❌ Docker não está instalado. Por favor, instale o Docker primeiro${NC}"
  exit 1
fi

if ! docker info &> /dev/null; then
  echo -e "${RED}❌ Docker não está rodando. Por favor, inicie o Docker${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Docker está rodando${NC}"

# 5. Iniciar banco de dados
echo -e "\n${YELLOW}🗄️  Iniciando banco de dados MySQL...${NC}"
docker-compose up -d mysql

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Erro ao iniciar o banco de dados${NC}"
  exit 1
fi

# 6. Aguardar banco estar pronto
echo -e "${YELLOW}⏳ Aguardando banco de dados estar pronto...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if docker exec desafio-database mysqladmin ping -h localhost --silent &> /dev/null; then
    echo -e "${GREEN}✅ Banco de dados está pronto${NC}"
    break
  fi
  
  ATTEMPT=$((ATTEMPT + 1))
  echo -n "."
  sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo -e "\n${RED}❌ Timeout: Banco de dados não está respondendo${NC}"
  exit 1
fi

# 7. Verificar se o schema foi aplicado
echo -e "\n${YELLOW}📋 Verificando schema do banco de dados...${NC}"
sleep 3

# Verificar se as tabelas existem
TABLES=$(docker exec desafio-database mysql -uroot -proot -e "USE task_manager; SHOW TABLES;" 2>/dev/null | grep -E "(users|tasks)" | wc -l)

if [ "$TABLES" -lt 2 ]; then
  echo -e "${YELLOW}⚠️  Tabelas não encontradas. Aplicando schema...${NC}"
  docker exec -i desafio-database mysql -uroot -proot < database/schema.sql 2>/dev/null
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema aplicado com sucesso${NC}"
  else
    echo -e "${YELLOW}⚠️  Schema pode já estar aplicado ou houve um erro. Continuando...${NC}"
  fi
else
  echo -e "${GREEN}✅ Schema já está aplicado${NC}"
fi

# 8. Resumo final
echo -e "\n${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Inicialização concluída com sucesso!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}📝 Próximos passos:${NC}"
echo -e "   1. Revise o arquivo .env se necessário"
echo -e "   2. Execute ${YELLOW}pnpm dev${NC} para iniciar o servidor de desenvolvimento"
echo -e "   3. Acesse ${YELLOW}http://localhost:3001/api${NC} para ver a documentação Swagger\n"

echo -e "${BLUE}📚 Comandos úteis:${NC}"
echo -e "   - Iniciar API: ${YELLOW}pnpm dev${NC}"
echo -e "   - Parar banco: ${YELLOW}docker-compose down${NC}"
echo -e "   - Ver logs do banco: ${YELLOW}docker-compose logs mysql${NC}\n"

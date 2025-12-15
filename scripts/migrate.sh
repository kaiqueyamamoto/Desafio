#!/bin/bash

# Script de migração do banco de dados
# Este script executa as migrações do Prisma

set -e

echo "🔄 Executando migrações do banco de dados..."

# Verificar se o Prisma está instalado
if ! command -v prisma &> /dev/null; then
    echo "❌ Prisma CLI não encontrado. Instalando dependências..."
    pnpm install
fi

# Gerar Prisma Client
echo "📦 Gerando Prisma Client..."
pnpm prisma generate

# Executar migrações
echo "🚀 Executando migrações..."
if [ "$1" == "deploy" ]; then
    echo "📥 Modo deploy (produção)..."
    pnpm prisma migrate deploy
else
    echo "🔧 Modo desenvolvimento..."
    pnpm prisma migrate dev
fi

echo "✅ Migrações concluídas com sucesso!"

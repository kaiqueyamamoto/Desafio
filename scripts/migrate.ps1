# Script de migração do banco de dados (PowerShell)
# Este script executa as migrações do Prisma

$ErrorActionPreference = "Stop"

Write-Host "🔄 Executando migrações do banco de dados..." -ForegroundColor Cyan

# Verificar se o Prisma está instalado
if (-not (Get-Command prisma -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Prisma CLI não encontrado. Instalando dependências..." -ForegroundColor Yellow
    pnpm install
}

# Gerar Prisma Client
Write-Host "📦 Gerando Prisma Client..." -ForegroundColor Cyan
pnpm prisma generate

# Executar migrações
Write-Host "🚀 Executando migrações..." -ForegroundColor Cyan
if ($args[0] -eq "deploy") {
    Write-Host "📥 Modo deploy (produção)..." -ForegroundColor Green
    pnpm prisma migrate deploy
} else {
    Write-Host "🔧 Modo desenvolvimento..." -ForegroundColor Green
    pnpm prisma migrate dev
}

Write-Host "✅ Migrações concluídas com sucesso!" -ForegroundColor Green

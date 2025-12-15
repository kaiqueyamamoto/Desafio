# Scripts de Migração

Este diretório contém scripts auxiliares para gerenciar migrações do banco de dados.

## Scripts Disponíveis

### `migrate.sh` (Linux/macOS)

Script bash para executar migrações do Prisma.

**Uso:**
```bash
# Modo desenvolvimento (cria nova migração se necessário)
./scripts/migrate.sh

# Modo produção (aplica migrações existentes)
./scripts/migrate.sh deploy
```

### `migrate.ps1` (Windows)

Script PowerShell para executar migrações do Prisma.

**Uso:**
```powershell
# Modo desenvolvimento
.\scripts\migrate.ps1

# Modo produção
.\scripts\migrate.ps1 deploy
```

## Comandos NPM/Pnpm

Você também pode usar os comandos do package.json:

```bash
# Desenvolvimento
pnpm prisma:migrate

# Produção
pnpm prisma:migrate:deploy

# Usando scripts
pnpm db:migrate
pnpm db:migrate:deploy
```

## O que os scripts fazem

1. Verificam se o Prisma CLI está instalado
2. Geram o Prisma Client (`prisma generate`)
3. Executam as migrações:
   - **Desenvolvimento**: `prisma migrate dev` - cria nova migração se houver mudanças
   - **Produção**: `prisma migrate deploy` - aplica migrações existentes

## Requisitos

- Node.js 18+
- pnpm instalado
- Banco de dados MySQL rodando
- Variável de ambiente `DATABASE_URL` configurada

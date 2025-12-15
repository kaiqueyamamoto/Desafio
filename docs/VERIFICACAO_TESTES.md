# Verificação de Cobertura de Testes

## 📊 Status Atual da Cobertura

**Cobertura Geral (Backend focado):** ❌ **44.41%** (Meta: 80%)

**Cobertura Geral (Tudo incluído):** ❌ **21.16%** (Meta: 80%)

```
---------------------------|---------|----------|---------|---------|
File                       | % Stmts | % Branch | % Funcs | % Lines |
---------------------------|---------|----------|---------|---------|
All files                  |   21.16 |    10.68 |    7.83 |   22.04 |
```

## ✅ Testes Implementados

### Testes de Autenticação (`tests/api/auth.test.ts`)
- ✅ Registro de usuário com sucesso
- ✅ Erro quando email já existe
- ✅ Erro quando dados são inválidos
- ✅ Login com sucesso
- ✅ Erro quando usuário não existe
- ✅ Erro quando senha é inválida
- ⚠️ Teste de token inválido (comentado/vazio)

**Cobertura das Rotas de Auth:**
- `POST /api/auth/register`: **81.81%** ✅
- `POST /api/auth/login`: **72.72%** ⚠️

### Testes de Tarefas (`tests/api/tasks.test.ts`)
- ✅ GET: Retornar todas as tarefas do usuário
- ✅ GET: Erro quando não autenticado
- ✅ GET: Isolamento de dados (apenas tarefas do usuário)
- ✅ POST: Criar nova tarefa
- ✅ POST: Erro quando dados são inválidos
- ✅ PUT: Atualizar tarefa existente
- ✅ PUT: Erro quando tarefa não existe
- ✅ PUT: Erro quando tarefa pertence a outro usuário
- ✅ DELETE: Deletar tarefa existente
- ✅ DELETE: Erro quando tarefa não existe
- ✅ DELETE: Erro quando tarefa pertence a outro usuário
- ✅ DELETE: Erro quando token é inválido

**Cobertura das Rotas de Tasks:**
- `GET /api/tasks`: **81.08%** ✅
- `POST /api/tasks`: **81.08%** ✅
- `PUT /api/tasks/[id]`: **75.86%** ⚠️
- `DELETE /api/tasks/[id]`: **75.86%** ⚠️

**Total de Testes:** 19 testes passando ✅

## ❌ Arquivos Sem Cobertura

### Rotas da API
- ❌ `src/app/api/swagger.json/route.ts`: **0%** (não testado)

### Middleware e Utilitários
- ❌ `src/middleware.ts`: **0%** (middleware do Next.js)
- ❌ `src/lib/middleware.ts`: **0%** (função authenticateRequest)
- ❌ `src/lib/db.ts`: **0%** (Prisma Client)
- ❌ `src/lib/cors.ts`: **70%** (parcialmente testado)
- ❌ `src/lib/swagger.config.ts`: **0%** (configuração Swagger)

### Funções de Autenticação
- ❌ `src/lib/auth.ts`: **57.69%** (parcialmente testado)
  - Funções não testadas: `validateTokenAndGetUser`, `verifyToken`, etc.

### Hooks e API Client
- ❌ `src/lib/api/auth.ts`: **0%** (funções de chamada à API)
- ❌ `src/lib/api/tasks.ts`: **0%** (funções de chamada à API)
- ❌ `src/lib/hooks/use-auth.ts`: **0%** (hooks React)
- ❌ `src/lib/hooks/use-tasks.ts`: **0%** (hooks React)
- ❌ `src/lib/hooks/use-theme.ts`: **0%** (hook de tema)

### Componentes Frontend
- ❌ Todos os componentes React: **0%** (não testados)
  - `src/components/auth/*`
  - `src/components/dashboard/*`
  - `src/components/KanbanBoard.tsx`

### Páginas
- ❌ `src/app/dashboard/page.tsx`: **0%**
- ❌ `src/app/login/page.tsx`: **0%**
- ❌ `src/app/register/page.tsx`: **0%**
- ❌ `src/app/api-docs/page.tsx`: **0%**

## 📋 Requisitos do README vs Implementação

### ✅ Requisitos Atendidos
- ✅ Testes de integração para endpoints da API
- ✅ Testar autenticação (registro, login)
- ⚠️ Testar token inválido (parcial - apenas em DELETE)
- ✅ Testar CRUD de tarefas (GET, POST, PUT, DELETE)
- ✅ Testar isolamento de dados entre usuários
- ✅ Usar Jest

### ❌ Requisitos Não Atendidos
- ❌ Cobertura mínima de **80%** (atual: 21.16%)
- ❌ Testes de componentes frontend
- ❌ Testes de hooks customizados
- ❌ Testes de funções utilitárias (auth.ts, middleware.ts)

## 🎯 Plano para Atingir 80% de Cobertura

### Prioridade 1: Backend (Foco nos Endpoints)
1. **Melhorar cobertura das rotas existentes**
   - Adicionar testes de edge cases
   - Testar todos os caminhos de erro
   - Melhorar cobertura de `PUT /api/tasks/[id]` (75.86% → 85%+)
   - Melhorar cobertura de `DELETE /api/tasks/[id]` (75.86% → 85%+)
   - Melhorar cobertura de `POST /api/auth/login` (72.72% → 85%+)

2. **Testar funções utilitárias críticas**
   - `src/lib/auth.ts`: Testar `validateTokenAndGetUser`, `verifyToken`, `generateToken`
   - `src/lib/middleware.ts`: Testar `authenticateRequest` isoladamente
   - `src/lib/db.ts`: Testar singleton do Prisma Client

3. **Testar rotas não cobertas**
   - `src/app/api/swagger.json/route.ts`: Testar geração de Swagger

### Prioridade 2: Frontend (Opcional mas Recomendado)
4. **Testes de componentes**
   - Componentes de autenticação (LoginForm, RegisterForm)
   - Componentes do dashboard (TaskCard, TaskList, etc.)
   - Usar React Testing Library

5. **Testes de hooks**
   - `use-auth.ts`: Testar login, logout, register
   - `use-tasks.ts`: Testar CRUD operations
   - `use-theme.ts`: Testar toggle de tema

### Prioridade 3: Integração
6. **Testes E2E** (Opcional)
   - Fluxo completo de autenticação
   - Fluxo completo de CRUD de tarefas

## 📝 Testes Faltantes Críticos

### 1. Testes de Autenticação
```typescript
// tests/api/auth.test.ts - Adicionar:
- Teste de token inválido no login
- Teste de token expirado
- Teste de validação de senha forte
- Teste de atualização de token_version
```

### 2. Testes de Tarefas
```typescript
// tests/api/tasks.test.ts - Adicionar:
- Teste de atualização parcial (apenas title, apenas status)
- Teste de criação com status customizado
- Teste de filtros e ordenação
- Teste de validação de status enum
```

### 3. Testes de Middleware
```typescript
// tests/lib/middleware.test.ts - Criar:
- Teste de authenticateRequest com token válido
- Teste de authenticateRequest com token inválido
- Teste de authenticateRequest sem token
- Teste de token_version mismatch
```

### 4. Testes de Auth Utils
```typescript
// tests/lib/auth.test.ts - Criar:
- Teste de generateToken
- Teste de verifyToken
- Teste de validateTokenAndGetUser
- Teste de hashPassword
- Teste de comparePassword
```

## 🔧 Configuração Recomendada

### Atualizar `jest.config.js` para focar em backend:
```javascript
collectCoverageFrom: [
  'src/app/api/**/*.{ts,tsx}',
  'src/lib/**/*.{ts,tsx}',
  '!src/lib/hooks/**', // Opcional: testar hooks separadamente
  '!src/**/*.d.ts',
  '!src/**/__tests__/**',
],
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  // Ou por diretório:
  'src/app/api/**/*.ts': {
    branches: 85,
    functions: 85,
    lines: 85,
    statements: 85,
  },
},
```

## 📊 Estimativa de Esforço

Para atingir **80% de cobertura**:

1. **Backend (Prioridade Alta)**: ~4-6 horas
   - Melhorar testes existentes: 1-2h
   - Testes de middleware: 1h
   - Testes de auth utils: 1-2h
   - Testes de edge cases: 1h

2. **Frontend (Opcional)**: ~6-8 horas
   - Setup React Testing Library: 1h
   - Testes de componentes: 4-5h
   - Testes de hooks: 1-2h

## ✅ Conclusão

**Status Atual:** ❌ **44.41% de cobertura (backend)** / **21.16% (geral)** (abaixo da meta de 80%)

**Cobertura das Rotas da API:**
- `POST /api/auth/register`: **81.81%** ✅ (acima de 80%)
- `POST /api/auth/login`: **72.72%** ⚠️ (abaixo de 80%)
- `GET /api/tasks`: **81.08%** ✅ (acima de 80%)
- `POST /api/tasks`: **81.08%** ✅ (acima de 80%)
- `PUT /api/tasks/[id]`: **75.86%** ⚠️ (abaixo de 80%)
- `DELETE /api/tasks/[id]`: **75.86%** ⚠️ (abaixo de 80%)

**Recomendações:**
1. **Foco imediato**: Melhorar cobertura do backend (rotas da API e utilitários)
2. **Meta realista**: Atingir 80%+ nas rotas da API primeiro
3. **Frontend**: Considerar testes de componentes como diferencial, não obrigatório para 80%

**Próximos Passos:**
1. Adicionar testes faltantes nas rotas existentes
2. Criar testes para `src/lib/auth.ts` e `src/lib/middleware.ts`
3. Adicionar testes de edge cases
4. Configurar `coverageThreshold` no Jest para garantir 80%

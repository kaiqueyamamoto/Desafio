# 📚 Documentação do Projeto - Sistema de Gestão de Tarefas

## 📋 Descrição do Projeto

Sistema completo de gestão de tarefas desenvolvido como desafio técnico para a Hubfy.ai. A aplicação permite que usuários se registrem, façam login e gerenciem suas tarefas pessoais através de uma interface web moderna e responsiva.

O projeto foi desenvolvido utilizando **Next.js 14+** com App Router, integrando frontend e backend em uma única aplicação full stack. O sistema implementa autenticação JWT, validação de dados com Zod, gerenciamento de estado com TanStack Query e utiliza Prisma ORM para interação com banco de dados MySQL.

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14.1.0** - Framework React com App Router
- **React 18.2.0** - Biblioteca para construção de interfaces
- **TypeScript 5.3.3** - Superset do JavaScript com tipagem estática
- **Tailwind CSS 3.4.0** - Framework CSS utilitário
- **DaisyUI 5.5.14** - Componentes para Tailwind CSS
- **React Hook Form 7.49.3** - Biblioteca para gerenciamento de formulários
- **TanStack Query 5.17.0** - Gerenciamento de estado do servidor e cache
- **Zod 3.22.4** - Validação de schemas TypeScript-first

### Backend
- **Next.js API Routes** - Endpoints RESTful integrados
- **Prisma 5.7.1** - ORM moderno para TypeScript
- **MySQL 8+** - Banco de dados relacional
- **bcryptjs 3.0.3** - Hash de senhas
- **jsonwebtoken 9.0.2** - Autenticação JWT

### Testes
- **Jest 29.7.0** - Framework de testes
- **React Testing Library 14.1.2** - Testes de componentes React
- **ts-jest 29.1.1** - Suporte TypeScript para Jest

### Ferramentas de Desenvolvimento
- **ESLint** - Linter para JavaScript/TypeScript
- **Prettier 3.2.0** - Formatador de código
- **TypeScript** - Compilador e verificador de tipos

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18.0.0 ou superior)
- **pnpm** (recomendado) ou **npm**
- **MySQL** (versão 8.0 ou superior)
- **Git** (para clonar o repositório)

### Verificando as Instalações

```bash
# Verificar versão do Node.js
node --version  # Deve ser >= 18.0.0

# Verificar versão do pnpm
pnpm --version

# Verificar versão do MySQL
mysql --version  # Deve ser >= 8.0
```

## 🚀 Instalação

### 1. Clonar o Repositório

```bash
git clone <url-do-repositório>
cd Desafio
```

### 2. Instalar Dependências

```bash
# Usando pnpm (recomendado)
pnpm install

# Ou usando npm
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Next.js
NODE_ENV=development
PORT=3000

# Database (Prisma)
DATABASE_URL="mysql://root:senha@localhost:3306/task_manager"

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h
```

**⚠️ Importante:**
- Substitua `root` e `senha` pelas suas credenciais do MySQL
- Altere `JWT_SECRET` para uma chave secreta forte em produção
- Nunca commite o arquivo `.env` com credenciais reais

### 4. Configurar o Banco de Dados

#### Opção 1: Usando Docker Compose (Recomendado)

```bash
# Iniciar MySQL via Docker
docker-compose up -d

# Aguardar alguns segundos para o MySQL inicializar
```

#### Opção 2: Usando MySQL Local

```bash
# Criar banco de dados e tabelas
mysql -u root -p < database/schema.sql
```

### 5. Gerar Prisma Client

```bash
pnpm prisma generate
```

### 6. Executar Migrações (se necessário)

```bash
# Executar migrações Prisma
pnpm prisma migrate dev

# Ou fazer push direto do schema (desenvolvimento)
pnpm db:push
```

## 🏃 Como Rodar o Projeto Localmente

### Modo Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em: `http://localhost:3000`

### Modo Produção

```bash
# Build da aplicação
pnpm build

# Iniciar servidor de produção
pnpm start
```

## 🧪 Como Rodar os Testes

### Executar Todos os Testes

```bash
pnpm test
```

### Executar Testes em Modo Watch

```bash
# Re-executa testes automaticamente ao salvar arquivos
pnpm test:watch
```

### Executar Testes com Cobertura

```bash
# Gera relatório de cobertura de testes
pnpm test:cov
```

### Executar Testes Específicos

```bash
# Testes de autenticação
pnpm test tests/api/auth.test.ts

# Testes de tarefas
pnpm test tests/api/tasks.test.ts

# Testes de componentes
pnpm test tests/components
```

## 📁 Estrutura de Pastas do Projeto

```
projeto/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   └── register/
│   │   │   │       └── route.ts
│   │   │   ├── tasks/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   └── swagger.json/
│   │   │       └── route.ts
│   │   ├── api-docs/           # Documentação Swagger
│   │   │   └── page.tsx
│   │   ├── dashboard/          # Página do dashboard
│   │   │   └── page.tsx
│   │   ├── login/              # Página de login
│   │   │   └── page.tsx
│   │   ├── register/           # Página de registro
│   │   │   └── page.tsx
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Página inicial
│   │   └── globals.css         # Estilos globais
│   ├── components/             # Componentes React
│   │   ├── auth/
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── MessageAlert.tsx
│   │   │   ├── StatusCounters.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskList.tsx
│   │   └── KanbanBoard.tsx
│   ├── lib/                    # Utilitários e lógica de negócio
│   │   ├── api/                # Funções de chamada à API
│   │   │   ├── auth.ts
│   │   │   └── tasks.ts
│   │   ├── hooks/              # Custom hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-tasks.ts
│   │   │   └── use-theme.ts
│   │   ├── providers/          # Providers React
│   │   │   └── query-provider.tsx
│   │   ├── schemas/            # Schemas Zod
│   │   │   └── auth.schema.ts
│   │   ├── auth.ts             # Funções de autenticação
│   │   ├── cors.ts             # Configuração CORS
│   │   ├── db.ts               # Prisma Client singleton
│   │   ├── middleware.ts       # Middleware de autenticação
│   │   └── swagger.config.ts   # Configuração Swagger
│   ├── middleware.ts           # Next.js middleware
│   └── types/                  # Tipos TypeScript
│       └── index.ts
├── tests/                      # Testes automatizados
│   ├── api/                    # Testes de API Routes
│   │   ├── auth.test.ts
│   │   └── tasks.test.ts
│   ├── components/             # Testes de componentes
│   │   ├── LoginForm.test.tsx
│   │   ├── RegisterForm.test.tsx
│   │   ├── TaskForm.test.tsx
│   │   └── ...
│   ├── flows/                  # Testes de fluxos
│   │   └── auth-flow.test.tsx
│   └── helpers/                # Utilitários de teste
│       └── test-utils.tsx
├── prisma/                     # Prisma ORM
│   └── schema.prisma           # Schema do banco de dados
├── database/                   # Scripts SQL
│   └── schema.sql              # Schema SQL de referência
├── docs/                       # Documentação
│   ├── README.md               # Este arquivo
│   ├── API.md                  # Documentação da API
│   ├── VERIFICACAO_FRONTEND.md
│   └── VERIFICACAO_TESTES.md
├── .env.example                # Template de variáveis de ambiente
├── .gitignore                  # Arquivos ignorados pelo Git
├── .prettierrc                 # Configuração Prettier
├── .eslintrc.json              # Configuração ESLint
├── docker-compose.yaml         # Configuração Docker
├── jest.config.js              # Configuração Jest
├── jest.setup.js               # Setup dos testes
├── next.config.js              # Configuração Next.js
├── package.json                # Dependências e scripts
├── tailwind.config.ts          # Configuração Tailwind CSS
├── tsconfig.json               # Configuração TypeScript
└── README.md                   # README principal do projeto
```

## 🎯 Decisões Técnicas Importantes

### 1. Arquitetura Full Stack com Next.js

**Decisão:** Utilizar Next.js 14+ com App Router para integrar frontend e backend em uma única aplicação.

**Motivos:**
- Simplifica o desenvolvimento e deploy
- Compartilhamento de tipos TypeScript entre frontend e backend
- API Routes integradas com App Router
- Server Components para melhor performance
- Deploy simplificado (uma única aplicação)

### 2. Prisma ORM

**Decisão:** Utilizar Prisma como ORM para interação com o banco de dados.

**Motivos:**
- Type-safe queries com autocompletar
- Migrations automáticas
- Geração automática de tipos TypeScript
- Melhor Developer Experience (DX)
- Suporte a múltiplos bancos de dados

### 3. Validação com Zod

**Decisão:** Utilizar Zod para validação de dados tanto no backend quanto no frontend.

**Motivos:**
- Validação TypeScript-first
- Schemas reutilizáveis entre frontend e backend
- Mensagens de erro claras e customizáveis
- Integração nativa com React Hook Form

### 4. React Hook Form

**Decisão:** Utilizar React Hook Form para gerenciamento de formulários.

**Motivos:**
- Performance otimizada (menos re-renders)
- Validação integrada com Zod
- Melhor UX (validação em tempo real)
- Menos código boilerplate

### 5. TanStack Query

**Decisão:** Utilizar TanStack Query para gerenciamento de estado do servidor.

**Motivos:**
- Cache automático de requisições
- Sincronização de estado do servidor
- Refetch automático
- Optimistic updates
- Melhor gerenciamento de loading/error states

### 6. Autenticação JWT

**Decisão:** Implementar autenticação baseada em JWT com token_version para invalidação.

**Motivos:**
- Stateless (não requer sessões no servidor)
- Escalável para múltiplos servidores
- token_version permite invalidar tokens quando necessário
- Padrão da indústria

### 7. Isolamento de Dados

**Decisão:** Garantir que usuários só possam acessar suas próprias tarefas.

**Motivos:**
- Segurança e privacidade dos dados
- Validação em todas as operações de tarefas
- Middleware de autenticação em todas as rotas protegidas

### 8. Estrutura em Camadas

**Decisão:** Separar responsabilidades em camadas (API Routes, Services, ORM).

**Motivos:**
- Código mais organizado e manutenível
- Facilita testes unitários
- Reutilização de lógica de negócio
- Separação de concerns

## 🔒 Segurança

### Implementações de Segurança

1. **Hash de Senhas:** Todas as senhas são hasheadas com bcrypt (salt rounds: 10) antes de serem armazenadas
2. **JWT com Expiração:** Tokens JWT têm expiração configurável (padrão: 24h) e token_version para invalidação
3. **Validação de Entrada:** Todos os inputs são validados com Zod (backend e frontend)
4. **SQL Injection Protection:** Uso de Prisma ORM previne SQL injection
5. **Isolamento de Dados:** Usuários só podem acessar suas próprias tarefas
6. **Variáveis de Ambiente:** Credenciais sensíveis armazenadas em `.env`
7. **CORS:** Configuração CORS para permitir apenas origens autorizadas

## 🚀 Melhorias Futuras

### Funcionalidades Planejadas

1. **Sistema de Refresh Token**
   - Implementar refresh tokens para melhorar segurança
   - Rotação automática de tokens

2. **Paginação**
   - Adicionar paginação na listagem de tarefas
   - Melhorar performance com grandes volumes de dados

3. **Busca e Filtros Avançados**
   - Busca por texto nas tarefas
   - Filtros combinados (status, data, etc.)
   - Ordenação customizável

4. **Notificações**
   - Notificações em tempo real
   - Lembretes de tarefas

5. **Colaboração**
   - Compartilhamento de tarefas entre usuários
   - Comentários em tarefas

6. **Testes E2E**
   - Implementar testes end-to-end com Playwright ou Cypress
   - Aumentar cobertura de testes acima de 80%

7. **CI/CD**
   - Configurar GitHub Actions para CI/CD
   - Deploy automático

8. **Documentação Interativa**
   - Melhorar documentação Swagger
   - Adicionar exemplos de uso

9. **Performance**
   - Implementar cache de requisições
   - Otimização de imagens e assets
   - Code splitting avançado

10. **Acessibilidade**
    - Melhorar acessibilidade (WCAG 2.1)
    - Suporte a leitores de tela
    - Navegação por teclado

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento
pnpm build            # Build de produção
pnpm start            # Inicia servidor de produção

# Testes
pnpm test             # Executa todos os testes
pnpm test:watch       # Executa testes em modo watch
pnpm test:cov         # Executa testes com cobertura

# Qualidade de Código
pnpm lint             # Executa ESLint
pnpm format           # Formata código com Prettier

# Prisma
pnpm prisma:generate  # Gera Prisma Client
pnpm prisma:migrate   # Executa migrações
pnpm prisma:studio    # Abre Prisma Studio
pnpm db:push          # Push do schema (desenvolvimento)
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Erro de Conexão com Banco de Dados

```bash
# Verificar se MySQL está rodando
docker-compose ps

# Verificar variável DATABASE_URL no .env
# Formato correto: mysql://usuario:senha@host:porta/database
```

#### Erro ao Gerar Prisma Client

```bash
# Limpar e regenerar
rm -rf node_modules/.prisma
pnpm prisma generate
```

#### Erro de Porta em Uso

```bash
# Alterar porta no .env ou matar processo
# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

#### Testes Falhando

```bash
# Limpar cache do Jest
pnpm test --clearCache

# Verificar variáveis de ambiente de teste
```

## 📚 Recursos Adicionais

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação React Hook Form](https://react-hook-form.com/)
- [Documentação TanStack Query](https://tanstack.com/query/latest)
- [Documentação Zod](https://zod.dev/)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [JWT.io](https://jwt.io/)

## 📄 Licença

Este projeto foi desenvolvido como desafio técnico para a Hubfy.ai.


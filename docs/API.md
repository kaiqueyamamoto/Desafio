# 📡 Documentação da API

API RESTful para o sistema de gestão de tarefas desenvolvida com Next.js 14+ API Routes.

**Base URL**: `http://localhost:3000/api`

## 🔐 Autenticação

A maioria dos endpoints requer autenticação via JWT. Inclua o token no header:

```
Authorization: Bearer {token}
```

O token JWT é obtido através do endpoint `/api/auth/login` e deve ser incluído em todas as requisições para endpoints protegidos.

---

## 📋 Endpoints

### Autenticação

#### POST /api/auth/register

Registra um novo usuário no sistema.

**URL:** `/api/auth/register`

**Método:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "Senha123!@#"
}
```

**Validações:**
- `name`: obrigatório, string, mínimo 2 caracteres
- `email`: obrigatório, formato de email válido, único no sistema
- `password`: obrigatório, mínimo 8 caracteres, deve conter:
  - Pelo menos uma letra maiúscula
  - Pelo menos uma letra minúscula
  - Pelo menos um número
  - Pelo menos um caractere especial

**Resposta de Sucesso (201):**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

**Resposta de Erro (400) - Dados Inválidos:**
```json
{
  "error": "Dados inválidos",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    },
    {
      "field": "password",
      "message": "Senha deve ter no mínimo 8 caracteres"
    }
  ]
}
```

**Resposta de Erro (409) - Email Já em Uso:**
```json
{
  "error": "Email já está em uso"
}
```

**Resposta de Erro (500) - Erro Interno:**
```json
{
  "error": "Erro ao criar usuário"
}
```

**Exemplo de Requisição (curl):**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password": "Senha123!@#"
  }'
```

---

#### POST /api/auth/login

Autentica um usuário e retorna um token JWT.

**URL:** `/api/auth/login`

**Método:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "joao@exemplo.com",
  "password": "Senha123!@#"
}
```

**Validações:**
- `email`: obrigatório, formato de email válido
- `password`: obrigatório, string não vazia

**Resposta de Sucesso (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiam9hb0BleGVtcGxvLmNvbSIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzA1MzIxNjAwLCJleHAiOjE3MDU0MDgwMDB9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

**Resposta de Erro (400) - Dados Inválidos:**
```json
{
  "error": "Dados inválidos",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

**Resposta de Erro (401) - Credenciais Inválidas:**
```json
{
  "error": "Email ou senha inválidos"
}
```

**Resposta de Erro (500) - Erro Interno:**
```json
{
  "error": "Erro ao fazer login"
}
```

**Exemplo de Requisição (curl):**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "Senha123!@#"
  }'
```

---

### Tarefas

Todos os endpoints de tarefas requerem autenticação JWT. O token deve ser incluído no header `Authorization`.

#### GET /api/tasks

Lista todas as tarefas do usuário autenticado.

**URL:** `/api/tasks`

**Método:** `GET`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parâmetros:**
Nenhum

**Resposta de Sucesso (200):**
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Implementar autenticação",
      "description": "Implementar sistema de autenticação JWT",
      "status": "PENDING",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "title": "Criar documentação da API",
      "description": "Documentar todos os endpoints da API",
      "status": "IN_PROGRESS",
      "created_at": "2024-01-15T11:00:00.000Z",
      "updated_at": "2024-01-15T11:30:00.000Z"
    }
  ]
}
```

**Resposta de Erro (401) - Token Não Fornecido:**
```json
{
  "error": "Token não fornecido"
}
```

**Resposta de Erro (401) - Token Inválido:**
```json
{
  "error": "Token inválido ou expirado"
}
```

**Resposta de Erro (500) - Erro Interno:**
```json
{
  "error": "Erro ao buscar tarefas"
}
```

**Exemplo de Requisição (curl):**
```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Notas:**
- As tarefas são retornadas ordenadas por data de criação (mais recentes primeiro)
- Apenas tarefas do usuário autenticado são retornadas (isolamento de dados)

---

#### POST /api/tasks

Cria uma nova tarefa para o usuário autenticado.

**URL:** `/api/tasks`

**Método:** `POST`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Implementar autenticação",
  "description": "Implementar sistema de autenticação JWT",
  "status": "PENDING"
}
```

**Validações:**
- `title`: obrigatório, string não vazia
- `description`: opcional, string
- `status`: opcional, enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`). Se não fornecido, padrão é `PENDING`

**Resposta de Sucesso (201):**
```json
{
  "task": {
    "id": 1,
    "user_id": 1,
    "title": "Implementar autenticação",
    "description": "Implementar sistema de autenticação JWT",
    "status": "PENDING",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (400) - Dados Inválidos:**
```json
{
  "error": "Dados inválidos",
  "details": [
    {
      "field": "title",
      "message": "Título é obrigatório"
    }
  ]
}
```

**Resposta de Erro (401) - Token Não Fornecido:**
```json
{
  "error": "Token não fornecido"
}
```

**Resposta de Erro (500) - Erro Interno:**
```json
{
  "error": "Erro ao criar tarefa"
}
```

**Exemplo de Requisição (curl):**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implementar autenticação",
    "description": "Implementar sistema de autenticação JWT",
    "status": "PENDING"
  }'
```

---

#### PUT /api/tasks/:id

Atualiza uma tarefa existente. Apenas o dono da tarefa pode atualizá-la.

**URL:** `/api/tasks/:id`

**Método:** `PUT`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parâmetros:**
- `id` (path): ID da tarefa a ser atualizada (integer)

**Body:**
```json
{
  "title": "Tarefa atualizada",
  "description": "Nova descrição",
  "status": "IN_PROGRESS"
}
```

**Validações:**
- Todos os campos são opcionais
- `title`: se fornecido, deve ser string não vazia
- `description`: se fornecido, deve ser string
- `status`: se fornecido, deve ser enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`)

**Resposta de Sucesso (200):**
```json
{
  "task": {
    "id": 1,
    "user_id": 1,
    "title": "Tarefa atualizada",
    "description": "Nova descrição",
    "status": "IN_PROGRESS",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**Resposta de Erro (400) - ID Inválido:**
```json
{
  "error": "ID da tarefa inválido"
}
```

**Resposta de Erro (400) - Dados Inválidos:**
```json
{
  "error": "Dados inválidos",
  "details": [
    {
      "field": "title",
      "message": "Título é obrigatório"
    }
  ]
}
```

**Resposta de Erro (401) - Token Não Fornecido:**
```json
{
  "error": "Token não fornecido"
}
```

**Resposta de Erro (403) - Sem Permissão:**
```json
{
  "error": "Você não tem permissão para acessar esta tarefa"
}
```

**Resposta de Erro (404) - Tarefa Não Encontrada:**
```json
{
  "error": "Tarefa não encontrada"
}
```

**Resposta de Erro (500) - Erro Interno:**
```json
{
  "error": "Erro ao atualizar tarefa"
}
```

**Exemplo de Requisição (curl):**
```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tarefa atualizada",
    "description": "Nova descrição",
    "status": "IN_PROGRESS"
  }'
```

**Notas:**
- Apenas o dono da tarefa pode atualizá-la
- Campos não fornecidos não serão alterados
- O campo `updated_at` é atualizado automaticamente

---

#### DELETE /api/tasks/:id

Deleta uma tarefa. Apenas o dono da tarefa pode deletá-la.

**URL:** `/api/tasks/:id`

**Método:** `DELETE`

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros:**
- `id` (path): ID da tarefa a ser deletada (integer)

**Resposta de Sucesso (200):**
```json
{
  "message": "Tarefa deletada com sucesso"
}
```

**Resposta de Erro (400) - ID Inválido:**
```json
{
  "error": "ID da tarefa inválido"
}
```

**Resposta de Erro (401) - Token Não Fornecido:**
```json
{
  "error": "Token não fornecido"
}
```

**Resposta de Erro (403) - Sem Permissão:**
```json
{
  "error": "Você não tem permissão para acessar esta tarefa"
}
```

**Resposta de Erro (404) - Tarefa Não Encontrada:**
```json
{
  "error": "Tarefa não encontrada"
}
```

**Resposta de Erro (500) - Erro Interno:**
```json
{
  "error": "Erro ao deletar tarefa"
}
```

**Exemplo de Requisição (curl):**
```bash
curl -X DELETE http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Notas:**
- Apenas o dono da tarefa pode deletá-la
- A operação é irreversível

---

## 📊 Códigos de Status HTTP

| Código | Descrição | Quando Ocorre |
|--------|-----------|---------------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos na requisição |
| 401 | Unauthorized | Token ausente, inválido ou expirado |
| 403 | Forbidden | Sem permissão para acessar o recurso |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: email já cadastrado) |
| 500 | Internal Server Error | Erro interno do servidor |

---

## 🔒 Segurança

### Implementações de Segurança

1. **Hash de Senhas:** Todas as senhas são hasheadas com bcrypt (salt rounds: 10) antes de serem armazenadas
2. **JWT com Expiração:** Tokens JWT têm expiração configurável (padrão: 24h) e token_version para invalidação
3. **Validação de Entrada:** Todos os inputs são validados com Zod (backend e frontend)
4. **SQL Injection Protection:** Uso de Prisma ORM previne SQL injection
5. **Isolamento de Dados:** Usuários só podem acessar suas próprias tarefas
6. **CORS:** Configuração CORS para permitir apenas origens autorizadas

### Validação de Token

O token JWT é validado em todas as requisições para endpoints protegidos. O token deve:
- Estar presente no header `Authorization` no formato `Bearer {token}`
- Ser válido e não expirado
- Ter um `token_version` correspondente ao do usuário no banco de dados

### Isolamento de Dados

Todas as operações de tarefas verificam se a tarefa pertence ao usuário autenticado:
- `GET /api/tasks`: Retorna apenas tarefas do usuário autenticado
- `PUT /api/tasks/:id`: Verifica se a tarefa pertence ao usuário antes de atualizar
- `DELETE /api/tasks/:id`: Verifica se a tarefa pertence ao usuário antes de deletar

---

## 📝 Exemplos de Uso

### Exemplo Completo: Criar Usuário e Tarefa

```bash
# 1. Registrar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password": "Senha123!@#"
  }'

# Resposta:
# {
#   "message": "Usuário criado com sucesso",
#   "user": { "id": 1, "name": "João Silva", "email": "joao@exemplo.com" }
# }

# 2. Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "Senha123!@#"
  }'

# Resposta:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { "id": 1, "name": "João Silva", "email": "joao@exemplo.com" }
# }

# 3. Criar tarefa (usar token retornado no passo 2)
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implementar autenticação",
    "description": "Implementar sistema de autenticação JWT",
    "status": "PENDING"
  }'

# Resposta:
# {
#   "task": {
#     "id": 1,
#     "user_id": 1,
#     "title": "Implementar autenticação",
#     "description": "Implementar sistema de autenticação JWT",
#     "status": "PENDING",
#     "created_at": "2024-01-15T10:30:00.000Z",
#     "updated_at": "2024-01-15T10:30:00.000Z"
#   }
# }

# 4. Listar tarefas
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Resposta:
# {
#   "tasks": [
#     {
#       "id": 1,
#       "user_id": 1,
#       "title": "Implementar autenticação",
#       "description": "Implementar sistema de autenticação JWT",
#       "status": "PENDING",
#       "created_at": "2024-01-15T10:30:00.000Z",
#       "updated_at": "2024-01-15T10:30:00.000Z"
#     }
#   ]
# }

# 5. Atualizar tarefa
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'

# 6. Deletar tarefa
curl -X DELETE http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔄 Tipos de Dados

### TaskStatus Enum

Os valores possíveis para o campo `status` de uma tarefa são:

- `PENDING` - Tarefa pendente
- `IN_PROGRESS` - Tarefa em progresso
- `COMPLETED` - Tarefa concluída

### Estrutura de Tarefa

```typescript
interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}
```

### Estrutura de Usuário

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}
```

---

## 🌐 CORS

A API está configurada para aceitar requisições de origens específicas. Em desenvolvimento, a API aceita requisições de `http://localhost:3000`.

Para produção, configure as origens permitidas através das variáveis de ambiente.

---

## 📚 Recursos Adicionais

- **Documentação Swagger:** Acesse `/api-docs` para documentação interativa da API
- **Schema Prisma:** Veja `prisma/schema.prisma` para estrutura do banco de dados
- **Testes:** Veja `tests/api/` para exemplos de uso da API

---

**Última atualização:** Janeiro 2024

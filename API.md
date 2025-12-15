# 📡 Documentação da API

API RESTful para o sistema de gestão de tarefas desenvolvida com NestJS.

**Base URL**: `http://localhost:3001`

## 🔐 Autenticação

A maioria dos endpoints requer autenticação via JWT. Inclua o token no header:

```
Authorization: Bearer {token}
```

---

## 📋 Endpoints

### Autenticação

#### POST /auth/register

Registra um novo usuário no sistema.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senhaSegura123"
}
```

**Validações:**
- `name`: obrigatório, string
- `email`: obrigatório, formato de email válido, único
- `password`: obrigatório, mínimo 8 caracteres

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

**Resposta de Erro (400):**
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than or equal to 8 characters"],
  "error": "Bad Request"
}
```

**Resposta de Erro (409):**
```json
{
  "statusCode": 409,
  "message": "Email já está em uso",
  "error": "Conflict"
}
```

---

#### POST /auth/login

Autentica um usuário e retorna um token JWT.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "joao@exemplo.com",
  "password": "senhaSegura123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

**Resposta de Erro (401):**
```json
{
  "statusCode": 401,
  "message": "Email ou senha inválidos",
  "error": "Unauthorized"
}
```

---

### Tarefas

Todos os endpoints de tarefas requerem autenticação JWT.

#### GET /tasks

Lista todas as tarefas do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Tarefa exemplo",
      "description": "Descrição da tarefa",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Resposta de Erro (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

#### POST /tasks

Cria uma nova tarefa para o usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Nova tarefa",
  "description": "Descrição da nova tarefa",
  "status": "pending"
}
```

**Validações:**
- `title`: obrigatório, string
- `description`: opcional, string
- `status`: opcional, enum: `pending`, `in_progress`, `completed` (padrão: `pending`)

**Resposta de Sucesso (201):**
```json
{
  "task": {
    "id": 1,
    "user_id": 1,
    "title": "Nova tarefa",
    "description": "Descrição da nova tarefa",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (400):**
```json
{
  "statusCode": 400,
  "message": ["title should not be empty"],
  "error": "Bad Request"
}
```

---

#### PUT /tasks/:id

Atualiza uma tarefa existente. Apenas o dono da tarefa pode atualizá-la.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parâmetros:**
- `id` (path): ID da tarefa

**Body:**
```json
{
  "title": "Tarefa atualizada",
  "description": "Nova descrição",
  "status": "in_progress"
}
```

**Validações:**
- Todos os campos são opcionais
- `status`: enum: `pending`, `in_progress`, `completed`

**Resposta de Sucesso (200):**
```json
{
  "task": {
    "id": 1,
    "user_id": 1,
    "title": "Tarefa atualizada",
    "description": "Nova descrição",
    "status": "in_progress",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**Resposta de Erro (404):**
```json
{
  "statusCode": 404,
  "message": "Tarefa não encontrada",
  "error": "Not Found"
}
```

**Resposta de Erro (403):**
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para acessar esta tarefa",
  "error": "Forbidden"
}
```

---

#### DELETE /tasks/:id

Deleta uma tarefa. Apenas o dono da tarefa pode deletá-la.

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros:**
- `id` (path): ID da tarefa

**Resposta de Sucesso (200):**
```json
{
  "message": "Tarefa deletada com sucesso"
}
```

**Resposta de Erro (404):**
```json
{
  "statusCode": 404,
  "message": "Tarefa não encontrada",
  "error": "Not Found"
}
```

**Resposta de Erro (403):**
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para acessar esta tarefa",
  "error": "Forbidden"
}
```

---

## 📊 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token ausente ou inválido |
| 403 | Forbidden - Sem permissão para acessar o recurso |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email já cadastrado) |
| 500 | Internal Server Error - Erro interno do servidor |

---

## 🔒 Segurança

- Todas as senhas são hasheadas com bcrypt antes de serem armazenadas
- Tokens JWT têm expiração configurável (padrão: 24h)
- Validação de entrada em todos os endpoints
- Isolamento de dados: usuários só acessam suas próprias tarefas
- CORS configurado para permitir apenas o frontend autorizado

---

## 📝 Exemplos de Uso

### Exemplo completo: Criar usuário e tarefa

```bash
# 1. Registrar usuário
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password": "senhaSegura123"
  }'

# 2. Fazer login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "senhaSegura123"
  }'

# 3. Criar tarefa (usar token retornado no login)
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "title": "Minha primeira tarefa",
    "description": "Descrição da tarefa",
    "status": "pending"
  }'

# 4. Listar tarefas
curl -X GET http://localhost:3001/tasks \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

**Nota**: Esta documentação será atualizada conforme a implementação avança.


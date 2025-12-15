# 🏗️ Arquitetura da API - Separação de Responsabilidades

Este documento descreve a arquitetura em camadas implementada na API do projeto, seguindo as boas práticas de separação de responsabilidades.

## 📁 Estrutura de Pastas

```
src/
├── app/
│   └── api/                    # Routes (pontos de entrada HTTP)
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── refresh/route.ts
│       └── tasks/
│           ├── route.ts
│           └── [id]/route.ts
├── lib/
│   ├── controllers/            # Controllers (orquestração HTTP)
│   │   ├── auth.controller.ts
│   │   └── task.controller.ts
│   └── services/              # Services (lógica de negócio)
│       ├── auth.service.ts
│       └── task.service.ts
```

## 🎯 Camadas da Arquitetura

### 1. Routes (`src/app/api/`)
**Responsabilidade:** Ponto de entrada HTTP, apenas delegação para controllers

**Características:**
- Apenas recebe requisições HTTP
- Delega para controllers
- Mantém documentação Swagger
- Trata CORS (OPTIONS)

**Exemplo:**
```typescript
// src/app/api/auth/login/route.ts
import { authController } from '@/lib/controllers/auth.controller';

export async function POST(request: NextRequest) {
  return authController.login(request);
}
```

---

### 2. Controllers (`src/lib/controllers/`)
**Responsabilidade:** Orquestração de requisições HTTP, validação, tratamento de erros

**Características:**
- Recebe requisições HTTP (NextRequest)
- Valida dados de entrada com Zod
- Chama services para lógica de negócio
- Trata erros e retorna respostas HTTP apropriadas
- Não contém lógica de negócio

**Exemplo:**
```typescript
// src/lib/controllers/auth.controller.ts
export class AuthController {
  async login(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = loginSchema.parse(body); // Validação
      const result = await authService.login(validatedData); // Chama service
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      // Tratamento de erros HTTP
    }
  }
}
```

---

### 3. Services (`src/lib/services/`)
**Responsabilidade:** Lógica de negócio pura, sem conhecimento de HTTP

**Características:**
- Contém toda a lógica de negócio
- Não conhece HTTP (não usa NextRequest/NextResponse)
- Pode chamar outros services ou libs (auth, db)
- Retorna dados puros (não respostas HTTP)
- Pode lançar erros de negócio

**Exemplo:**
```typescript
// src/lib/services/task.service.ts
export class TaskService {
  async listTasks(params: TaskQueryParams): Promise<TaskListResult> {
    // Lógica de negócio: filtros, paginação, ordenação
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({ where, orderBy, skip, take }),
      prisma.task.count({ where }),
    ]);
    return { tasks, pagination: {...} };
  }
}
```

---

## 🔄 Fluxo de uma Requisição

```
1. Cliente faz requisição HTTP
   ↓
2. Route recebe requisição (src/app/api/*/route.ts)
   ↓
3. Route delega para Controller
   ↓
4. Controller valida dados (Zod)
   ↓
5. Controller chama Service
   ↓
6. Service executa lógica de negócio
   ↓
7. Service retorna dados
   ↓
8. Controller formata resposta HTTP
   ↓
9. Route retorna resposta ao cliente
```

---

## 📋 Exemplo Completo: Criar Tarefa

### Route (`src/app/api/tasks/route.ts`)
```typescript
export async function POST(request: NextRequest) {
  return taskController.create(request);
}
```

### Controller (`src/lib/controllers/task.controller.ts`)
```typescript
async create(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;
  const body = await request.json();
  const validatedData = createTaskSchema.parse(body);

  const task = await taskService.createTask(user.userId, validatedData);
  return NextResponse.json({ task }, { status: 201 });
}
```

### Service (`src/lib/services/task.service.ts`)
```typescript
async createTask(userId: number, data: CreateTaskDto) {
  const task = await prisma.task.create({
    data: {
      user_id: userId,
      title: data.title,
      description: data.description || null,
      status: data.status || TaskStatus.PENDING,
    },
  });
  return task;
}
```

---

## ✅ Benefícios da Arquitetura

1. **Separação de Responsabilidades**
   - Cada camada tem uma responsabilidade clara
   - Fácil de entender e manter

2. **Testabilidade**
   - Services podem ser testados sem HTTP
   - Controllers podem ser testados isoladamente
   - Routes são simples e fáceis de testar

3. **Reutilização**
   - Services podem ser reutilizados em diferentes contextos
   - Lógica de negócio não está acoplada a HTTP

4. **Manutenibilidade**
   - Mudanças em uma camada não afetam outras
   - Código mais organizado e legível

5. **Escalabilidade**
   - Fácil adicionar novos endpoints
   - Fácil adicionar novos services

---

## 📝 Convenções

### Nomenclatura
- **Routes**: `route.ts` (padrão Next.js)
- **Controllers**: `*.controller.ts` (ex: `auth.controller.ts`)
- **Services**: `*.service.ts` (ex: `task.service.ts`)

### Classes vs Instâncias
- Controllers e Services são classes exportadas como instâncias singleton
- Exemplo: `export const authController = new AuthController();`

### Tratamento de Erros
- **Services**: Lançam erros de negócio (ex: `throw new Error('Tarefa não encontrada')`)
- **Controllers**: Capturam erros e retornam respostas HTTP apropriadas
- **Routes**: Apenas delegam (não tratam erros)

---

## 🔍 Verificação

Para verificar se a arquitetura está sendo seguida:

1. **Routes** devem ter apenas:
   - Import do controller
   - Chamada ao método do controller
   - Documentação Swagger (opcional)

2. **Controllers** devem:
   - Validar dados de entrada
   - Chamar services
   - Tratar erros HTTP
   - Retornar NextResponse

3. **Services** devem:
   - Conter lógica de negócio
   - Não conhecer HTTP
   - Retornar dados puros

---

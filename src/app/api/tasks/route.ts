import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { TaskStatus } from '@/types';
import { z } from 'zod';
import { addCorsHeaders, createCorsResponse } from '@/lib/cors';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Lista todas as tarefas do usuário autenticado
 *     description: Retorna uma lista de todas as tarefas pertencentes ao usuário autenticado, ordenadas por data de criação (mais recentes primeiro).
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tarefas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TasksResponse'
 *             example:
 *               tasks:
 *                 - id: 1
 *                   user_id: 1
 *                   title: "Implementar autenticação"
 *                   description: "Implementar sistema de autenticação JWT"
 *                   status: "PENDING"
 *                   created_at: "2024-01-15T10:30:00.000Z"
 *                   updated_at: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Token não fornecido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao buscar tarefas"
 */
export async function OPTIONS() {
  return createCorsResponse();
}

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return addCorsHeaders(authResult);
  }

  const { user } = authResult;

  try {
    const tasks = await prisma.task.findMany({
      where: { user_id: user.userId },
      orderBy: { created_at: 'desc' },
    });

    const response = NextResponse.json({ tasks }, { status: 200 });
    return addCorsHeaders(response);
  } catch (error) {
    const response = NextResponse.json(
      { error: 'Erro ao buscar tarefas' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Cria uma nova tarefa para o usuário autenticado
 *     description: Cria uma nova tarefa associada ao usuário autenticado. O status padrão é PENDING se não especificado.
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *           examples:
 *             exemplo1:
 *               value:
 *                 title: "Implementar autenticação"
 *                 description: "Implementar sistema de autenticação JWT"
 *                 status: "PENDING"
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *             example:
 *               task:
 *                 id: 1
 *                 user_id: 1
 *                 title: "Implementar autenticação"
 *                 description: "Implementar sistema de autenticação JWT"
 *                 status: "PENDING"
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *                 updated_at: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Dados inválidos"
 *               details:
 *                 - field: "title"
 *                   message: "Título é obrigatório"
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Token não fornecido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao criar tarefa"
 */
export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return addCorsHeaders(authResult);
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const { title, description, status } = validatedData;

    const task = await prisma.task.create({
      data: {
        user_id: user.userId,
        title,
        description: description || null,
        status: (status as TaskStatus) || TaskStatus.PENDING,
      },
    });

    const response = NextResponse.json({ task }, { status: 201 });
    return addCorsHeaders(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const response = NextResponse.json(
      { error: 'Erro ao criar tarefa' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

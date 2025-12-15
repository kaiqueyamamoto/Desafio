import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { TaskStatus } from '@/types';
import { z } from 'zod';
import { addCorsHeaders, createCorsResponse } from '@/lib/cors';

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Atualiza uma tarefa existente
 *     description: Atualiza uma tarefa existente. Apenas o dono da tarefa pode atualizá-la. Todos os campos são opcionais.
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa a ser atualizada
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *           examples:
 *             exemplo1:
 *               value:
 *                 title: "Tarefa atualizada"
 *                 description: "Nova descrição"
 *                 status: "IN_PROGRESS"
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *             example:
 *               task:
 *                 id: 1
 *                 user_id: 1
 *                 title: "Tarefa atualizada"
 *                 description: "Nova descrição"
 *                 status: "IN_PROGRESS"
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *                 updated_at: "2024-01-15T11:00:00.000Z"
 *       400:
 *         description: ID inválido ou dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "ID da tarefa inválido"
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Token não fornecido"
 *       403:
 *         description: Usuário não tem permissão para acessar esta tarefa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Você não tem permissão para acessar esta tarefa"
 *       404:
 *         description: Tarefa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Tarefa não encontrada"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao atualizar tarefa"
 */
export async function OPTIONS() {
  return createCorsResponse();
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return addCorsHeaders(authResult);
  }

  const { user } = authResult;
  const taskId = parseInt(params.id);

  if (isNaN(taskId)) {
    const response = NextResponse.json(
      { error: 'ID da tarefa inválido' },
      { status: 400 }
    );
    return addCorsHeaders(response);
  }

  try {
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      const response = NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    if (task.user_id !== user.userId) {
      const response = NextResponse.json(
        { error: 'Você não tem permissão para acessar esta tarefa' },
        { status: 403 }
      );
      return addCorsHeaders(response);
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.status !== undefined && { status: validatedData.status }),
      },
    });

    const response = NextResponse.json({ task: updatedTask }, { status: 200 });
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
      { error: 'Erro ao atualizar tarefa' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Deleta uma tarefa
 *     description: Deleta uma tarefa existente. Apenas o dono da tarefa pode deletá-la.
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa a ser deletada
 *         example: 1
 *     responses:
 *       200:
 *         description: Tarefa deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteTaskResponse'
 *             example:
 *               message: "Tarefa deletada com sucesso"
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "ID da tarefa inválido"
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Token não fornecido"
 *       403:
 *         description: Usuário não tem permissão para acessar esta tarefa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Você não tem permissão para acessar esta tarefa"
 *       404:
 *         description: Tarefa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Tarefa não encontrada"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao deletar tarefa"
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return addCorsHeaders(authResult);
  }

  const { user } = authResult;
  const taskId = parseInt(params.id);

  if (isNaN(taskId)) {
    const response = NextResponse.json(
      { error: 'ID da tarefa inválido' },
      { status: 400 }
    );
    return addCorsHeaders(response);
  }

  try {
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      const response = NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    if (task.user_id !== user.userId) {
      const response = NextResponse.json(
        { error: 'Você não tem permissão para acessar esta tarefa' },
        { status: 403 }
      );
      return addCorsHeaders(response);
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    const response = NextResponse.json(
      { message: 'Tarefa deletada com sucesso' },
      { status: 200 }
    );
    return addCorsHeaders(response);
  } catch (error) {
    const response = NextResponse.json(
      { error: 'Erro ao deletar tarefa' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

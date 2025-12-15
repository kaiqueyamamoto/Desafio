import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/lib/middleware';
import { taskService, TaskQueryParams } from '@/lib/services/task.service';
import { TaskStatus } from '@/types';
import { addCorsHeaders } from '@/lib/cors';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

/**
 * Controller de Tarefas
 * Orquestra requisições HTTP relacionadas às tarefas
 */
export class TaskController {
  /**
   * Lista tarefas do usuário autenticado
   */
  async list(request: NextRequest): Promise<NextResponse> {
    const authResult = await authenticateRequest(request);

    if (authResult instanceof NextResponse) {
      return addCorsHeaders(authResult);
    }

    const { user } = authResult;

    try {
      // Obter parâmetros de query
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const search = searchParams.get('search') || '';
      const status = searchParams.get('status') as TaskStatus | null;
      const sortBy = searchParams.get('sortBy') || 'created_at';
      const sortOrder = searchParams.get('sortOrder') || 'desc';

      const params: TaskQueryParams = {
        userId: user.userId,
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      // Chamar service
      const result = await taskService.listTasks(params);

      const response = NextResponse.json(result, { status: 200 });
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
   * Cria uma nova tarefa
   */
  async create(request: NextRequest): Promise<NextResponse> {
    const authResult = await authenticateRequest(request);

    if (authResult instanceof NextResponse) {
      return addCorsHeaders(authResult);
    }

    const { user } = authResult;

    try {
      const body = await request.json();
      const validatedData = createTaskSchema.parse(body);

      // Chamar service
      const task = await taskService.createTask(user.userId, validatedData);

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

  /**
   * Atualiza uma tarefa existente
   */
  async update(
    request: NextRequest,
    taskId: number
  ): Promise<NextResponse> {
    const authResult = await authenticateRequest(request);

    if (authResult instanceof NextResponse) {
      return addCorsHeaders(authResult);
    }

    const { user } = authResult;

    // Validar ID
    if (isNaN(taskId)) {
      const response = NextResponse.json(
        { error: 'ID da tarefa inválido' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    try {
      const body = await request.json();
      const validatedData = updateTaskSchema.parse(body);

      // Chamar service
      const updatedTask = await taskService.updateTask(taskId, user.userId, validatedData);

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

      if (error instanceof Error) {
        if (error.message === 'Tarefa não encontrada') {
          const response = NextResponse.json(
            { error: error.message },
            { status: 404 }
          );
          return addCorsHeaders(response);
        }

        if (error.message === 'Você não tem permissão para acessar esta tarefa') {
          const response = NextResponse.json(
            { error: error.message },
            { status: 403 }
          );
          return addCorsHeaders(response);
        }
      }

      const response = NextResponse.json(
        { error: 'Erro ao atualizar tarefa' },
        { status: 500 }
      );
      return addCorsHeaders(response);
    }
  }

  /**
   * Deleta uma tarefa
   */
  async delete(
    request: NextRequest,
    taskId: number
  ): Promise<NextResponse> {
    const authResult = await authenticateRequest(request);

    if (authResult instanceof NextResponse) {
      return addCorsHeaders(authResult);
    }

    const { user } = authResult;

    // Validar ID
    if (isNaN(taskId)) {
      const response = NextResponse.json(
        { error: 'ID da tarefa inválido' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    try {
      // Chamar service
      await taskService.deleteTask(taskId, user.userId);

      const response = NextResponse.json(
        { message: 'Tarefa deletada com sucesso' },
        { status: 200 }
      );
      return addCorsHeaders(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Tarefa não encontrada') {
          const response = NextResponse.json(
            { error: error.message },
            { status: 404 }
          );
          return addCorsHeaders(response);
        }

        if (error.message === 'Você não tem permissão para acessar esta tarefa') {
          const response = NextResponse.json(
            { error: error.message },
            { status: 403 }
          );
          return addCorsHeaders(response);
        }
      }

      const response = NextResponse.json(
        { error: 'Erro ao deletar tarefa' },
        { status: 500 }
      );
      return addCorsHeaders(response);
    }
  }
}

export const taskController = new TaskController();

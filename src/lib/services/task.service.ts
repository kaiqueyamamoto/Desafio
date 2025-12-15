import { prisma } from '@/lib/db';
import { TaskStatus, CreateTaskDto, UpdateTaskDto } from '@/types';

export interface TaskQueryParams {
  userId: number;
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskListResult {
  tasks: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Service de Tarefas
 * Contém a lógica de negócio relacionada às tarefas
 */
export class TaskService {
  /**
   * Lista tarefas do usuário com filtros e paginação
   */
  async listTasks(params: TaskQueryParams): Promise<TaskListResult> {
    const {
      userId,
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    // Validar parâmetros
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Máximo de 100 itens por página
    const skip = (validPage - 1) * validLimit;

    // Construir filtros
    const where: any = {
      user_id: userId,
    };

    // Filtro de status
    if (status && Object.values(TaskStatus).includes(status)) {
      where.status = status;
    }

    // Filtro de busca (busca em título e descrição)
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Construir ordenação
    const orderBy: any = {};
    const validSortBy = ['created_at', 'updated_at', 'title', 'status'].includes(sortBy)
      ? sortBy
      : 'created_at';
    const validSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
    orderBy[validSortBy] = validSortOrder;

    // Buscar tarefas com paginação
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: validLimit,
      }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / validLimit);

    return {
      tasks,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      },
    };
  }

  /**
   * Cria uma nova tarefa
   */
  async createTask(userId: number, data: CreateTaskDto) {
    const task = await prisma.task.create({
      data: {
        user_id: userId,
        title: data.title,
        description: data.description || null,
        status: (data.status as TaskStatus) || TaskStatus.PENDING,
      },
    });

    return task;
  }

  /**
   * Busca uma tarefa por ID
   */
  async findTaskById(taskId: number) {
    return await prisma.task.findUnique({
      where: { id: taskId },
    });
  }

  /**
   * Verifica se a tarefa pertence ao usuário
   */
  async verifyTaskOwnership(taskId: number, userId: number): Promise<boolean> {
    const task = await this.findTaskById(taskId);
    return task?.user_id === userId;
  }

  /**
   * Atualiza uma tarefa
   */
  async updateTask(taskId: number, userId: number, data: UpdateTaskDto) {
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await this.findTaskById(taskId);

    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    if (task.user_id !== userId) {
      throw new Error('Você não tem permissão para acessar esta tarefa');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    return updatedTask;
  }

  /**
   * Deleta uma tarefa
   */
  async deleteTask(taskId: number, userId: number) {
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await this.findTaskById(taskId);

    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    if (task.user_id !== userId) {
      throw new Error('Você não tem permissão para acessar esta tarefa');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });
  }
}

export const taskService = new TaskService();

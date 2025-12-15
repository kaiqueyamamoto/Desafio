/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/tasks/route';
import { PUT, DELETE } from '@/app/api/tasks/[id]/route';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { TaskStatus } from '@/types';

jest.mock('@/lib/db', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@/lib/middleware', () => ({
  authenticateRequest: jest.fn(),
}));

import { authenticateRequest } from '@/lib/middleware';

describe('Tasks API Routes', () => {
  const mockUser = {
    userId: 1,
    email: 'joao@example.com',
    name: 'João Silva',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset para retornar usuário autenticado por padrão
    (authenticateRequest as jest.Mock).mockResolvedValue({ user: mockUser });
  });

  describe('GET /api/tasks', () => {
    it('deve retornar todas as tarefas do usuário', async () => {
      const mockTasks = [
        {
          id: 1,
          user_id: 1,
          title: 'Tarefa 1',
          description: 'Descrição 1',
          status: TaskStatus.PENDING,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          user_id: 1,
          title: 'Tarefa 2',
          description: 'Descrição 2',
          status: TaskStatus.IN_PROGRESS,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'GET',
        headers: {
          authorization: 'Bearer token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(2);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { user_id: 1 },
        orderBy: { created_at: 'desc' },
      });
    });

    it('deve retornar erro quando não autenticado', async () => {
      (authenticateRequest as jest.Mock).mockResolvedValue(
        NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
      );

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'GET',
      });

      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('deve retornar apenas tarefas do usuário autenticado (isolamento)', async () => {
      const mockTasks = [
        {
          id: 1,
          user_id: 1, // Usuário autenticado
          title: 'Tarefa do usuário 1',
          description: 'Descrição',
          status: TaskStatus.PENDING,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          user_id: 1, // Usuário autenticado
          title: 'Outra tarefa do usuário 1',
          description: 'Descrição',
          status: TaskStatus.PENDING,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'GET',
        headers: {
          authorization: 'Bearer token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(2);
      // Verificar que todas as tarefas pertencem ao usuário autenticado
      data.tasks.forEach((task: any) => {
        expect(task.user_id).toBe(1);
      });
      // Verificar que o filtro foi aplicado corretamente
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { user_id: 1 },
        orderBy: { created_at: 'desc' },
      });
    });

    it('deve retornar tarefas com paginação', async () => {
      const mockTasks = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        user_id: 1,
        title: `Tarefa ${i + 1}`,
        description: 'Descrição',
        status: TaskStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.task.count as jest.Mock).mockResolvedValue(15);

      const request = new NextRequest('http://localhost:3000/api/tasks?page=1&limit=5', {
        method: 'GET',
        headers: {
          authorization: 'Bearer token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(5);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 5,
        total: 15,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false,
      });
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 5,
        })
      );
    });

    it('deve filtrar tarefas por status', async () => {
      const mockTasks = [
        {
          id: 1,
          user_id: 1,
          title: 'Tarefa Pendente',
          description: 'Descrição',
          status: TaskStatus.PENDING,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.task.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/tasks?status=PENDING', {
        method: 'GET',
        headers: {
          authorization: 'Bearer token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(1);
      expect(data.tasks[0].status).toBe(TaskStatus.PENDING);
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: TaskStatus.PENDING,
          }),
        })
      );
    });

    it('deve buscar tarefas por texto', async () => {
      const mockTasks = [
        {
          id: 1,
          user_id: 1,
          title: 'Tarefa de Busca',
          description: 'Descrição da busca',
          status: TaskStatus.PENDING,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.task.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/tasks?search=Busca', {
        method: 'GET',
        headers: {
          authorization: 'Bearer token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(1);
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                title: expect.objectContaining({
                  contains: 'Busca',
                }),
              }),
              expect.objectContaining({
                description: expect.objectContaining({
                  contains: 'Busca',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('deve ordenar tarefas por diferentes campos', async () => {
      const mockTasks = [
        {
          id: 1,
          user_id: 1,
          title: 'A Tarefa',
          description: 'Descrição',
          status: TaskStatus.PENDING,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.task.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/tasks?sortBy=title&sortOrder=asc', {
        method: 'GET',
        headers: {
          authorization: 'Bearer token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            title: 'asc',
          },
        })
      );
    });
  });

  describe('POST /api/tasks', () => {
    it('deve criar uma nova tarefa', async () => {
      const mockTask = {
        id: 1,
        user_id: 1,
        title: 'Nova Tarefa',
        description: 'Descrição da tarefa',
        status: TaskStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          authorization: 'Bearer token',
        },
        body: JSON.stringify({
          title: 'Nova Tarefa',
          description: 'Descrição da tarefa',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.task.id).toBe(mockTask.id);
      expect(data.task.title).toBe(mockTask.title);
      expect(data.task.description).toBe(mockTask.description);
      expect(data.task.status).toBe(mockTask.status);
      expect(data.task.user_id).toBe(mockTask.user_id);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          user_id: 1,
          title: 'Nova Tarefa',
          description: 'Descrição da tarefa',
          status: TaskStatus.PENDING,
        },
      });
    });

    it('deve retornar erro quando dados são inválidos', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          authorization: 'Bearer token',
        },
        body: JSON.stringify({
          title: '',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados inválidos');
    });
  });

  describe('PUT /api/tasks/[id]', () => {
    it('deve atualizar uma tarefa existente', async () => {
      const existingTask = {
        id: 1,
        user_id: 1,
        title: 'Tarefa Original',
        description: 'Descrição original',
        status: TaskStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedTask = {
        ...existingTask,
        title: 'Tarefa Atualizada',
        status: TaskStatus.COMPLETED,
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(existingTask);
      (prisma.task.update as jest.Mock).mockResolvedValue(updatedTask);

      const request = new NextRequest('http://localhost:3000/api/tasks/1', {
        method: 'PUT',
        headers: {
          authorization: 'Bearer token',
        },
        body: JSON.stringify({
          title: 'Tarefa Atualizada',
          status: TaskStatus.COMPLETED,
        }),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.task.title).toBe('Tarefa Atualizada');
      expect(data.task.status).toBe(TaskStatus.COMPLETED);
    });

    it('deve retornar erro quando tarefa não existe', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/tasks/999', {
        method: 'PUT',
        headers: {
          authorization: 'Bearer token',
        },
        body: JSON.stringify({
          title: 'Tarefa Atualizada',
        }),
      });

      const response = await PUT(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Tarefa não encontrada');
    });

    it('deve retornar erro quando tarefa pertence a outro usuário', async () => {
      const existingTask = {
        id: 1,
        user_id: 2, // Pertence a outro usuário
        title: 'Tarefa Original',
        description: 'Descrição original',
        status: TaskStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(existingTask);

      const request = new NextRequest('http://localhost:3000/api/tasks/1', {
        method: 'PUT',
        headers: {
          authorization: 'Bearer token',
        },
        body: JSON.stringify({
          title: 'Tarefa Atualizada',
        }),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Você não tem permissão para acessar esta tarefa');
    });
  });

  describe('DELETE /api/tasks/[id]', () => {
    it('deve deletar uma tarefa existente', async () => {
      const existingTask = {
        id: 1,
        user_id: 1,
        title: 'Tarefa para deletar',
        description: 'Descrição',
        status: TaskStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(existingTask);
      (prisma.task.delete as jest.Mock).mockResolvedValue(existingTask);

      const request = new NextRequest('http://localhost:3000/api/tasks/1', {
        method: 'DELETE',
        headers: {
          authorization: 'Bearer token',
        },
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Tarefa deletada com sucesso');
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('deve retornar erro quando tarefa não existe', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/tasks/999', {
        method: 'DELETE',
        headers: {
          authorization: 'Bearer token',
        },
      });

      const response = await DELETE(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Tarefa não encontrada');
    });

    it('deve retornar erro quando tarefa pertence a outro usuário', async () => {
      const existingTask = {
        id: 1,
        user_id: 2, // Pertence a outro usuário
        title: 'Tarefa para deletar',
        description: 'Descrição',
        status: TaskStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(existingTask);

      const request = new NextRequest('http://localhost:3000/api/tasks/1', {
        method: 'DELETE',
        headers: {
          authorization: 'Bearer token',
        },
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Você não tem permissão para acessar esta tarefa');
    });

    it('deve retornar erro quando token é inválido', async () => {
      const errorResponse = NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
      (authenticateRequest as jest.Mock).mockResolvedValueOnce(errorResponse);

      const request = new NextRequest('http://localhost:3000/api/tasks/1', {
        method: 'DELETE',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      const response = await DELETE(request, { params: { id: '1' } });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Token inválido');
    });
  });
});

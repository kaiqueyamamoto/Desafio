import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: 'DATABASE_CONNECTION',
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar todas as tarefas do usuário', async () => {
      const userId = 1;
      const mockTasks = [
        {
          id: 1,
          user_id: 1,
          title: 'Tarefa 1',
          description: 'Descrição 1',
          status: 'pending',
          created_at: new Date('2024-01-01'),
        },
        {
          id: 2,
          user_id: 1,
          title: 'Tarefa 2',
          description: 'Descrição 2',
          status: 'in_progress',
          created_at: new Date('2024-01-02'),
        },
      ];

      mockDb.execute.mockResolvedValueOnce([mockTasks]); // db.execute retorna [rows, fields]

      const result = await service.findAll(userId);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
      );
      expect(result).toEqual({ tasks: mockTasks });
    });

    it('deve retornar array vazio quando usuário não tem tarefas', async () => {
      const userId = 1;

      mockDb.execute.mockResolvedValueOnce([[]]);

      const result = await service.findAll(userId);

      expect(result).toEqual({ tasks: [] });
    });
  });

  describe('create', () => {
    it('deve criar uma nova tarefa com todos os campos', async () => {
      const userId = 1;
      const createTaskDto: CreateTaskDto = {
        title: 'Nova Tarefa',
        description: 'Descrição da tarefa',
        status: 'pending',
      };

      const mockInsertResult = { insertId: 1 };
      const mockTask = {
        id: 1,
        user_id: userId,
        title: 'Nova Tarefa',
        description: 'Descrição da tarefa',
        status: 'pending',
        created_at: new Date(),
      };

      mockDb.execute
        .mockResolvedValueOnce([mockInsertResult]) // INSERT retorna [result, fields]
        .mockResolvedValueOnce([[mockTask]]); // SELECT retorna [rows, fields]

      const result = await service.create(userId, createTaskDto);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
        [userId, createTaskDto.title, createTaskDto.description, 'pending'],
      );
      expect(mockDb.execute).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE id = ?',
        [mockInsertResult.insertId],
      );
      expect(result).toEqual({ task: mockTask });
    });

    it('deve criar uma tarefa sem descrição e status (valores padrão)', async () => {
      const userId = 1;
      const createTaskDto: CreateTaskDto = {
        title: 'Nova Tarefa',
      };

      const mockInsertResult = { insertId: 1 };
      const mockTask = {
        id: 1,
        user_id: userId,
        title: 'Nova Tarefa',
        description: null,
        status: 'pending',
        created_at: new Date(),
      };

      mockDb.execute
        .mockResolvedValueOnce([mockInsertResult]) // INSERT retorna [result, fields]
        .mockResolvedValueOnce([[mockTask]]); // SELECT retorna [rows, fields]

      const result = await service.create(userId, createTaskDto);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
        [userId, createTaskDto.title, null, 'pending'],
      );
      expect(result).toEqual({ task: mockTask });
    });
  });

  describe('update', () => {
    it('deve atualizar uma tarefa existente', async () => {
      const userId = 1;
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = {
        title: 'Tarefa Atualizada',
        status: 'completed',
      };

      const mockExistingTask = {
        id: 1,
        user_id: userId,
        title: 'Tarefa Original',
        description: 'Descrição original',
        status: 'pending',
        created_at: new Date(),
      };

      const mockUpdatedTask = {
        ...mockExistingTask,
        title: 'Tarefa Atualizada',
        status: 'completed',
      };

      mockDb.execute
        .mockResolvedValueOnce([[mockExistingTask]]) // SELECT retorna [rows, fields]
        .mockResolvedValueOnce([[]]) // UPDATE retorna [result, fields]
        .mockResolvedValueOnce([[mockUpdatedTask]]); // SELECT retorna [rows, fields]

      const result = await service.update(userId, taskId, updateTaskDto);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE id = ?',
        [taskId],
      );
      expect(mockDb.execute).toHaveBeenCalledWith(
        'UPDATE tasks SET title = ?, status = ? WHERE id = ?',
        [updateTaskDto.title, updateTaskDto.status, taskId],
      );
      expect(result).toEqual({ task: mockUpdatedTask });
    });

    it('deve atualizar apenas o título', async () => {
      const userId = 1;
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = {
        title: 'Tarefa Atualizada',
      };

      const mockExistingTask = {
        id: 1,
        user_id: userId,
        title: 'Tarefa Original',
        description: 'Descrição original',
        status: 'pending',
        created_at: new Date(),
      };

      const mockUpdatedTask = {
        ...mockExistingTask,
        title: 'Tarefa Atualizada',
      };

      mockDb.execute
        .mockResolvedValueOnce([[mockExistingTask]]) // SELECT retorna [rows, fields]
        .mockResolvedValueOnce([[]]) // UPDATE retorna [result, fields]
        .mockResolvedValueOnce([[mockUpdatedTask]]); // SELECT retorna [rows, fields]

      const result = await service.update(userId, taskId, updateTaskDto);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'UPDATE tasks SET title = ? WHERE id = ?',
        [updateTaskDto.title, taskId],
      );
      expect(result).toEqual({ task: mockUpdatedTask });
    });

    it('deve retornar tarefa original quando nenhum campo é fornecido', async () => {
      const userId = 1;
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = {};

      const mockExistingTask = {
        id: 1,
        user_id: userId,
        title: 'Tarefa Original',
        description: 'Descrição original',
        status: 'pending',
        created_at: new Date(),
      };

      mockDb.execute.mockResolvedValueOnce([[mockExistingTask]]);

      const result = await service.update(userId, taskId, updateTaskDto);

      expect(mockDb.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ task: mockExistingTask });
    });

    it('deve lançar NotFoundException quando tarefa não existe', async () => {
      const userId = 1;
      const taskId = 999;
      const updateTaskDto: UpdateTaskDto = {
        title: 'Tarefa Atualizada',
      };

      mockDb.execute.mockResolvedValueOnce([[]]);

      await expect(
        service.update(userId, taskId, updateTaskDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(userId, taskId, updateTaskDto),
      ).rejects.toThrow('Tarefa não encontrada');
    });

    it('deve lançar ForbiddenException quando tarefa pertence a outro usuário', async () => {
      const userId = 1;
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = {
        title: 'Tarefa Atualizada',
      };

      const mockExistingTask = {
        id: 1,
        user_id: 2, // Pertence a outro usuário
        title: 'Tarefa Original',
        description: 'Descrição original',
        status: 'pending',
        created_at: new Date(),
      };

      mockDb.execute.mockResolvedValueOnce([[mockExistingTask]]);

      await expect(
        service.update(userId, taskId, updateTaskDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update(userId, taskId, updateTaskDto),
      ).rejects.toThrow('Você não tem permissão para acessar esta tarefa');
    });
  });

  describe('remove', () => {
    it('deve deletar uma tarefa existente', async () => {
      const userId = 1;
      const taskId = 1;

      const mockExistingTask = {
        id: 1,
        user_id: userId,
        title: 'Tarefa para deletar',
        description: 'Descrição',
        status: 'pending',
        created_at: new Date(),
      };

      mockDb.execute
        .mockResolvedValueOnce([[mockExistingTask]]) // SELECT retorna [rows, fields]
        .mockResolvedValueOnce([[]]); // DELETE retorna [result, fields]

      const result = await service.remove(userId, taskId);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE id = ?',
        [taskId],
      );
      expect(mockDb.execute).toHaveBeenCalledWith(
        'DELETE FROM tasks WHERE id = ?',
        [taskId],
      );
      expect(result).toEqual({ message: 'Tarefa deletada com sucesso' });
    });

    it('deve lançar NotFoundException quando tarefa não existe', async () => {
      const userId = 1;
      const taskId = 999;

      mockDb.execute.mockResolvedValueOnce([[]]);

      await expect(service.remove(userId, taskId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove(userId, taskId)).rejects.toThrow(
        'Tarefa não encontrada',
      );
    });

    it('deve lançar ForbiddenException quando tarefa pertence a outro usuário', async () => {
      const userId = 1;
      const taskId = 1;

      const mockExistingTask = {
        id: 1,
        user_id: 2, // Pertence a outro usuário
        title: 'Tarefa para deletar',
        description: 'Descrição',
        status: 'pending',
        created_at: new Date(),
      };

      mockDb.execute.mockResolvedValueOnce([[mockExistingTask]]);

      await expect(service.remove(userId, taskId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.remove(userId, taskId)).rejects.toThrow(
        'Você não tem permissão para acessar esta tarefa',
      );
    });
  });
});

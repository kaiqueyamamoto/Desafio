import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTasksService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      userId: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar todas as tarefas do usuário', async () => {
      const expectedResult = {
        tasks: [
          {
            id: 1,
            user_id: 1,
            title: 'Tarefa 1',
            description: 'Descrição 1',
            status: 'pending',
            created_at: new Date(),
          },
          {
            id: 2,
            user_id: 1,
            title: 'Tarefa 2',
            description: 'Descrição 2',
            status: 'in_progress',
            created_at: new Date(),
          },
        ],
      };

      mockTasksService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(mockRequest.user.userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create', () => {
    it('deve criar uma nova tarefa', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Nova Tarefa',
        description: 'Descrição da tarefa',
        status: 'pending',
      };

      const expectedResult = {
        task: {
          id: 1,
          user_id: 1,
          title: 'Nova Tarefa',
          description: 'Descrição da tarefa',
          status: 'pending',
          created_at: new Date(),
        },
      };

      mockTasksService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(mockRequest, createTaskDto);

      expect(service.create).toHaveBeenCalledWith(
        mockRequest.user.userId,
        createTaskDto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('deve criar uma tarefa sem descrição e status (valores padrão)', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Nova Tarefa',
      };

      const expectedResult = {
        task: {
          id: 1,
          user_id: 1,
          title: 'Nova Tarefa',
          description: null,
          status: 'pending',
          created_at: new Date(),
        },
      };

      mockTasksService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(mockRequest, createTaskDto);

      expect(service.create).toHaveBeenCalledWith(
        mockRequest.user.userId,
        createTaskDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('deve atualizar uma tarefa existente', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Tarefa Atualizada',
        status: 'completed',
      };

      const expectedResult = {
        task: {
          id: 1,
          user_id: 1,
          title: 'Tarefa Atualizada',
          description: 'Descrição original',
          status: 'completed',
          created_at: new Date(),
        },
      };

      mockTasksService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(mockRequest, '1', updateTaskDto);

      expect(service.update).toHaveBeenCalledWith(
        mockRequest.user.userId,
        1,
        updateTaskDto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar NotFoundException quando tarefa não existe', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Tarefa Atualizada',
      };

      mockTasksService.update.mockRejectedValue(
        new NotFoundException('Tarefa não encontrada'),
      );

      await expect(
        controller.update(mockRequest, '999', updateTaskDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException quando tarefa pertence a outro usuário', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Tarefa Atualizada',
      };

      mockTasksService.update.mockRejectedValue(
        new ForbiddenException(
          'Você não tem permissão para acessar esta tarefa',
        ),
      );

      await expect(
        controller.update(mockRequest, '1', updateTaskDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('deve deletar uma tarefa existente', async () => {
      const expectedResult = {
        message: 'Tarefa deletada com sucesso',
      };

      mockTasksService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(mockRequest, '1');

      expect(service.remove).toHaveBeenCalledWith(mockRequest.user.userId, 1);
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar NotFoundException quando tarefa não existe', async () => {
      mockTasksService.remove.mockRejectedValue(
        new NotFoundException('Tarefa não encontrada'),
      );

      await expect(controller.remove(mockRequest, '999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException quando tarefa pertence a outro usuário', async () => {
      mockTasksService.remove.mockRejectedValue(
        new ForbiddenException(
          'Você não tem permissão para acessar esta tarefa',
        ),
      );

      await expect(controller.remove(mockRequest, '1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

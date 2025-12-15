import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    const tasks = await this.prisma.task.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    return { tasks };
  }

  async create(userId: number, createTaskDto: CreateTaskDto) {
    const { title, description, status } = createTaskDto;

    const savedTask = await this.prisma.task.create({
      data: {
        user_id: userId,
        title,
        description: description || null,
        status: (status as TaskStatus) || TaskStatus.PENDING,
      },
    });

    return { task: savedTask };
  }

  async update(userId: number, id: number, updateTaskDto: UpdateTaskDto) {
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    if (task.user_id !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta tarefa',
      );
    }

    // Atualizar apenas campos fornecidos
    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }

    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status as TaskStatus;
    }

    const updatedTask = await this.taskRepository.save(task);

    return { task: updatedTask };
  }

  async remove(userId: number, id: number) {
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    if (task.user_id !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta tarefa',
      );
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: 'Tarefa deletada com sucesso' };
  }
}


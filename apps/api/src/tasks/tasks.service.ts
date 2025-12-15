import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from '../entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async findAll(userId: number) {
    const tasks = await this.taskRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    return { tasks };
  }

  async create(userId: number, createTaskDto: CreateTaskDto) {
    const { title, description, status } = createTaskDto;

    const task = this.taskRepository.create({
      user_id: userId,
      title,
      description: description || null,
      status: (status as TaskStatus) || TaskStatus.PENDING,
    });

    const savedTask = await this.taskRepository.save(task);

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

    await this.taskRepository.remove(task);

    return { message: 'Tarefa deletada com sucesso' };
  }
}


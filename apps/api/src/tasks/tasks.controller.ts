import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tarefas retornada com sucesso',
    schema: {
      example: {
        tasks: [
          {
            id: 1,
            user_id: 1,
            title: 'Tarefa exemplo',
            description: 'Descrição da tarefa',
            status: 'pending',
            created_at: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async findAll(@Request() req) {
    return this.tasksService.findAll(req.user.userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova tarefa' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: 'Tarefa criada com sucesso',
    schema: {
      example: {
        task: {
          id: 1,
          user_id: 1,
          title: 'Nova tarefa',
          description: 'Descrição da tarefa',
          status: 'pending',
          created_at: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  async create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.userId, createTaskDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: 'Tarefa atualizada com sucesso',
    schema: {
      example: {
        task: {
          id: 1,
          user_id: 1,
          title: 'Tarefa atualizada',
          description: 'Descrição atualizada',
          status: 'completed',
          created_at: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para acessar esta tarefa' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(req.user.userId, +id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa deletada com sucesso',
    schema: {
      example: {
        message: 'Tarefa deletada com sucesso',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para acessar esta tarefa' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.tasksService.remove(req.user.userId, +id);
  }
}


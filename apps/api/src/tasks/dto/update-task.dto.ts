import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Título da tarefa',
    example: 'Tarefa atualizada',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada da tarefa',
    example: 'Descrição atualizada da tarefa',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Status da tarefa',
    enum: TaskStatus,
    example: TaskStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}


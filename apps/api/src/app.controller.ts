import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Informações da API' })
  @ApiResponse({ status: 200, description: 'Retorna informações da API' })
  getHello(): { message: string; status: string } {
    return {
      message: 'API de Gestão de Tarefas',
      status: 'online',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check da API' })
  @ApiResponse({ status: 200, description: 'Retorna status de saúde da API' })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}


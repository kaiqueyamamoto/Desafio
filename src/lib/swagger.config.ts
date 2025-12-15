import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API - Sistema de Gestão de Tarefas',
      version: '1.0.0',
      description:
        'API RESTful para o sistema de gestão de tarefas desenvolvida com Next.js 14+ e App Router. Esta API permite autenticação de usuários e gerenciamento completo de tarefas.',
      contact: {
        name: 'Desafio Técnico Hubfy.ai',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido através do endpoint de login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do usuário',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'João Silva',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao@exemplo.com',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único da tarefa',
              example: 1,
            },
            user_id: {
              type: 'integer',
              description: 'ID do usuário proprietário da tarefa',
              example: 1,
            },
            title: {
              type: 'string',
              description: 'Título da tarefa',
              example: 'Implementar autenticação',
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Descrição detalhada da tarefa',
              example: 'Implementar sistema de autenticação JWT',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
              description: 'Status da tarefa',
              example: 'PENDING',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação da tarefa',
              example: '2024-01-15T10:30:00.000Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização da tarefa',
              example: '2024-01-15T11:00:00.000Z',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              description: 'Nome completo do usuário',
              example: 'João Silva',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário (deve ser único)',
              example: 'joao@exemplo.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              description:
                'Senha do usuário (mínimo 8 caracteres, deve conter letra maiúscula, minúscula, número e caractere especial)',
              example: 'Senha123!@#',
            },
          },
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Usuário criado com sucesso',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao@exemplo.com',
            },
            password: {
              type: 'string',
              description: 'Senha do usuário',
              example: 'Senha123!@#',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT para autenticação',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              description: 'Título da tarefa',
              example: 'Implementar autenticação',
            },
            description: {
              type: 'string',
              description: 'Descrição detalhada da tarefa',
              example: 'Implementar sistema de autenticação JWT',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
              default: 'PENDING',
              description: 'Status inicial da tarefa',
              example: 'PENDING',
            },
          },
        },
        UpdateTaskRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              description: 'Título da tarefa',
              example: 'Implementar autenticação',
            },
            description: {
              type: 'string',
              description: 'Descrição detalhada da tarefa',
              example: 'Implementar sistema de autenticação JWT',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
              description: 'Status da tarefa',
              example: 'IN_PROGRESS',
            },
          },
        },
        TasksResponse: {
          type: 'object',
          properties: {
            tasks: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Task',
              },
            },
          },
        },
        TaskResponse: {
          type: 'object',
          properties: {
            task: {
              $ref: '#/components/schemas/Task',
            },
          },
        },
        DeleteTaskResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Tarefa deletada com sucesso',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro',
              example: 'Dados inválidos',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
              },
              description: 'Detalhes dos erros de validação (quando aplicável)',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(process.cwd(), 'src/app/api/**/*.ts'), // Caminho para os arquivos de rotas da API
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

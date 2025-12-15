import { POST } from '@/app/api/auth/register/route';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const mockUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword',
        token_version: 0,
        created_at: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'Senha123!@#',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Usuário criado com sucesso');
      expect(data.user).toEqual({
        id: 1,
        name: 'João Silva',
        email: 'joao@example.com',
      });
    });

    it('deve retornar erro quando email já existe', async () => {
      const existingUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword',
        token_version: 0,
        created_at: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'Senha123!@#',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Email já está em uso');
    });

    it('deve retornar erro quando dados são inválidos', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: '',
          email: 'email-invalido',
          password: '123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados inválidos');
    });
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com sucesso', async () => {
      const mockUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword',
        token_version: 0,
      };

      const updatedUser = {
        ...mockUser,
        token_version: 1,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'joao@example.com',
          password: 'Senha123!@#',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.token).toBeDefined();
      expect(data.user).toEqual({
        id: 1,
        name: 'João Silva',
        email: 'joao@example.com',
      });
    });

    it('deve retornar erro quando usuário não existe', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'joao@example.com',
          password: 'Senha123!@#',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Email ou senha inválidos');
    });

    it('deve retornar erro quando senha é inválida', async () => {
      const mockUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword',
        token_version: 0,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'joao@example.com',
          password: 'SenhaErrada123!@#',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Email ou senha inválidos');
    });

    it('deve retornar erro quando token é inválido', async () => {
      // Este teste verifica o middleware de autenticação
      // Será testado nas rotas de tarefas que requerem autenticação
    });
  });
});

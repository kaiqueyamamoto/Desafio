/**
 * @jest-environment node
 */
import { POST } from '@/app/api/auth/refresh/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

jest.mock('@/lib/db', () => ({
  prisma: {
    refreshToken: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  verifyRefreshToken: jest.fn(),
  generateToken: jest.fn(),
}));

import * as auth from '@/lib/auth';

describe('Refresh Token API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/refresh', () => {
    it('deve renovar o access token com refresh token válido', async () => {
      const mockRefreshToken = {
        id: 1,
        token: 'valid-refresh-token',
        user_id: 1,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias no futuro
        created_at: new Date(),
        user: {
          id: 1,
          name: 'João Silva',
          email: 'joao@example.com',
          token_version: 1,
        },
      };

      (auth.verifyRefreshToken as jest.Mock).mockReturnValue({ sub: 1 });
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockRefreshToken);
      (auth.generateToken as jest.Mock).mockReturnValue('new-access-token');

      const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: 'valid-refresh-token',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('user');
      expect(data.accessToken).toBe('new-access-token');
      expect(data.user.id).toBe(1);
    });

    it('deve retornar erro 400 quando refresh token não é fornecido', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('deve retornar erro 401 quando refresh token não existe no banco', async () => {
      (auth.verifyRefreshToken as jest.Mock).mockReturnValue({ sub: 1 });
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: 'invalid-refresh-token',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Refresh token');
    });

    it('deve retornar erro 401 quando refresh token está expirado', async () => {
      const expiredToken = {
        id: 1,
        token: 'expired-refresh-token',
        user_id: 1,
        expires_at: new Date(Date.now() - 1000), // Expirado
        created_at: new Date(),
        user: {
          id: 1,
          name: 'João Silva',
          email: 'joao@example.com',
          token_version: 1,
        },
      };

      (auth.verifyRefreshToken as jest.Mock).mockReturnValue({ sub: 1 });
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(expiredToken);
      (prisma.refreshToken.delete as jest.Mock).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: 'expired-refresh-token',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('expirado');
    });

    it('deve retornar erro 401 quando refresh token é inválido', async () => {
      (auth.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Refresh token inválido');
      });

      const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: 'invalid-token',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
    });
  });
});

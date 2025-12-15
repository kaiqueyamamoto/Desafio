import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/services/auth.service';
import { registerApiSchema, loginSchema } from '@/lib/schemas/auth.schema';
import { addCorsHeaders } from '@/lib/cors';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

/**
 * Controller de Autenticação
 * Orquestra requisições HTTP relacionadas à autenticação
 */
export class AuthController {
  /**
   * Registra um novo usuário
   */
  async register(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      
      // Validar dados
      const validatedData = registerApiSchema.parse(body);

      // Chamar service
      const result = await authService.register(validatedData);

      const response = NextResponse.json(result, { status: 201 });
      return addCorsHeaders(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response = NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        );
        return addCorsHeaders(response);
      }

      if (error instanceof Error && error.message === 'Email já está em uso') {
        const response = NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
        return addCorsHeaders(response);
      }

      const response = NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
      return addCorsHeaders(response);
    }
  }

  /**
   * Autentica um usuário
   */
  async login(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      
      // Validar dados
      const validatedData = loginSchema.parse(body);

      // Chamar service
      const result = await authService.login(validatedData);

      const response = NextResponse.json(result, { status: 200 });
      return addCorsHeaders(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response = NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        );
        return addCorsHeaders(response);
      }

      if (error instanceof Error && error.message === 'Email ou senha inválidos') {
        const response = NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
        return addCorsHeaders(response);
      }

      const response = NextResponse.json(
        { error: 'Erro ao fazer login' },
        { status: 500 }
      );
      return addCorsHeaders(response);
    }
  }

  /**
   * Renova o access token
   */
  async refresh(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      
      // Validar dados
      const validatedData = refreshSchema.parse(body);

      // Chamar service
      const result = await authService.refreshToken(validatedData.refreshToken);

      const response = NextResponse.json(result, { status: 200 });
      return addCorsHeaders(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response = NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        );
        return addCorsHeaders(response);
      }

      if (error instanceof Error && (
        error.message.includes('Refresh token') || 
        error.message.includes('inválido') ||
        error.message.includes('expirado')
      )) {
        const response = NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
        return addCorsHeaders(response);
      }

      const response = NextResponse.json(
        { error: 'Erro ao renovar token' },
        { status: 500 }
      );
      return addCorsHeaders(response);
    }
  }
}

export const authController = new AuthController();

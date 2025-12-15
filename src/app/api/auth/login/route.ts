import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import { z } from 'zod';
import { addCorsHeaders, createCorsResponse } from '@/lib/cors';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     description: Valida as credenciais do usuário e retorna um token JWT que deve ser usado para autenticar requisições subsequentes.
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             exemplo1:
 *               value:
 *                 email: "joao@exemplo.com"
 *                 password: "Senha123!@#"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: 1
 *                 name: "João Silva"
 *                 email: "joao@exemplo.com"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Dados inválidos"
 *               details:
 *                 - field: "email"
 *                   message: "Email inválido"
 *       401:
 *         description: Email ou senha inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Email ou senha inválidos"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao fazer login"
 */
export async function OPTIONS() {
  return createCorsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validatedData = loginSchema.parse(body);

    const result = await login(validatedData);

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

import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/auth';
import { registerApiSchema } from '@/lib/schemas/auth.schema';
import { z } from 'zod';
import { addCorsHeaders, createCorsResponse } from '@/lib/cors';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário no sistema
 *     description: Cria uma nova conta de usuário com nome, email e senha. A senha será hasheada antes de ser armazenada.
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             exemplo1:
 *               value:
 *                 name: "João Silva"
 *                 email: "joao@exemplo.com"
 *                 password: "Senha123!@#"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *             example:
 *               message: "Usuário criado com sucesso"
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
 *       409:
 *         description: Email já está em uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Email já está em uso"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao criar usuário"
 */
export async function OPTIONS() {
  return createCorsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados (API não requer confirmPassword)
    const validatedData = registerApiSchema.parse(body);

    const result = await register(validatedData);

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

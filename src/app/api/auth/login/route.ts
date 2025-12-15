import { NextRequest } from 'next/server';
import { authController } from '@/lib/controllers/auth.controller';
import { createCorsResponse } from '@/lib/cors';

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
  return authController.login(request);
}

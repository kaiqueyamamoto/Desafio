import { NextRequest } from 'next/server';
import { authController } from '@/lib/controllers/auth.controller';
import { createCorsResponse } from '@/lib/cors';

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
  return authController.register(request);
}

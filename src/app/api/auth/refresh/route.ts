import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/auth';
import { z } from 'zod';
import { addCorsHeaders, createCorsResponse } from '@/lib/cors';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renova o access token usando um refresh token
 *     description: Valida o refresh token e retorna um novo access token válido.
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token válido
 *           examples:
 *             exemplo1:
 *               value:
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Novo access token gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *             example:
 *               accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
 *       401:
 *         description: Refresh token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Refresh token expirado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao renovar token"
 */
export async function OPTIONS() {
  return createCorsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validatedData = refreshSchema.parse(body);

    const result = await refreshAccessToken(validatedData.refreshToken);

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

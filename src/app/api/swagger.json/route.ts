import { NextRequest, NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger.config';
import { addCorsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

export async function GET(request: NextRequest) {
  // Obter a URL base do request para usar no servidor do Swagger
  const origin = request.headers.get('origin') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = origin 
    ? `${protocol}://${origin.replace(/^https?:\/\//, '')}`
    : 'http://localhost:3000';

  // Criar uma cópia do spec e atualizar a URL do servidor
  const specWithCorrectUrl = {
    ...swaggerSpec,
    servers: [
      {
        url: baseUrl,
        description: 'Servidor de desenvolvimento',
      },
    ],
  };

  const response = NextResponse.json(specWithCorrectUrl);
  return addCorsHeaders(response);
}

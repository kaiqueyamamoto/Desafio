import { NextResponse } from 'next/server';

/**
 * Adiciona headers CORS a uma resposta NextResponse
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

/**
 * Cria uma resposta OPTIONS para requisições CORS preflight
 */
export function createCorsResponse(): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

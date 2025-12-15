import { NextRequest, NextResponse } from 'next/server';
import { validateTokenAndGetUser } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: number;
    email: string;
    name: string;
  };
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: { userId: number; email: string; name: string } } | NextResponse> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Token não fornecido' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);

  try {
    const user = await validateTokenAndGetUser(token);
    return { user };
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Token inválido' },
      { status: 401 }
    );
  }
}

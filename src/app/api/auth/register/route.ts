import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/auth';
import { registerSchema } from '@/lib/schemas/auth.schema';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validatedData = registerSchema.parse(body);

    const result = await register(validatedData);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Email já está em uso') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}

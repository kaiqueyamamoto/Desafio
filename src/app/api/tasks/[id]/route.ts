import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { TaskStatus } from '@/types';
import { z } from 'zod';

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const taskId = parseInt(params.id);

  if (isNaN(taskId)) {
    return NextResponse.json(
      { error: 'ID da tarefa inválido' },
      { status: 400 }
    );
  }

  try {
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    if (task.user_id !== user.userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para acessar esta tarefa' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.status !== undefined && { status: validatedData.status }),
      },
    });

    return NextResponse.json({ task: updatedTask }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar tarefa' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const taskId = parseInt(params.id);

  if (isNaN(taskId)) {
    return NextResponse.json(
      { error: 'ID da tarefa inválido' },
      { status: 400 }
    );
  }

  try {
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    if (task.user_id !== user.userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para acessar esta tarefa' },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json(
      { message: 'Tarefa deletada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar tarefa' },
      { status: 500 }
    );
  }
}

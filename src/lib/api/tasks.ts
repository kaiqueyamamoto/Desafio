import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface TasksResponse {
  tasks: Task[];
}

export interface TaskResponse {
  task: Task;
}

export interface DeleteTaskResponse {
  message: string;
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function getTasks(): Promise<TasksResponse> {
  const response = await fetch(`${API_URL}/api/tasks`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar tarefas');
  }

  return response.json();
}

export async function createTask(data: CreateTaskDto): Promise<TaskResponse> {
  const response = await fetch(`${API_URL}/api/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar tarefa');
  }

  return response.json();
}

export async function updateTask(
  id: number,
  data: UpdateTaskDto
): Promise<TaskResponse> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao atualizar tarefa');
  }

  return response.json();
}

export async function deleteTask(id: number): Promise<DeleteTaskResponse> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao deletar tarefa');
  }

  return response.json();
}

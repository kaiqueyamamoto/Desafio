import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '@/types';
import { refreshToken } from './auth';

// Usar URL relativa para chamadas de API no mesmo domínio
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // No cliente, usar URL relativa
    return '';
  }
  // No servidor, usar variável de ambiente ou localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export interface TasksResponse {
  tasks: Task[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TasksQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus | 'all';
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
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

// Interceptor para renovar token automaticamente
async function fetchWithTokenRefresh(url: string, options: RequestInit): Promise<Response> {
  const response = await fetch(url, options);

  // Se o token expirou (401), tentar renovar
  if (response.status === 401) {
    try {
      await refreshToken();
      // Tentar novamente com o novo token
      const newHeaders = { ...options.headers, ...getAuthHeaders() };
      return fetch(url, { ...options, headers: newHeaders });
    } catch (error) {
      // Se não conseguir renovar, redirecionar para login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
      throw error;
    }
  }

  return response;
}

export async function getTasks(params?: TasksQueryParams): Promise<TasksResponse> {
  const apiUrl = getApiUrl();
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  }

  const url = `${apiUrl}/api/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetchWithTokenRefresh(url, {
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
  const apiUrl = getApiUrl();
  const response = await fetchWithTokenRefresh(`${apiUrl}/api/tasks`, {
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
  const apiUrl = getApiUrl();
  const response = await fetchWithTokenRefresh(`${apiUrl}/api/tasks/${id}`, {
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
  const apiUrl = getApiUrl();
  const response = await fetchWithTokenRefresh(`${apiUrl}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao deletar tarefa');
  }

  return response.json();
}

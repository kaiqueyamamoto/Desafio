import { LoginFormData, RegisterFormData } from '@/lib/schemas/auth.schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export async function login(data: LoginFormData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao fazer login');
  }

  return response.json();
}

export async function register(data: RegisterFormData): Promise<RegisterResponse> {
  // Remover confirmPassword antes de enviar
  const { confirmPassword, ...registerData } = data;
  
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registerData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao registrar usuário');
  }

  return response.json();
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  // Também salvar em cookie para o middleware do Next.js
  document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  // Remover cookie também
  document.cookie = 'auth_token=; path=/; max-age=0';
}

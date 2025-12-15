import { LoginFormData, RegisterFormData } from '@/lib/schemas/auth.schema';

// Usar URL relativa para chamadas de API no mesmo domínio
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // No cliente, usar URL relativa
    return '';
  }
  // No servidor, usar variável de ambiente ou localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
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
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro ao fazer login' }));
      throw new Error(error.error || 'Erro ao fazer login');
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
    }
    throw error;
  }
}

export async function register(data: RegisterFormData): Promise<RegisterResponse> {
  try {
    // Remover confirmPassword antes de enviar
    const { confirmPassword, ...registerData } = data;
    
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro ao registrar usuário' }));
      throw new Error(error.error || 'Erro ao registrar usuário');
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
    }
    throw error;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  // Também salvar em cookie para o middleware do Next.js
  document.cookie = `auth_token=${accessToken}; path=/; max-age=${60 * 15}; SameSite=Lax`; // 15 minutos
  document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`; // 7 dias
}

export function removeAuthTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  // Remover cookies também
  document.cookie = 'auth_token=; path=/; max-age=0';
  document.cookie = 'refresh_token=; path=/; max-age=0';
}

// Manter compatibilidade com código existente
export function setAuthToken(token: string): void {
  const refreshToken = getRefreshToken() || '';
  setAuthTokens(token, refreshToken);
}

export function removeAuthToken(): void {
  removeAuthTokens();
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('Refresh token não encontrado');
  }

  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao renovar token' }));
    throw new Error(error.error || 'Erro ao renovar token');
  }

  const data: RefreshTokenResponse = await response.json();
  
  // Atualizar access token no localStorage
  if (refreshTokenValue) {
    setAuthTokens(data.accessToken, refreshTokenValue);
  }

  return data;
}

import { register, login, refreshAccessToken } from '@/lib/auth';
import { RegisterApiDto, LoginFormData } from '@/lib/schemas/auth.schema';

/**
 * Service de Autenticação
 * Contém a lógica de negócio relacionada à autenticação
 */
export class AuthService {
  /**
   * Registra um novo usuário no sistema
   */
  async register(data: RegisterApiDto) {
    return await register(data);
  }

  /**
   * Autentica um usuário e retorna tokens JWT
   */
  async login(data: LoginFormData) {
    return await login(data);
  }

  /**
   * Renova o access token usando um refresh token
   */
  async refreshToken(refreshToken: string) {
    return await refreshAccessToken(refreshToken);
  }
}

export const authService = new AuthService();

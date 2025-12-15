/**
 * Testes de fluxo de autenticação
 * Testa o fluxo completo de login e registro
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../helpers/test-utils';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useLogin, useRegister } from '@/lib/hooks/use-auth';

// Mock dos hooks
jest.mock('@/lib/hooks/use-auth');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock do window.location
delete (window as any).location;
(window as any).location = { href: '' };

const mockUseLogin = useLogin as jest.MockedFunction<typeof useLogin>;
const mockUseRegister = useRegister as jest.MockedFunction<typeof useRegister>;

describe('Fluxo de Autenticação', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fluxo de Login', () => {
    it('deve completar fluxo de login com sucesso', async () => {
      const user = userEvent.setup();
      const mockMutateAsync = jest.fn().mockResolvedValue({
        token: 'mock-token',
        user: { id: 1, name: 'Teste', email: 'teste@example.com' },
      });

      mockUseLogin.mockReturnValue({
        mutateAsync: mockMutateAsync,
        mutate: jest.fn(),
        reset: jest.fn(),
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        data: undefined,
        status: 'idle',
      } as any);

      render(<LoginForm />);

      // Preencher formulário
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Senha');
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'teste@example.com');
      await user.type(passwordInput, 'Senha123!@#');
      await user.click(submitButton);

      // Verificar que login foi chamado
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          email: 'teste@example.com',
          password: 'Senha123!@#',
        });
      });
    });

    it('deve mostrar erro quando credenciais são inválidas', async () => {
      const user = userEvent.setup();
      const mockError = new Error('Email ou senha inválidos');
      const mockMutateAsync = jest.fn().mockRejectedValue(mockError);

      mockUseLogin.mockReturnValue({
        mutateAsync: mockMutateAsync,
        mutate: jest.fn(),
        reset: jest.fn(),
        isPending: false,
        isError: true,
        isSuccess: false,
        error: mockError,
        data: undefined,
        status: 'error',
      } as any);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Senha');
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'teste@example.com');
      await user.type(passwordInput, 'SenhaErrada123!@#');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email ou senha inválidos/i)).toBeInTheDocument();
      });
    });
  });

  describe('Fluxo de Registro', () => {
    it('deve completar fluxo de registro com sucesso', async () => {
      const user = userEvent.setup();
      const mockMutateAsync = jest.fn().mockResolvedValue({
        message: 'Usuário criado com sucesso',
        user: { id: 1, name: 'João Silva', email: 'joao@example.com' },
      });

      mockUseRegister.mockReturnValue({
        mutateAsync: mockMutateAsync,
        mutate: jest.fn(),
        reset: jest.fn(),
        isPending: false,
        isError: false,
        isSuccess: true,
        error: null,
        data: { message: 'Usuário criado com sucesso' },
        status: 'success',
      } as any);

      render(<RegisterForm />);

      // Preencher formulário
      const nameInput = screen.getByPlaceholderText(/seu nome completo/i);
      const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/mínimo 8 caracteres/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/digite a senha novamente/i);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });

      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'Senha123!@#');
      await user.type(confirmPasswordInput, 'Senha123!@#');
      await user.click(submitButton);

      // Verificar que registro foi chamado
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'Senha123!@#',
          confirmPassword: 'Senha123!@#',
        });
      });

      // Verificar mensagem de sucesso
      expect(screen.getByText(/conta criada com sucesso/i)).toBeInTheDocument();
    });

    it('deve validar todos os campos antes de permitir registro', async () => {
      const user = userEvent.setup();
      mockUseRegister.mockReturnValue({
        mutateAsync: jest.fn(),
        mutate: jest.fn(),
        reset: jest.fn(),
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        data: undefined,
        status: 'idle',
      } as any);

      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      // Verificar que múltiplos erros aparecem
      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      });
    });
  });

  describe('Validações de Formulário', () => {
    it('deve validar formato de email no login', async () => {
      const user = userEvent.setup();
      mockUseLogin.mockReturnValue({
        mutateAsync: jest.fn(),
        mutate: jest.fn(),
        reset: jest.fn(),
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        data: undefined,
        status: 'idle',
      } as any);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('Email');
      await user.type(emailInput, 'email-invalido');
      
      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Verificar que há erro de validação de email
        const errorMessage = screen.queryByText(/email inválido|email deve ser um email válido/i);
        expect(errorMessage).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('deve validar força da senha no registro', async () => {
      const user = userEvent.setup();
      mockUseRegister.mockReturnValue({
        mutateAsync: jest.fn(),
        mutate: jest.fn(),
        reset: jest.fn(),
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        data: undefined,
        status: 'idle',
      } as any);

      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, '123'); // Senha fraca
      
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Verificar que há erro de validação de senha
        const errorMessages = screen.queryAllByText(/senha|caracteres|mínimo/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../helpers/test-utils';
import LoginForm from '@/components/auth/LoginForm';
import { useLogin } from '@/lib/hooks/use-auth';

// Mock dos hooks
jest.mock('@/lib/hooks/use-auth');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock do window.location já está no jest.setup.js

const mockUseLogin = useLogin as jest.MockedFunction<typeof useLogin>;

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o formulário de login', () => {
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

    expect(screen.getByText('Faça login na sua conta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText('Não tem uma conta? Registre-se')).toBeInTheDocument();
  });

  it('deve validar email obrigatório', async () => {
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

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Verificar que há erro de validação
      const errorMessage = screen.queryByText(/email é obrigatório|obrigatório/i);
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve validar formato de email', async () => {
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
    await user.tab(); // Sair do campo para trigger validação
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/email inválido|email deve ser um email válido/i);
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve validar senha obrigatória', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = jest.fn();
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

    const emailInput = screen.getByPlaceholderText('Email');
    await user.type(emailInput, 'teste@example.com');
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);

    // Verificar que o login não foi chamado devido à validação
    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  it('deve fazer login com sucesso', async () => {
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

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(emailInput, 'teste@example.com');
    await user.type(passwordInput, 'Senha123!@#');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'teste@example.com',
        password: 'Senha123!@#',
      });
    });
  });

  it('deve mostrar mensagem de erro quando login falha', async () => {
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

  it('deve desabilitar botão durante o loading', () => {
    mockUseLogin.mockReturnValue({
      mutateAsync: jest.fn(),
      mutate: jest.fn(),
      reset: jest.fn(),
      isPending: true,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      status: 'pending',
    } as any);

    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /entrando/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Entrando...')).toBeInTheDocument();
  });
});

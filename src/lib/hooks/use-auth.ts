import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login, register, setAuthToken, removeAuthToken } from '@/lib/api/auth';
import { LoginFormData, RegisterFormData } from '@/lib/schemas/auth.schema';

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginFormData) => login(data),
    onSuccess: (response) => {
      setAuthToken(response.token);
      window.location.href = '/dashboard';
    },
    onError: (error: Error) => {
      console.error('Erro ao fazer login:', error.message);
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterFormData) => register(data),
    onSuccess: () => {
      router.push('/login');
    },
    onError: (error: Error) => {
      console.error('Erro ao registrar:', error.message);
    },
  });
}

export function useLogout() {
  const router = useRouter();

  return () => {
    removeAuthToken();
    router.push('/login');
  };
}

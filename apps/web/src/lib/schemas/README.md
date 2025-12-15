# Schemas de Validação com Zod

Este diretório contém os schemas de validação usando Zod para formulários do frontend.

## Uso com React Hook Form

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth.schema';

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // Lógica de submissão
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email')}
        type="email"
        className="input input-bordered w-full"
      />
      {errors.email && (
        <p className="text-error text-sm mt-1">{errors.email.message}</p>
      )}

      <input
        {...register('password')}
        type="password"
        className="input input-bordered w-full"
      />
      {errors.password && (
        <p className="text-error text-sm mt-1">{errors.password.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary"
      >
        {isSubmitting ? 'Enviando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

## Schemas Disponíveis

- `loginSchema`: Validação para formulário de login
- `registerSchema`: Validação para formulário de registro

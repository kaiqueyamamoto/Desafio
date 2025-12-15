import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória'),
});

// Schema base para registro
const registerBaseSchema = z.object({
    name: z
      .string()
      .min(1, 'Nome é obrigatório')
      .min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Email inválido'),
    password: z
      .string()
      .min(1, 'Senha é obrigatória')
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
    confirmPassword: z
      .string()
      .min(1, 'Confirmação de senha é obrigatória'),
});

// Schema para a API (sem confirmPassword)
export const registerApiSchema = registerBaseSchema.omit({ confirmPassword: true });

// Schema completo para formulário (com validação de confirmação de senha)
export const registerSchema = registerBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  }
);

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RegisterApiDto = z.infer<typeof registerApiSchema>;

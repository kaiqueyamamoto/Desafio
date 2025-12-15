import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { JwtPayload, RegisterDto, LoginDto } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não está configurado nas variáveis de ambiente');
}

// Garantir que JWT_SECRET não é undefined para TypeScript
const JWT_SECRET_STRING: string = JWT_SECRET;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET_STRING, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_STRING);
    return decoded as unknown as JwtPayload;
  } catch (error) {
    throw new Error('Token inválido');
  }
}

export async function register(registerDto: RegisterDto) {
  const { name, email, password } = registerDto;

  // Verificar se email já existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email já está em uso');
  }

  // Hash da senha
  const hashedPassword = await hashPassword(password);

  // Criar usuário
  const savedUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      token_version: 0,
    },
  });

  return {
    message: 'Usuário criado com sucesso',
    user: {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
    },
  };
}

export async function login(loginDto: LoginDto) {
  const { email, password } = loginDto;

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      token_version: true,
    },
  });

  if (!user) {
    throw new Error('Email ou senha inválidos');
  }

  // Verificar senha
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Email ou senha inválidos');
  }

  // Incrementar token_version para invalidar tokens antigos
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      token_version: {
        increment: 1,
      },
    },
  });

  // Gerar token JWT com token_version
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    tokenVersion: updatedUser.token_version,
  };
  const token = generateToken(payload);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function getUserInfo(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };
}

export async function validateTokenAndGetUser(token: string) {
  const payload = verifyToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      token_version: true,
    },
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  // Validar se o token_version do token corresponde ao do banco
  if (payload.tokenVersion !== user.token_version) {
    throw new Error('Token inválido. Um novo login foi realizado.');
  }

  return { userId: user.id, email: user.email, name: user.name };
}

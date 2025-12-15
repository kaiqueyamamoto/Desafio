import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { JwtPayload, RegisterDto, LoginDto } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Access token expira em 15 minutos
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // Refresh token expira em 7 dias
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não está configurado nas variáveis de ambiente');
}

// Garantir que JWT_SECRET não é undefined para TypeScript
const JWT_SECRET_STRING: string = JWT_SECRET;
const JWT_REFRESH_SECRET_STRING: string = JWT_REFRESH_SECRET || JWT_SECRET_STRING;

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

export function generateRefreshToken(userId: number): string {
  return jwt.sign({ sub: userId }, JWT_REFRESH_SECRET_STRING, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
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

export function verifyRefreshToken(token: string): { sub: number } {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET_STRING);
    return decoded as unknown as { sub: number };
  } catch (error) {
    throw new Error('Refresh token inválido');
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

  // Gerar access token JWT com token_version
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    tokenVersion: updatedUser.token_version,
  };
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(user.id);

  // Calcular data de expiração do refresh token (7 dias)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Salvar refresh token no banco de dados
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      user_id: user.id,
      expires_at: expiresAt,
    },
  });

  // Limpar refresh tokens expirados do usuário
  await prisma.refreshToken.deleteMany({
    where: {
      user_id: user.id,
      expires_at: {
        lt: new Date(),
      },
    },
  });

  return {
    accessToken,
    refreshToken,
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

export async function refreshAccessToken(refreshToken: string) {
  // Verificar se o refresh token é válido
  const payload = verifyRefreshToken(refreshToken);

  // Verificar se o refresh token existe no banco e não está expirado
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new Error('Refresh token não encontrado');
  }

  if (storedToken.expires_at < new Date()) {
    // Remover token expirado
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });
    throw new Error('Refresh token expirado');
  }

  if (storedToken.user_id !== payload.sub) {
    throw new Error('Refresh token inválido');
  }

  const user = storedToken.user;

  // Gerar novo access token
  const newPayload: JwtPayload = {
    sub: user.id,
    email: user.email,
    tokenVersion: user.token_version,
  };
  const newAccessToken = generateToken(newPayload);

  return {
    accessToken: newAccessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function revokeRefreshToken(refreshToken: string) {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

export async function revokeAllUserRefreshTokens(userId: number) {
  await prisma.refreshToken.deleteMany({
    where: { user_id: userId },
  });
}

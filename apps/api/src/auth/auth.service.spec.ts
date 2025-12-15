import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let mockDb: any;

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    mockDb = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'DATABASE_CONNECTION',
          useValue: mockDb,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const registerDto: RegisterDto = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123456',
      };

      mockDb.execute.mockResolvedValueOnce([[]]); // Email não existe - retorna [rows, fields]
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockDb.execute.mockResolvedValueOnce([
        { insertId: 1 },
      ]); // Inserção bem-sucedida - retorna [result, fields] onde result tem insertId

      const result = await service.register(registerDto);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'SELECT id FROM users WHERE email = ?',
        [registerDto.email],
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockDb.execute).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [registerDto.name, registerDto.email, 'hashedPassword'],
      );
      expect(result).toEqual({
        message: 'Usuário criado com sucesso',
        user: {
          id: 1,
          name: 'João Silva',
          email: 'joao@example.com',
        },
      });
    });

    it('deve lançar ConflictException quando email já existe', async () => {
      const registerDto: RegisterDto = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123456',
      };

      mockDb.execute.mockResolvedValueOnce([
        [{ id: 1 }],
      ]); // Email já existe

      const promise = service.register(registerDto);
      await expect(promise).rejects.toThrow(ConflictException);
      await expect(promise).rejects.toThrow('Email já está em uso');
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const loginDto: LoginDto = {
        email: 'joao@example.com',
        password: 'senha123456',
      };

      const mockUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword',
      };

      mockDb.execute.mockResolvedValueOnce([[mockUser]]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token-exemplo');

      const result = await service.login(loginDto);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'SELECT id, name, email, password FROM users WHERE email = ?',
        [loginDto.email],
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        token: 'jwt-token-exemplo',
        user: {
          id: 1,
          name: 'João Silva',
          email: 'joao@example.com',
        },
      });
    });

    it('deve lançar UnauthorizedException quando usuário não existe', async () => {
      const loginDto: LoginDto = {
        email: 'joao@example.com',
        password: 'senha123456',
      };

      mockDb.execute.mockResolvedValueOnce([[]]); // Usuário não encontrado

      const promise = service.login(loginDto);
      await expect(promise).rejects.toThrow(UnauthorizedException);
      await expect(promise).rejects.toThrow('Email ou senha inválidos');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException quando senha é inválida', async () => {
      const loginDto: LoginDto = {
        email: 'joao@example.com',
        password: 'senhaErrada',
      };

      const mockUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword',
      };

      mockDb.execute.mockResolvedValueOnce([[mockUser]]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const promise = service.login(loginDto);
      await expect(promise).rejects.toThrow(UnauthorizedException);
      await expect(promise).rejects.toThrow('Email ou senha inválidos');
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});

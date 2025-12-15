import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const registerDto: RegisterDto = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123456',
      };

      const expectedResult = {
        message: 'Usuário criado com sucesso',
        user: {
          id: 1,
          name: 'João Silva',
          email: 'joao@example.com',
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar ConflictException quando email já existe', async () => {
      const registerDto: RegisterDto = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123456',
      };

      mockAuthService.register.mockRejectedValue(
        new ConflictException('Email já está em uso'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const loginDto: LoginDto = {
        email: 'joao@example.com',
        password: 'senha123456',
      };

      const expectedResult = {
        token: 'jwt-token-exemplo',
        user: {
          id: 1,
          name: 'João Silva',
          email: 'joao@example.com',
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    it('deve lançar UnauthorizedException quando credenciais são inválidas', async () => {
      const loginDto: LoginDto = {
        email: 'joao@example.com',
        password: 'senhaErrada',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });
});

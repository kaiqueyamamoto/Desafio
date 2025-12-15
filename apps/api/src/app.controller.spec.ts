import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello', () => {
    it('deve retornar mensagem e status da API', () => {
      const result = controller.getHello();

      expect(result).toEqual({
        message: 'API de Gestão de Tarefas',
        status: 'online',
      });
    });
  });

  describe('getHealth', () => {
    it('deve retornar status ok e timestamp', () => {
      const result = controller.getHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
      expect(() => new Date(result.timestamp)).not.toThrow();
    });
  });
});

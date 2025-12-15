import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Task } from '../entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        const password = configService.get<string>('DB_PASSWORD');
        
        if (password === undefined || password === null) {
          logger.error('❌ ERRO: DB_PASSWORD não está definida no arquivo .env');
          logger.error('   Por favor, defina DB_PASSWORD no arquivo .env');
          logger.error('   Exemplo: DB_PASSWORD=root');
        }

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: configService.get<number>('DB_PORT') || 3306,
          username: configService.get<string>('DB_USER') || 'root',
          password: password || '',
          database: configService.get<string>('DB_NAME') || 'task_manager',
          entities: [User, Task],
          synchronize: false, // Usar migrations em produção
          logging: process.env.NODE_ENV === 'development',
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
    }),
    TypeOrmModule.forFeature([User, Task]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Verificar se DATABASE_URL está configurada
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      // Construir DATABASE_URL a partir de variáveis individuais se não estiver definida
      const host = this.configService.get<string>('DB_HOST') || 'localhost';
      const port = this.configService.get<number>('DB_PORT') || 3306;
      const user = this.configService.get<string>('DB_USER') || 'root';
      const password = this.configService.get<string>('DB_PASSWORD') || '';
      const database = this.configService.get<string>('DB_NAME') || 'task_manager';

      if (!password) {
        this.logger.error(
          '❌ ERRO: DATABASE_URL ou DB_PASSWORD não está definida no arquivo .env'
        );
        this.logger.error('   Por favor, defina DATABASE_URL ou DB_PASSWORD no arquivo .env');
        this.logger.error('   Exemplo: DATABASE_URL="mysql://root:root@localhost:3306/task_manager"');
      } else {
        const constructedUrl = `mysql://${user}:${password}@${host}:${port}/${database}`;
        process.env.DATABASE_URL = constructedUrl;
        this.logger.log('✅ DATABASE_URL construída a partir de variáveis individuais');
      }
    } else {
      this.logger.log('✅ DATABASE_URL encontrada no arquivo .env');
    }
  }
}

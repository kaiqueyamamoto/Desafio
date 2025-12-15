import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private configService: ConfigService) {
    const password = this.configService.get<string>('DB_PASSWORD');

    if (password === undefined || password === null) {
      this.logger.error(
        '❌ ERRO: DB_PASSWORD não está definida no arquivo .env'
      );
      this.logger.error('   Por favor, defina DB_PASSWORD no arquivo .env');
      this.logger.error('   Exemplo: DB_PASSWORD=root');
    }
  }
}

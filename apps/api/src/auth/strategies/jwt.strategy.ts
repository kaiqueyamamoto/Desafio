import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'name', 'email', 'token_version'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Validar se o token_version do token corresponde ao do banco
    // Se não corresponder, significa que um novo login foi feito e este token foi invalidado
    if (payload.tokenVersion !== user.token_version) {
      throw new UnauthorizedException(
        'Token inválido. Um novo login foi realizado.',
      );
    }

    return { userId: user.id, email: user.email, name: user.name };
  }
}


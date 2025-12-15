import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123456',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}


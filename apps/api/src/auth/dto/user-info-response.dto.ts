import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsEmail, IsDateString } from 'class-validator';

export class UserInfoResponseDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Data de criação da conta',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  created_at: Date;
}

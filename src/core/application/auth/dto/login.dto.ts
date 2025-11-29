import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '@core/domain/users/user.entity';

export class LoginDto {
  @ApiProperty({
    example: 'estudiante@universidad.edu',
    description: 'Email del usuario',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  // Alias en snake_case para compatibilidad con frontend
  access_token?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}
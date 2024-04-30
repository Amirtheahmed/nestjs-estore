import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleSlug } from '../../utils/constants';

export class SignupDto {
  @ApiProperty({
    format: 'email',
    example: 'user@example.com',
    description: 'Valid email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password', description: 'Password' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    example: [RoleSlug.USER, RoleSlug.USER],
    description: 'Role of the user',
  })
  @IsNotEmpty()
  @IsEnum(RoleSlug)
  role: string;
}

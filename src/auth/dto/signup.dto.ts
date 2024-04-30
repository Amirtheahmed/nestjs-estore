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

  @ApiProperty({ example: 'password', description: 'Password', type: 'string' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John', description: 'First name of the user', type: 'string' })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user', type: 'string' })
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Role of the user',
    type: 'enum',
    enum: RoleSlug,
    default: RoleSlug.USER,
    enumName: 'RoleSlug'
  })
  @IsNotEmpty()
  @IsEnum(RoleSlug)
  role: string;
}

import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SigninDto {
  @ApiProperty({
    format: 'email',
    example: 'user@example.com',
    description: 'Valid email address',
    type: 'string'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password',
    description: 'Password',
    type: 'string'
  })
  @IsNotEmpty()
  password: string;
}

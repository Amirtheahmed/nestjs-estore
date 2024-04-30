import { ApiProperty } from '@nestjs/swagger';

export class SigninOutputDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
    description: 'JWT access token',
    type: String,
  })
  access_token: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorOutputDto {
  @ApiProperty({
    example: ['email must be an email'],
    description: 'Validation Error Messages',
    type: [],
  })
  message: string[];

  @ApiProperty({
    example: 'Bad Request',
    description: 'Http Status Message',
    type: String,
  })
  error: string;

  @ApiProperty({
    example: 400,
    description: 'Http Status Code',
    type: Number,
  })
  status: number;
}

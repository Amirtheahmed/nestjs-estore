import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryOutputDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the category',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'Electronics',
    description: 'The name of the category',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'All electronic gadgets',
    description: 'Description of the category',
  })
  @Expose()
  description: string;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'The date the category was created',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'The date the category was last updated',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    type: () => CategoryOutputDto,
    description: 'The parent category',
  })
  @Expose()
  @Type(() => CategoryOutputDto)
  parent?: CategoryOutputDto;
}

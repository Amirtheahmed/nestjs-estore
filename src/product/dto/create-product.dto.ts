import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TransformPriceToInteger } from '../transformers';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @TransformPriceToInteger()
  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stockQuantity: number;

  @IsBoolean()
  isActive: boolean;

  @IsInt()
  categoryId: number;
}

import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TransformPriceToInteger } from '../transformers';

export class EditProductDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @TransformPriceToInteger()
  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  categoryId?: number;
}

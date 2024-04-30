import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class EditCategoryDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  parentId?: number;
}

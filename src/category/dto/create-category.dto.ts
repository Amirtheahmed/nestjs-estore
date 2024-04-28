import {IsInt, IsOptional, IsString, Min} from "class-validator";

export class CreateCategoryDto {
    @IsString()
    name: string

    @IsString()
    @IsOptional()
    description?: string

    @IsInt()
    @IsOptional()
    @Min(1)
    parentId?: number;
}
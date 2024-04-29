import { IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import {DefaultValuePipe} from "@nestjs/common";

export class PaginationParams {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 50;
}
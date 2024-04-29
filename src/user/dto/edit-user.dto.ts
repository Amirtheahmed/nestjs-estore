import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleSlug } from '../../utils/constants';

export class EditUserDto {
    @IsEmail()
    @IsOptional()
    email?: string

    @IsString()
    @IsOptional()
    firstName?: string

    @IsString()
    @IsOptional()
    lastName?: string

    @IsString()
    @IsOptional()
    password?: string

    @ApiProperty({ example: [RoleSlug.USER, RoleSlug.ADMIN], description: 'Role of the user' })
    @IsEnum(RoleSlug)
    @IsOptional()
    role?: string;
}
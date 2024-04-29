import {IsEmail, IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class SignupDto {
    @ApiProperty({ format: 'email', example: 'user@example.com', description: 'Valid email address' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password', description: 'Password' })
    @IsNotEmpty()
    password: string;
}
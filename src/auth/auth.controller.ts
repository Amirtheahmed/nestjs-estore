import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {AuthService} from "./auth.service";
import {SigninDto, SigninOutputDto, SignupDto, SignupOutputDto} from "./dto";
import {ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {ValidationErrorOutputDto} from "../utils/dto";
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: SigninOutputDto, description: 'Successfully signed in' })
    @ApiBadRequestResponse({ description: 'Validation error', type: ValidationErrorOutputDto })
    @Post('signin')
    signIn(@Body() dto: SigninDto){
        return this.authService.signIn(dto);
    }

    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({ type: SignupOutputDto, description: 'Successfully signed up' })
    @ApiBadRequestResponse({ description: 'Validation error', type: ValidationErrorOutputDto })
    @Post('signup')
    signup(@Body() dto: SignupDto) {
        return this.authService.signup(dto);
    }
}
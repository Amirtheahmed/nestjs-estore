import {Body, Controller, HttpCode, HttpStatus, Post} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {SignUpDto} from "./dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signIn(@Body() dto: SignUpDto){
        return this.authService.signIn(dto);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post('signup')
    signup(@Body() dto: SignUpDto) {
        return this.authService.signup(dto);
    }
}
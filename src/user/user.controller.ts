import {Body, Controller, Get, Patch, Req, UseGuards} from '@nestjs/common';
import {JwtGuard} from "../auth/guard";
import {GetUser} from "../auth/decorators";
import {User} from "@prisma/client";
import {EditUserDto, UserOutputDto} from "./dto";
import {UserService} from "./user.service";
import {ApiBadRequestResponse, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {ValidationErrorOutputDto} from "../utils/dto";
import {SigninOutputDto} from "../auth/dto";
import {plainToInstance} from "class-transformer";
import {CategoryOutputDto} from "../category/dto";

@UseGuards(JwtGuard)
@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}
    @Get('me')
    @ApiOkResponse({ type: UserOutputDto, description: 'User data' })
    getMe(@GetUser() user: UserOutputDto) {
        return plainToInstance(UserOutputDto, user, {
            excludeExtraneousValues: true
        });
    }

    @Patch()
    @ApiOkResponse({ type: UserOutputDto, description: 'User data' })
    @ApiBadRequestResponse({ description: 'Validation error', type: ValidationErrorOutputDto })
    async editUser(@GetUser() user: User, @Body() editUserDto: EditUserDto) {
        return await this.userService.editUser(user.id, editUserDto);
    }
}

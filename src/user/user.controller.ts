import {Body, Controller, Get, Patch, Req, UseGuards} from '@nestjs/common';
import { JwtGuard, RoleGuard } from '../auth/guard';
import { GetUser, Roles } from '../auth/decorators';
import {User} from "@prisma/client";
import {EditUserDto, UserOutputDto} from "./dto";
import {UserService} from "./user.service";
import {ApiBadRequestResponse, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {ValidationErrorOutputDto} from "../utils/dto";
import {plainToInstance} from "class-transformer";
import { RoleSlug } from '../utils/constants';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Users')
@Throttle({})
@UseGuards(JwtGuard, RoleGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}
    @Get('me')
    @Roles(RoleSlug.ADMIN, RoleSlug.USER)
    @ApiOkResponse({ type: UserOutputDto, description: 'User data' })
    getMe(@GetUser() user: UserOutputDto) {
        return plainToInstance(UserOutputDto, user, {
            excludeExtraneousValues: true
        });
    }

    @Patch()
    @Roles(RoleSlug.ADMIN)
    @ApiOkResponse({ type: UserOutputDto, description: 'User data' })
    @ApiBadRequestResponse({ description: 'Validation error', type: ValidationErrorOutputDto })
    async editUser(@GetUser() user: User, @Body() editUserDto: EditUserDto) {
        return await this.userService.editUser(user.id, editUserDto);
    }
}

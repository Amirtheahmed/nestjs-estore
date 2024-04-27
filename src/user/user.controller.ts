import {Body, Controller, Get, Patch, Req, UseGuards} from '@nestjs/common';
import {JwtGuard} from "../auth/guard";
import {GetUser} from "../auth/decorators";
import {User} from "@prisma/client";
import {EditUserDto} from "./dto";
import {UserService} from "./user.service";

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}
    @Get('me')
    getMe(@GetUser() user: User) {
        delete user.hash;
        return user;
    }

    @Patch()
    async editUser(@GetUser() user: User, @Body() editUserDto: EditUserDto) {
        return await this.userService.editUser(user.id, editUserDto);
    }
}

import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";
import {EditUserDto, UserOutputDto} from "./dto";
import {plainToInstance} from "class-transformer";

const argon2 = require('argon2');

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async editUser(userId: number, dto: EditUserDto) {
        let user = await this.prisma.user.findUnique({
                where: {
                id: userId
            }
        })

        if(!user) {
            throw new Error('User not found');
        }

        let hash = user.hash;

        if(dto.password) {
            hash = await  argon2.hash(dto.password);
            delete dto.password;
        }

        user = await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                ...dto,
                hash
            }
        })

        return plainToInstance(UserOutputDto, user, {
            excludeExtraneousValues: true
        });
    }
}
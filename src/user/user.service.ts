import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";
import {EditUserDto} from "./dto";
import argon2 from "argon2";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async editUser(userId: number, dto: EditUserDto) {
        if(dto.password) {
            dto.password = await  argon2.hash(dto.password);
        }

        const user = await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                ...dto
            }
        })

        delete user.hash;

        return user;
    }
}
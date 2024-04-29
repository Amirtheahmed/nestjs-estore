import {ForbiddenException, Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";
import {SigninDto, SignupDto} from "./dto";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";

const argon2 = require('argon2');

@Injectable({})
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {
    }
    async signIn(signInData: SigninDto): Promise<{access_token: string}> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: signInData.email
            }
        })

        if(!user) {
            throw new ForbiddenException('Invalid credentials!');
        }

        if(!await argon2.verify(user.hash, signInData.password)) {
            throw new ForbiddenException('Invalid credentials!');
        }

        const token = await this.signToken(user.id, user.email);
        return {
            access_token: token
        }
    }

    async signup(signupData: SignupDto): Promise<{access_token: string}> {
        const passwordHash = await argon2.hash(signupData.password);

        try {
            const user = await this.prisma.user.create({
                data: {
                    email: signupData.email,
                    hash: passwordHash
                }
            });

            const token = await this.signToken(user.id, user.email);
            return {
                access_token: token
            }
        } catch (error) {
            if(error instanceof PrismaClientKnownRequestError) {
                if(error.code === 'P2002') {
                    throw new ForbiddenException('Credential already taken')
                }
            }

            throw error;
        }
    }

    async signToken(userId: number, email: string): Promise<string> {
        const payload = {
            sub: userId,
            email
        }

        return await this.jwt.signAsync(
            payload,
            {
                secret: this.config.get('JWT_SECRET')
            }
        );
    }
}
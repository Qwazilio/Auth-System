import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {RegisterDto} from "./dto/register.dto";
import * as argon2 from 'argon2';
import {LoginDto} from "./dto/login.dto";
import {PrismaService} from "../prisma/prisma.service";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto): Promise<void> {
        const hash = await argon2.hash(dto.password);
        const exist = await this.prisma.user.findFirst({
            where: {
                OR: [
                    {login: dto.login},
                    {email: dto.email},
                ]
            }
        })
        if (exist) {throw new BadRequestException('User already exists');}
        await this.prisma.user.create({
            data: {
                login: dto.login,
                email: dto.email,
                password: hash,
            }
        })
    }

    async login(dto: LoginDto): Promise<{access_token: string}> {
        const user = await this.prisma.user.findFirst({
            select: {
                id: true,
                login: true,
                password: true
            },
            where: {
                OR: [
                    {login: dto.loginOrEmail},
                    {email: dto.loginOrEmail}
                ]
            }
        });
        if (!user) throw new UnauthorizedException()

        const isVerify = await argon2.verify(user?.password, dto.password)
        if(!isVerify) throw new UnauthorizedException()

        const payload = {
            sub: user.id,
            login: user.login
        };

        return { access_token: this.jwtService.sign(payload)};
    }
}

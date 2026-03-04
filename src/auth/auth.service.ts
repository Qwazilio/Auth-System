import { Injectable } from '@nestjs/common';
import {RegisterDto} from "./dto/register.dto";
import * as argon2 from 'argon2';
import {LoginDto} from "./dto/login.dto";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async register(dto: RegisterDto): Promise<void> {
        const hash = await argon2.hash(dto.password);


    }

    async login(dto: LoginDto): Promise<void> {
        const hash = await this.prisma.user.findUnique({
            select: ['password'],
            where: {
                OR: [
                    {login: dto.loginOrEmail},
                    {email: dto.loginOrEmail}
                ]
            }
        });
        const isValid = await argon2.verify(hash, dto.password);
    }
}

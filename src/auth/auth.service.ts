import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {RegisterDto} from "./dto/register.dto";
import * as argon2 from 'argon2';
import {LoginDto} from "./dto/login.dto";
import {JwtService} from "@nestjs/jwt";
import {UserService} from "../user/user.service";
import {Prisma} from "@prisma/client";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto): Promise<boolean> {
        const exist = await this.userService.findUserByEmailOrLogin({
            email: dto.email,
            login: dto.login,
        });
        if (exist) throw new BadRequestException('User already exists');

        const hash = await argon2.hash(dto.password);
        try {
            await this.userService.createUser({ login: dto.login, email: dto.email, password: hash });
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new BadRequestException('User with this email or login already exists');
            }
            throw e;
        }
        return true;
    }

    async login(dto: LoginDto): Promise<{access_token: string}> {
        const user = await this.userService.findUserByEmailOrLogin({
            login: dto.loginOrEmail,
            email: dto.loginOrEmail
        })
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

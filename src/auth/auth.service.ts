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
            email: dto.email.toLowerCase(),
            login: dto.login.toLowerCase(),
        });
        if (exist) throw new BadRequestException('User already exists');

        const hash = await argon2.hash(dto.password);
        try {
            await this.userService.createUser({ login: dto.login.toLowerCase(), email: dto.email.toLowerCase(), password: hash });
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new BadRequestException('User with this email or login already exists');
            }
            throw e;
        }
        return true;
    }

    async login(dto: LoginDto): Promise<{
        access_token: string,
        refresh_token: string,
    }> {
        const user = await this.userService.findUserByEmailOrLogin({
            login: dto.loginOrEmail.toLowerCase(),
            email: dto.loginOrEmail.toLowerCase(),
        })
        if (!user) throw new UnauthorizedException()

        const isVerify = await argon2.verify(user?.password, dto.password)
        if(!isVerify) throw new UnauthorizedException()

        const payload = {
            sub: user.id,
            login: user.login
        };

        const tokens = await this.getTokens(payload);

        return {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken
        }
    }

    async getTokens(payload : { sub: number, login: string}) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '15m', secret: process.env.JWT_SECRET }),
            this.jwtService.signAsync(payload, { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET }),
        ]);
        return { accessToken, refreshToken };
    }

    async updateRefreshToken(userId: number, refreshToken: string) {
        const hash = await argon2.hash(refreshToken);
        await this.userService.updateUser(userId, {refreshToken: hash} as Prisma.UserUpdateInput);
        return { access_token: hash };
    }
}

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { Prisma } from '@prisma/client';
import { JwtPayloadDto } from '../jwt/dto/payload.dto';
import * as process from 'node:process';

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
      await this.userService.createUser({
        login: dto.login.toLowerCase(),
        email: dto.email.toLowerCase(),
        password: hash,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException(
          'User with this email or login already exists',
        );
      }
      throw e;
    }
    return true;
  }

  async login(dto: LoginDto): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.userService.findUserByEmailOrLogin({
      login: dto.loginOrEmail.toLowerCase(),
      email: dto.loginOrEmail.toLowerCase(),
    });
    if (!user) throw new UnauthorizedException();

    const isVerify = await argon2.verify(user?.password, dto.password);
    if (!isVerify) throw new UnauthorizedException();

    const payload = {
      sub: user.id,
      login: user.login,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });
    await this.userService.updateUser(user.id, {
      refreshToken: refreshToken,
    });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshAccessToken(userId: number, refreshToken: string) {
    try {
      const payload = (await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      })) as unknown as JwtPayloadDto;
      if (payload?.sub !== userId)
        throw new UnauthorizedException("Token doesn't match");

      return this.jwtService.signAsync(payload);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}

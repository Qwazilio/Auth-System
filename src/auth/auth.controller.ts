import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Headers,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Public } from '../common/decorators/public.decorator';
import { UserService } from '../user/user.service';
import * as console from 'node:console';
import type { Request } from 'express';
import { JwtPayloadDto } from '../jwt/dto/payload.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<boolean> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Body() data: { refresh_token: string },
  ) {
    if (!req.user || !data?.refresh_token) throw new UnauthorizedException();
    return this.authService.refreshAccessToken(
      (req.user as JwtPayloadDto).sub,
      data.refresh_token,
    );
  }
}

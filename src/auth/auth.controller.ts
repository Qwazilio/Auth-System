import {Controller, Post} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";
import {JwtService} from "@nestjs/jwt";
import {Public} from "../common/decorators/public.decorator";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Public()
    @Post('register')
    async register(dto: RegisterDto): Promise<boolean> {
        return this.authService.register(dto);
    }

    @Public()
    @Post('login')
    async login(dto: LoginDto): Promise<{access_token: string}> {
        return this.authService.login(dto);
    }
}

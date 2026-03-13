import {Body, Controller, NotFoundException, Post, Headers, Req} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";
import {JwtService} from "@nestjs/jwt";
import {Public} from "../common/decorators/public.decorator";
import {UserService} from "../user/user.service";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private userService: UserService
    ) {}

    @Public()
    @Post('register')
    async register(
        @Body() dto: RegisterDto
    ): Promise<boolean> {
        return this.authService.register(dto);
    }

    @Public()
    @Post('login')
    async login(
        @Body() dto: LoginDto
    ): Promise<{access_token: string}> {
        return this.authService.login(dto);
    }

    @Post('refresh')
    async refreshToken(
        @Req() req: any,
        @Body() refreshToken: string
    ) {
        console.log(req)

        // const user = await this.userService.findUserByRefreshToken(refreshToken);
        // if(!user?.id) throw new NotFoundException("User not found");
        // return this.authService.updateRefreshToken(user.id, refreshToken);
    }
}

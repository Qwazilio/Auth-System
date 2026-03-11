import {Controller, Get, Param, ParseIntPipe, Post} from '@nestjs/common';
import {UserService} from "./user.service";
import {Public} from "../common/decorators/public.decorator";
import {LoginDto} from "../auth/dto/login.dto";
import {User} from "@prisma/client";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Public()
    @Get(':id')
    async getUser(@Param('id', ParseIntPipe) id: number): Promise<Partial<User>> {
        return this.userService.getUser(id);
    }
}

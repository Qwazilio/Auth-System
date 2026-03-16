import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get(':id')
  // async getUser(@Param('id', ParseIntPipe) id: number): Promise<Partial<User>> {
  //   return this.userService.getUser(id);
  // }
}

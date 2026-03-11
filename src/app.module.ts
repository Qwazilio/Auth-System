import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import {APP_GUARD} from "@nestjs/core";
import {JwtAuthGuard} from "./auth/auth.guard";
import {JwtStrategy} from "./common/jwt.strategy";
import {ConfigModule} from "@nestjs/config";


@Module({
  imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      PrismaModule,
      AuthModule,
      UserModule,

  ],
  controllers: [AppController],
  providers: [
      PrismaService,
      JwtStrategy, //Не забывать зарегать стратежи
      {
        provide: APP_GUARD,
        useValue: JwtAuthGuard,
      },
      AppService,
  ],
})
export class AppModule {}

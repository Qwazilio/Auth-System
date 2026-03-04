import {Global, Module} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Global() //Глобальное использование без импортов
@Module({
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}

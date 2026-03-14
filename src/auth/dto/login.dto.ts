import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  loginOrEmail: string;

  @IsNotEmpty()
  @MinLength(12)
  password: string;
}

import {IsEmail, IsNotEmpty, IsString, MinLength} from "class-validator";

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    loginOrEmail: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}
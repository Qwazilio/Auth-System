import {IsEmail, IsString, MinLength} from "class-validator";

export class RegisterDto {
    @IsString()
    @MinLength(4)
    login: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}
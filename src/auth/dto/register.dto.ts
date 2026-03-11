import {IsEmail, IsString, Matches, MinLength} from "class-validator";

export class RegisterDto {
    @IsString()
    @MinLength(4)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Login can only contain letters, numbers and underscores, no dots',
    })
    login: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(12)
    password: string;
}
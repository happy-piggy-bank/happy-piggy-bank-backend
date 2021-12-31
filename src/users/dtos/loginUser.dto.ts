import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly userEmail: string;

    @IsNotEmpty()
    @IsString()
    readonly userPw: string;
}
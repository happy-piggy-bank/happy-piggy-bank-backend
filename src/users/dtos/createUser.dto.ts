import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly userEmail: string;

    @IsNotEmpty()
    @IsString()
    readonly userPw: string;

    @IsNotEmpty()
    @IsString()
    readonly userName: string;
}
import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    readonly userPw: string;

    // @IsOptional()
    // @IsString()
    // readonly userName: string;
}
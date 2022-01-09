import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.trim())
    readonly userPw: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.trim())
    readonly userName: string;
}
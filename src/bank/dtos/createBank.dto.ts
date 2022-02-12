import { IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";

export class CreateBankDto {
    @IsNotEmpty()
    @IsString()
    bankTitle: string;

    @IsNotEmpty()
    @IsString()
    bankContents: string;

    @IsNotEmpty()
    @IsNumberString()
    bankAmount: number;

    @IsOptional()
    file?: Express.Multer.File;
}
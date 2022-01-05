import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateBankDto {
    @IsNotEmpty()
    @IsString()
    bankTitle: string;

    @IsNotEmpty()
    @IsString()
    bankContents: string;

    @IsNotEmpty()
    @IsNumber()
    bankAmount: number;
}
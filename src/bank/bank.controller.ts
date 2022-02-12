import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { BankService } from './bank.service';
import { CreateBankDto } from './dtos/createBank.dto';

@Controller('bank')
export class BankController {
    constructor(
        private readonly bankService: BankService
    ) {}

    @Get('total-stats')
    async getTotalStatistics(@Res() res: Response) {
        const result = await this.bankService.getTotalStatistics();
        return res.status(result.statusCode).send(result);
    }

    @Get('this-year')
    async getThisYearBankList(@Query('currentPage', ParseIntPipe) currentPage: number, @Res() res: Response) {
        const result = await this.bankService.getThisYearBankList(res.locals.userId, currentPage);
        return res.status(result.statusCode).send(result);
    }

    @Get('old-list')
    async getOldBankList(@Res() res: Response, @Query('year', ParseIntPipe) year?: number, @Query('currentPage', ParseIntPipe) currentPage?: number) {
        const result = await this.bankService.getOldBankList(res.locals.userId, year, currentPage);
        return res.status(result.statusCode).send(result);
    }

    @Get('year-list')
    async getYearList(@Res() res: Response) {
        const result = await this.bankService.getYearList(res.locals.userId);
        return res.status(result.statusCode).send(result);
    }

    @Post('new')
    @UseInterceptors(FileInterceptor('file'))
    async createBank(@Body() createBankDto: CreateBankDto, @UploadedFile('file') uploadedFile: Express.Multer.File, @Res() res: Response) {
        const result = await this.bankService.createBank(createBankDto, uploadedFile, res.locals.userId);
        return res.status(result.statusCode).send(result);
    }

    @Delete('remove/:bankId')
    async deleteBank(@Param('bankId', ParseIntPipe) bankId: number, @Res() res: Response) {
        const result = await this.bankService.deleteBank(bankId, res.locals.userId);
        return res.status(result.statusCode).send(result);
    }

    @Get('detail/:bankId')
    async getBankDetail(@Param('bankId', ParseIntPipe) bankId: number, @Res() res: Response) {
        const result = await this.bankService.getBankDetail(res.locals.userId, bankId);
        return res.status(result.statusCode).send(result);
    }
}

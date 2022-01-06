import { Controller, Delete, Get, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { BankService } from './bank.service';
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
    async getThisYearBankList(@Req() req: Request | any, @Res() res: Response) {
        const result = await this.bankService.getThisYearBankList(res.locals.userId, req.query.currentPage);
        return res.status(result.statusCode).send(result);
    }

    @Get('old-list')
    async getOldBankList(@Req() req: Request | any, @Res() res: Response) {
        const result = await this.bankService.getOldBankList(res.locals.userId, req.query.year, req.query.currentPage);
        return res.status(result.statusCode).send(result);
    }

    @Get('year-list')
    async getYearList(@Req() req: Request, @Res() res: Response) {
        const result = await this.bankService.getYearList(res.locals.userId);
        return res.status(result.statusCode).send(result);
    }

    @Post('new')
    @UseInterceptors(FileInterceptor('file'))
    async createBank(@Req() req: Request, @Res() res: Response, @UploadedFile() file: Express.Multer.File) {
        const result = await this.bankService.createBank(req.body, file, res.locals.userId);
        return res.status(result.statusCode).send(result);
    }

    @Delete('remove/:bankId')
    async deleteBank(@Req() req: Request | any, @Res() res: Response) {
        const result = await this.bankService.deleteBank(req.params.bankId, res.locals.userId);
        return res.status(result.statusCode).send(result);
    }

    @Get('detail/:bankId')
    async getBankDetail(@Req() req: Request | any, @Res() res: Response) {
        const result = await this.bankService.getBankDetail(res.locals.userId, req.params.bankId);
        return res.status(result.statusCode).send(result);
    }
}

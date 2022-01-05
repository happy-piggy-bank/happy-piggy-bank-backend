import { Controller, Delete, Get, Post, Req, Res } from '@nestjs/common';
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
    async getThisYearBankList(@Req() req: Request, @Res() res: Response) {}

    @Get('old-list')
    async getOldBankList(@Req() req: Request, @Res() res: Response) {}

    @Get('year-list')
    async getYearList(@Req() req: Request, @Res() res: Response) {}

    @Post('new')
    async createBank(@Req() req: Request, @Res() res: Response) {
        const result = await this.bankService.createBank(req.body, res.locals.userId);
        return res.status(result.statusCode).send(result);
    }

    @Delete('remove/:bankId')
    async deleteBank(@Req() req: Request | any, @Res() res: Response) {
        const result = await this.bankService.deleteBank(req.params.bankId, res.locals.userId);
        return res.status(result.statusCode).send(result);
    }

    @Get('detail/:bankId')
    async getBankDetail(@Req() req: Request, @Res() res: Response) {}
}

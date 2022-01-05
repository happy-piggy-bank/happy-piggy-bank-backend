import { Controller, Delete, Get, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { BankService } from './bank.service';
import * as multerS3 from 'multer-s3';
import * as AWS from 'aws-sdk';
import { FileInterceptor } from '@nestjs/platform-express';

const s3 = new AWS.S3();

@Controller('bank')
export class BankController {
    constructor(
        private readonly bankService: BankService
    ) {}

    @Get('total-stats')
    async getTotalStatistics(@Req() req: Request, @Res() res: Response) {}

    @Get('this-year')
    async getThisYearBankList(@Req() req: Request, @Res() res: Response) {}

    @Get('old-list')
    async getOldBankList(@Req() req: Request, @Res() res: Response) {}

    @Get('year-list')
    async getYearList(@Req() req: Request, @Res() res: Response) {}

    @Post('new')
    @UseInterceptors(FileInterceptor('file', {
        storage: multerS3({
            s3: s3,
            bucket: 'happypiggybank-attachments',
            acl: 'public-read',
            key: function(req, file, cb) {
                cb(null, `${Date.now().toString()}-${file.originalname}`)
            }
        })
    }))
    async createBank(@Req() req: Request, @Res() res: Response, @UploadedFile() file: Express.MulterS3.File) {
        const result = await this.bankService.createBank(file, req.body, res.locals.userId);
        return res.status(result.statusCode).send(result);
    }

    @Delete('remove')
    async deleteBank(@Req() req: Request, @Res() res: Response) {}

    @Get('detail/:bankId')
    async getBankDetail(@Req() req: Request, @Res() res: Response) {}
}

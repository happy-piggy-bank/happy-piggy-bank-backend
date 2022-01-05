import { Controller, Delete, Get, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { BankService } from './bank.service';
import * as multerS3 from 'multer-s3';
import * as AWS from 'aws-sdk';
import { FileInterceptor } from '@nestjs/platform-express';

AWS.config.update({
    "accessKeyId": process.env.AWS_ACCESS_KEY_ID,
    "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY,
    "region": process.env.AWS_REGION
});

const s3 = new AWS.S3();

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

    @Delete('remove/:bankId')
    async deleteBank(@Req() req: Request | any, @Res() res: Response) {
        const result = await this.bankService.deleteBank(req.params.bankId, res.locals.userId);
        return res.status(result.statusCode).send(result);
    }

    @Get('detail/:bankId')
    async getBankDetail(@Req() req: Request, @Res() res: Response) {}
}

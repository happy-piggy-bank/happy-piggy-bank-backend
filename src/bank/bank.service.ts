import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PiggyBank } from 'src/entities/piggyBank.entity';
import { getRepository, Repository } from 'typeorm';
import { CreateBankDto } from './dtos/createBank.dto';
import * as AWS from 'aws-sdk';
import { User } from 'src/entities/user.entity';

AWS.config.update({
    "accessKeyId": process.env.AWS_ACCESS_KEY_ID,
    "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY,
    "region": process.env.AWS_REGION
});

const s3 = new AWS.S3();
@Injectable()
export class BankService {
    constructor(
        @InjectRepository(PiggyBank)
        private readonly banks: Repository<PiggyBank>,
        @InjectRepository(User)
        private readonly users: Repository<User>
    ) {}

    async getTotalStatistics() {
        try {
            const totalUserCount = await this.users.count();
            const totalBankCount = await this.banks.count();
            const totalBankAmount = await getRepository(PiggyBank)
                .createQueryBuilder("piggy_bank")
                .select("SUM(piggy_bank.bankAmount)", "sum")
                .getRawOne();
            return {
                statusCode: HttpStatus.OK,
                result: "success",
                message: "유저 전체 통계 조회 성공",
                data: {
                    totalUserCount,
                    totalBankCount,
                    totalBankAmount: null ? 0 : Number(totalBankAmount.sum)
                }
            }
        } catch (err) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                result: "internal_server_error",
                message: "서버 에러",
                error: err
            };
        }
    }

    async createBank(file: Express.MulterS3.File, createData: CreateBankDto, userId: number) {
        try {
            const createResult = await this.banks.save({ ...createData, contentsImg: file.location, userId });
            return {
                statusCode: HttpStatus.CREATED,
                result: "bank_create_success",
                data: createResult
            }
        } catch (err) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                result: "internal_server_error",
                message: "서버 에러",
                error: err
            };
        }
    }
}

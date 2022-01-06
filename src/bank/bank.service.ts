import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PiggyBank } from 'src/entities/piggyBank.entity';
import { getRepository, Repository } from 'typeorm';
import { CreateBankDto } from './dtos/createBank.dto';
import { User } from 'src/entities/user.entity';
import { FileService } from 'src/utils/file.service';
@Injectable()
export class BankService {
    constructor(
        @InjectRepository(PiggyBank)
        private readonly banks: Repository<PiggyBank>,
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly fileService: FileService
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

    async createBank(createData: CreateBankDto, file: Express.Multer.File, userId: number) {
        let contentsImg = null;
        try {
            if (file) contentsImg = await this.fileService.upload(file);
            await this.banks.save({ ...createData, contentsImg, userId });
            return {
                statusCode: HttpStatus.CREATED,
                result: "bank_create_success",
                message: "저금 내역 등록 성공"
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

    async deleteBank(bankId: number, userId: number) {
        try {
            const bankInfo = await this.banks.findOne({ id: bankId, userId: userId });
            if (!bankInfo) {
                return {
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    result: "bank_not_found",
                    message: "해당 내역 없음"
                }
            } else {
                await this.banks.delete({ id: bankId, userId: userId });
                return {
                    statusCode: HttpStatus.OK,
                    result: "bank_delete_success",
                    message: "저금 내역 삭제 성공"
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
}

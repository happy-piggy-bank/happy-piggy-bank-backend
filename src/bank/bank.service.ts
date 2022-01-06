import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PiggyBank } from 'src/entities/piggyBank.entity';
import { Between, getRepository, LessThanOrEqual, Repository } from 'typeorm';
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
                if (bankInfo.contentsImg) await this.fileService.delete(bankInfo.contentsImg);
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

    async getYearList(userId: number) {
        let yearList = [];
        try {
            const yearRawData = await getRepository(PiggyBank)
                .createQueryBuilder("piggy_bank")
                .select("MIN(piggy_bank.regDt)", "date")
                .where({ userId: userId })
                .getRawOne();
            const oldestYear = yearRawData.date.getFullYear();
            const thisYear = new Date().getFullYear();
            for (let i = thisYear - 1; i >= oldestYear; i--) {
                yearList.push({ value: i, label: `${i}년` });
            }
            return {
                statusCode: HttpStatus.OK,
                result: "success",
                message: "연도 리스트 조회 성공",
                data: yearList
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

    async getThisYearBankList(userId: number, currentPage: number=0) {
        try {
            const entriesPerPage = 10;
            const thisYear = new Date().getFullYear();
            const yearCondition = Between(`${thisYear}-01-01`, `${thisYear}-12-31`);
            const totalAmount = await getRepository(PiggyBank)
                .createQueryBuilder("piggy_bank")
                .select("SUM(piggy_bank.bankAmount)", "sum")
                .where([
                    { userId: userId },
                    { regDt: yearCondition }
                ])
                .getRawOne();
            const totalCount = await this.banks.count({
                where: [
                    { userId: userId },
                    { regDt: yearCondition }
                ]
            });
            const bankList = await this.banks.find({
                where: [
                    { userId: userId },
                    { regDt: yearCondition }
                ],
                skip: currentPage * entriesPerPage,
                take: entriesPerPage,
                select: ['id', 'bankAmount', 'regDt'],
                order: { regDt: 'DESC' }
            });
            return {
                statusCode: HttpStatus.OK,
                result: "success",
                message: "조회 성공",
                data: {
                    totalCount,
                    totalAmount: Number(totalAmount.sum),
                    bankList
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

    async getOldBankList(userId: number, year?: number, currentPage: number=0) {
        try {
            const entriesPerPage = 10;
            const thisYear = new Date().getFullYear();
            let yearCondition = null;
            if (year == thisYear) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    result: "this_year_blocked",
                    message: "올해 리스트 조회 불가"
                }
            } else {
                if (year) {
                    yearCondition = Between(`${year}-01-01`, `${year}-12-31`);
                } else {
                    yearCondition = LessThanOrEqual(`${thisYear-1}-12-31`);
                }
                const totalAmount = await getRepository(PiggyBank)
                    .createQueryBuilder("piggy_bank")
                    .select("SUM(piggy_bank.bankAmount)", "sum")
                    .where([
                        { userId: userId },
                        { regDt: yearCondition }
                    ])
                    .getRawOne();
                const totalCount = await this.banks.count({
                    where: [
                        { userId: userId },
                        { regDt: yearCondition }
                    ]
                });
                const bankList = await this.banks.find({
                    where: [
                        { userId: userId },
                        { regDt: yearCondition }
                    ],
                    skip: currentPage * entriesPerPage,
                    take: entriesPerPage,
                    select: ['id', 'bankAmount', 'regDt'],
                    order: { regDt: 'DESC' }
                });
                return {
                    statusCode: HttpStatus.OK,
                    result: "success",
                    message: "조회 성공",
                    data: {
                        totalCount,
                        totalAmount: Number(totalAmount.sum),
                        bankList
                    }
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

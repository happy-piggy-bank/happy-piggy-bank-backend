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
            const totalStatistics = await getRepository(PiggyBank)
                .createQueryBuilder("piggy_bank")
                .select([
                    "COUNT(*) AS count",
                    "SUM(piggy_bank.bankAmount) AS sum"
                ])
                .where(`piggy_bank.userId = ${userId}`)
                .andWhere(`YEAR(piggy_bank.regDt) = ${thisYear}`)
                .getRawOne();
            const bankList = await getRepository(PiggyBank)
                .createQueryBuilder("piggy_bank")
                .select([
                    "piggy_bank.id AS id",
                    "piggy_bank.contentsImg AS contentsImg",
                    "piggy_bank.bankAmount AS bankAmount",
                    "piggy_bank.regDt AS regDt"
                ])
                .where(`piggy_bank.userId = ${userId}`)
                .andWhere(`YEAR(piggy_bank.regDt) = ${thisYear}`)
                .skip(currentPage * entriesPerPage)
                .take(entriesPerPage)
                .orderBy("piggy_bank.regDt", "DESC")
                .getRawMany();
            return {
                statusCode: HttpStatus.OK,
                result: "success",
                message: "조회 성공",
                data: {
                    totalCount: Number(totalStatistics.count),
                    totalAmount: Number(totalStatistics.sum),
                    currentPage: Number(currentPage) + 1,
                    totalPage: Math.ceil(totalStatistics.count / entriesPerPage),
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
            if (year >= thisYear) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    result: "this_year_blocked",
                    message: "올해 리스트 조회 불가"
                }
            } else {
                if (year) {
                    yearCondition = `YEAR(piggy_bank.regDt) = ${year}`
                } else {
                    yearCondition = `YEAR(piggy_bank.regDt) <= ${thisYear-1}`
                }
                const totalStatistics = await getRepository(PiggyBank)
                    .createQueryBuilder("piggy_bank")
                    .select([
                        "COUNT(*) AS count",
                        "SUM(piggy_bank.bankAmount) AS sum"
                    ])
                    .where(`piggy_bank.userId = ${userId}`)
                    .andWhere(yearCondition)
                    .getRawOne();
                const bankList = await getRepository(PiggyBank)
                    .createQueryBuilder("piggy_bank")
                    .select([
                        "piggy_bank.id AS id",
                        "piggy_bank.contentsImg AS contentsImg",
                        "piggy_bank.bankAmount AS bankAmount",
                        "piggy_bank.regDt AS regDt"
                    ])
                    .where(`piggy_bank.userId = ${userId}`)
                    .andWhere(yearCondition)
                    .skip(currentPage * entriesPerPage)
                    .take(entriesPerPage)
                    .orderBy("piggy_bank.regDt", "DESC")
                    .getRawMany();
                return {
                    statusCode: HttpStatus.OK,
                    result: "success",
                    message: "조회 성공",
                    data: {
                        totalCount: Number(totalStatistics.count),
                        totalAmount: Number(totalStatistics.sum),
                        currentPage: Number(currentPage) + 1,
                        totalPage: Math.ceil(totalStatistics.count / entriesPerPage),
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

    async getBankDetail(userId: number, bankId: number) {
        try {
            let bankDetail = await this.banks.findOne({ id: bankId }, {
                select: ['id', 'userId', 'bankTitle', 'bankContents', 'bankAmount', 'contentsImg', 'regDt']
            });
            
            if (!bankDetail) {
                return {
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    result: "record_not_found",
                    message: "해당 내역 찾을 수 없음"
                }
            } else {
                if (userId !== bankDetail.userId) {
                    return {
                        statusCode: HttpStatus.UNAUTHORIZED,
                        result: "bank_is_not_mine",
                        message: "권한 없음"
                    }
                }

                delete bankDetail.userId;

                return {
                    statusCode: HttpStatus.OK,
                    result: "success",
                    message: "조회 성공",
                    data: bankDetail
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

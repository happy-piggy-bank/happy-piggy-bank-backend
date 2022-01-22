import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PiggyBank } from 'src/entities/piggyBank.entity';
import { getRepository, Repository } from 'typeorm';
import { CreateBankDto } from './dtos/createBank.dto';
import { User } from 'src/entities/user.entity';
import { FileService } from 'src/utils/file.service';
import httpResponse from '../utils/httpResponse'
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
                ...httpResponse.OK,
                data: {
                    totalUserCount,
                    totalBankCount,
                    totalBankAmount: null ? 0 : Number(totalBankAmount.sum)
                }
            }
        } catch (err) {
            return {
                ...httpResponse.INTERNAL_SERVER_ERROR,
                error: err
            };
        }
    }

    async createBank(createData: CreateBankDto, file: Express.Multer.File, userId: number) {
        let contentsImg = null;
        try {
            if (file) contentsImg = await this.fileService.upload(file);
            await this.banks.save({ ...createData, contentsImg, userId });
            return httpResponse.CREATED;
        } catch (err) {
            return {
                ...httpResponse.INTERNAL_SERVER_ERROR,
                error: err
            };
        }
    }

    async deleteBank(bankId: number, userId: number) {
        try {
            const bankInfo = await this.banks.findOne({ id: bankId, userId: userId });
            if (!bankInfo) {
                return {
                    ...httpResponse.UNPROCESSABLE_ENTITY,
                    result: "bank_not_found"
                }
            } else {
                if (bankInfo.contentsImg) await this.fileService.delete(bankInfo.contentsImg);
                await this.banks.delete({ id: bankId, userId: userId });
                return httpResponse.OK;
            }
        } catch (err) {
            return {
                ...httpResponse.INTERNAL_SERVER_ERROR,
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
                ...httpResponse.OK,
                data: yearList
            }
        } catch (err) {
            return {
                ...httpResponse.INTERNAL_SERVER_ERROR,
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
                ...httpResponse.OK,
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
                ...httpResponse.INTERNAL_SERVER_ERROR,
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
                    ...httpResponse.BAD_REQUEST,
                    result: "this_year_blocked"
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
                    ...httpResponse.OK,
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
                ...httpResponse.INTERNAL_SERVER_ERROR,
                error: err
            };
        }
    }

    async getBankDetail(userId: number, bankId: number) {
        try {
            const thisYear = new Date().getFullYear();
            const thisMonth = new Date().getMonth();
            let bankDetail = await this.banks.findOne({ id: bankId }, {
                select: ['id', 'userId', 'bankTitle', 'bankContents', 'bankAmount', 'contentsImg', 'regDt']
            });
            if (!bankDetail) {
                return {
                    ...httpResponse.UNPROCESSABLE_ENTITY,
                    result: "record_not_found"
                }
            } else {
                if (userId !== bankDetail.userId) {
                    return {
                        ...httpResponse.UNAUTHORIZED,
                        result: "bank_is_not_mine"
                    }
                }

                delete bankDetail.userId;

                const dataYear = new Date(bankDetail.regDt).getFullYear();
                if (thisYear === dataYear && thisMonth < 12) {
                    return {
                        ...httpResponse.BAD_REQUEST,
                        result: "not_yet_open"
                    }
                } else {
                    return {
                        ...httpResponse.OK,
                        data: bankDetail
                    }
                }
            }
        } catch (err) {
            return {
                ...httpResponse.INTERNAL_SERVER_ERROR,
                error: err
            };
        }
    }
}

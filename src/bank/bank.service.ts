import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBankDto } from './dtos/createBank.dto';
import { FileService } from 'src/utils/file.service';
import httpResponse from '../utils/httpResponse'
import { BankRepository } from './bank.repository';
import { UserRepository } from 'src/users/users.repository';
@Injectable()
export class BankService {
    constructor(
        @InjectRepository(BankRepository)
        private readonly bankRepository: BankRepository,
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository,
        private readonly fileService: FileService
    ) {}

    async getTotalStatistics() {
        try {
            const totalUserCount = await this.userRepository.count();
            const totalBankCount = await this.bankRepository.count();
            const totalBankAmount = await this.bankRepository.getTotalBankAmount();
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
            await this.bankRepository.save({ ...createData, contentsImg, userId });
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
            const bankInfo = await this.bankRepository.findOne({ id: bankId, userId: userId });
            if (!bankInfo) {
                return {
                    ...httpResponse.UNPROCESSABLE_ENTITY,
                    result: "bank_not_found"
                }
            } else {
                if (bankInfo.contentsImg) await this.fileService.delete(bankInfo.contentsImg);
                await this.bankRepository.delete({ id: bankId, userId: userId });
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
            const yearRawData = await this.bankRepository.getYearRawData(userId);
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
        const entriesPerPage = 10;

        try {
            const totalStatistics = await this.bankRepository.getUserBankStatistics(userId);
            const bankList = await this.bankRepository.getThisYearBankList(userId, currentPage, entriesPerPage);
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
            if (year >= thisYear) {
                return {
                    ...httpResponse.BAD_REQUEST,
                    result: "this_year_blocked"
                }
            } else {
                const totalStatistics = await this.bankRepository.getOldBankStatistics(userId, year);
                const bankList = await this.bankRepository.getOldBankList(userId, currentPage, entriesPerPage, year);
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
            let bankDetail = await this.bankRepository.findOne({ id: bankId }, {
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

import { PiggyBank } from "src/entities/piggyBank.entity";
import { EntityRepository, getRepository, Repository } from "typeorm";

@EntityRepository(PiggyBank)
export class BankRepository extends Repository<PiggyBank> {
    async getTotalBankAmount(): Promise<any> {
        return await getRepository(PiggyBank)
            .createQueryBuilder("piggy_bank")
            .select("SUM(piggy_bank.bankAmount)", "sum")
            .getRawOne();
    }

    async getYearRawData(userId: number): Promise<any> {
        return await getRepository(PiggyBank)
            .createQueryBuilder("piggy_bank")
            .select("MIN(piggy_bank.regDt)", "date")
            .where({ userId })
            .getRawOne();
    }

    async getUserBankStatistics(userId: number): Promise<any> {
        const thisYear = new Date().getFullYear();
        return await getRepository(PiggyBank)
            .createQueryBuilder("piggy_bank")
            .select([
                "COUNT(*) AS count",
                "SUM(piggy_bank.bankAmount) AS sum"
            ])
            .where(`piggy_bank.userId = ${userId}`)
            .andWhere(`YEAR(piggy_bank.regDt) = ${thisYear}`)
            .getRawOne();
    }

    async getThisYearBankList(userId: number, currentPage: number=0, entriesPerPage: number=10): Promise<any> {
        const thisYear = new Date().getFullYear();
        return await getRepository(PiggyBank)
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
    }

    async getOldBankStatistics(userId: number, year?: number): Promise<any> {
        const thisYear = new Date().getFullYear();
        const yearCondition = year ? `YEAR(piggy_bank.regDt) = ${year}` : `YEAR(piggy_bank.regDt) <= ${thisYear-1}`;
        return await getRepository(PiggyBank)
            .createQueryBuilder("piggy_bank")
            .select([
                "COUNT(*) AS count",
                "SUM(piggy_bank.bankAmount) AS sum"
            ])
            .where(`piggy_bank.userId = ${userId}`)
            .andWhere(yearCondition)
            .getRawOne();
    }

    async getOldBankList(userId: number, currentPage: number=0, entriesPerPage: number=10, year?: number): Promise<any> {
        const thisYear = new Date().getFullYear();
        const yearCondition = year ? `YEAR(piggy_bank.regDt) = ${year}` : `YEAR(piggy_bank.regDt) <= ${thisYear-1}`;
        return await getRepository(PiggyBank)
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
    }
}
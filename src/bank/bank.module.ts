import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PiggyBank } from 'src/entities/piggyBank.entity';
import { User } from 'src/entities/user.entity';
import { FileService } from 'src/utils/file.service';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';

@Module({
  imports: [TypeOrmModule.forFeature([PiggyBank, User])],
  controllers: [BankController],
  providers: [BankService, FileService],
  exports: [BankService]
})
export class BankModule {}

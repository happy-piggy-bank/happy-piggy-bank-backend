import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PiggyBank } from 'src/entities/piggyBank.entity';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';

@Module({
  imports: [TypeOrmModule.forFeature([PiggyBank])],
  controllers: [BankController],
  providers: [BankService],
  exports: [BankService]
})
export class BankModule {}

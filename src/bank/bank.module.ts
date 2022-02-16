import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/users/users.repository';
import { FileService } from 'src/utils/file.service';
import { BankController } from './bank.controller';
import { BankRepository } from './bank.repository';
import { BankService } from './bank.service';

@Module({
  imports: [TypeOrmModule.forFeature([BankRepository, UserRepository])],
  controllers: [BankController],
  providers: [BankService, FileService],
  exports: [BankService]
})
export class BankModule {}

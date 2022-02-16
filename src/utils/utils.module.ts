import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/users/users.repository';
import { FileService } from './file.service';
import { JwtService } from './jwt.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserRepository])],
    providers: [JwtService, FileService],
    exports: [JwtService, FileService]
})
export class CommonUtilModule {}

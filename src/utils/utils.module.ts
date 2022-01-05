import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { FileService } from './file.service';
import { JwtService } from './jwt.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [JwtService, FileService],
    exports: [JwtService, FileService]
})
export class CommonUtilModule {}

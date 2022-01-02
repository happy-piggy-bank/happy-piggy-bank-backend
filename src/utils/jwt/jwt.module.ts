import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { JwtService } from './jwt.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [JwtService],
    exports: [JwtService]
})
export class JwtModule {}

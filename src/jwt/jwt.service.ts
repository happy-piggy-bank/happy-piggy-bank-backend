import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>
    ) {}

    async getJwtToken(userId: number) {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET);
        await this.users.update({ id: userId }, { authToken: token });
        return token;
    }

    async verifyJwtToken(token: string) {
        try {
            const verifyResult = jwt.verify(token, process.env.JWT_SECRET);
            if (!verifyResult['userId']) {
                return 'INVALID';
            } else {
                const checkResult = await this.users.count({ authToken: token });
                if (checkResult > 0) {
                    return verifyResult['userId'];
                } else {
                    return 'INVALID';
                }
            }
        } catch (err) {
            return 'INVALID';
        }
    }
}

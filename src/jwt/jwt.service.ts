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
        await this.users.update({ id: userId }, { authToken: token })
        return token;
    }

    async verifyJwtToken(token: string) {
        let result = '';
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err || !decoded.userId) {
                result = 'INVALID';
            } else {
                const checkResult = await this.users.count({ id: decoded.userId, authToken: token })
                if (checkResult <= 0) {
                    result = 'INVALID';
                } else {
                    result = decoded.userId;
                }
            }
        })
        return result;
    }
}

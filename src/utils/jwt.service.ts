import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { v5 as uuid } from 'uuid';
import { UserRepository } from 'src/users/users.repository';

@Injectable()
export class JwtService {
    constructor(
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository
    ) {}

    async getJwtToken(userId: number) {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '6h' });
        await this.userRepository.update({ id: userId }, { authToken: token, uuid: uuid(String(userId), uuid.URL) });
        return token;
    }

    async verifyJwtToken(token: string) {
        try {
            const verifyResult = jwt.verify(token, process.env.JWT_SECRET);
            if (!verifyResult['userId']) {
                return 'INVALID';
            } else {
                const checkResult = await this.userRepository.count({ authToken: token, uuid: uuid(String(verifyResult['userId']), uuid.URL) });
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

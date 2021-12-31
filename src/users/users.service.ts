import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>
    ) {}
    
    async createUser(userData: CreateUserDto) {
        try {
            const checkEmailDuplicates = await this.users.count({ userEmail: userData.userEmail });
            if (checkEmailDuplicates > 0) {
                return {
                    statusCode: HttpStatus.CONFLICT,
                    result: "email_duplicates",
                    message: "이메일 중복"
                }
            }

            const checkUserNameDuplicates = await this.users.count({ userName: userData.userName });
            if (checkUserNameDuplicates > 0) {
                return {
                    statusCode: HttpStatus.CONFLICT,
                    result: "user_name_duplicates",
                    message: "사용자 이름 중복"
                }
            }
            
            const newUserData = {
                ...userData,
                userNum: String(Math.floor(Math.random() * (9999999999 - 1000000000) + 1000000000)),
                userPw: createHmac('sha256', 'secret').update(userData.userPw).digest('hex')
            }
    
            await this.users.save(newUserData);

            return {
                statusCode: HttpStatus.CREATED,
                result: "success",
                message: "회원가입에 성공하였습니다."
            }
        } catch (err) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                result: "internal_server_error",
                message: "서버 에러",
                error: err
            };
        }
    }
}

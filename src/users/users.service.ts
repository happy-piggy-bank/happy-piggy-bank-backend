import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { User } from 'src/entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly jwtService: JwtService 
    ) {}

    async loginUser(loginData: LoginUserDto) {
        try {
            const userInfo = await this.users.findOne({
                userEmail: loginData.userEmail,
                userPw: createHmac('sha256', 'secret').update(loginData.userPw).digest('hex')
            }, {
                select: ['id', 'userNum', 'userEmail', 'userName']
            })
            if (!userInfo) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    result: "login_fail",
                    message: "로그인 실패"
                }
            } else {
                const token = await this.jwtService.getJwtToken(userInfo.id);
                return {
                    statusCode: HttpStatus.OK,
                    result: "login_success",
                    message: "로그인 성공",
                    data: { ...userInfo, token }
                }
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
    
            const createResult = await this.users.save(newUserData);
            const token = await this.jwtService.getJwtToken(createResult.id);
            const userInfo = await this.users.findOne({ id: createResult.id }, { select: ['userNum', 'userEmail', 'userName'] });
            return {
                statusCode: HttpStatus.CREATED,
                result: "success",
                message: "회원가입에 성공하였습니다.",
                data: {...userInfo, token }
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

    async logoutUser(userId: number) {
        try {
            await this.users.update({ id: userId }, { authToken: null });
            return {
                statusCode: HttpStatus.OK,
                result: "logout_success",
                message: "로그아웃 성공"
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

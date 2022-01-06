import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { User } from 'src/entities/user.entity';
import { JwtService } from 'src/utils/jwt.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';

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
                select: ['userNum', 'userEmail', 'userName']
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

    async getUser(userId: number) {
        try {
            const userInfo = await this.users.findOne({ id: userId }, { select: ['userEmail', 'userName'] });
            if (!userInfo) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    result: "user_not_found",
                    message: "해당 유저 없음"
                }
            } else {
                return {
                    statusCode: HttpStatus.OK,
                    result: "success",
                    message: "유저 정보 조회 성공",
                    data: userInfo
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

    async updateUser(updateData: UpdateUserDto, userId: number) {
        let updateResult = {};

        try {
            if (updateData.userName) {
                const checkUserNameDuplicates = await this.users.count({ userName: updateData.userName });
                if (checkUserNameDuplicates > 0) {
                    return {
                        statusCode: HttpStatus.CONFLICT,
                        result: "user_name_duplicates",
                        message: "사용자 이름 중복"
                    }
                } else {
                    Object.assign(updateResult, { userName: updateData.userName });
                }
            }

            if (updateData.userPw) {
                const newPw = createHmac('sha256', 'secret').update(updateData.userPw).digest('hex');
                const checkPw = await this.users.count({ id: userId, userPw: newPw });
                if (checkPw > 0) {
                    return {
                        statusCode: HttpStatus.CONFLICT,
                        result: "same_password",
                        message: "기존 비밀번호와 동일한 비밀번호"
                    }
                } else {
                    Object.assign(updateResult, { userPw: newPw });
                }
            }

            if (Object.keys(updateResult).length > 0) {
                await this.users.update({ id: userId }, updateResult);
            }

            return {
                statusCode: HttpStatus.OK,
                result: "user_update_success",
                message: "사용자 정보 업데이트 성공"
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

    async deleteUser(userId: number) {
        try {
            await this.users.delete({ id: userId });
            return {
                statusCode: HttpStatus.OK,
                result: "user_leave_success",
                message: "사용자 탈퇴 완료"
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

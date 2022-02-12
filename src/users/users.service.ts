import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { User } from 'src/entities/user.entity';
import { JwtService } from 'src/utils/jwt.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import httpResponse from 'src/utils/httpResponse';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly jwtService: JwtService 
    ) {}

    async loginUser(loginData: LoginUserDto) {
        try {
            let userInfo = await this.users.findOne({
                userEmail: loginData.userEmail,
                userPw: createHmac('sha256', 'secret').update(loginData.userPw).digest('hex')
            }, {
                select: ['id', 'userNum', 'userEmail', 'userName']
            })
            if (!userInfo) {
                return {
                    ...httpResponse.NOT_FOUND,
                    result: "login_fail"
                }
            } else {
                const token = await this.jwtService.getJwtToken(userInfo.id);
                delete userInfo.id;
                return {
                    ...httpResponse.OK,
                    data: { ...userInfo, token }
                }
            }
        } catch (err) {
            return {
                ...httpResponse.INTERNAL_SERVER_ERROR,
                error: err
            };
        }
    }

    async createUser(userData: CreateUserDto) {
        try {
            const checkEmailDuplicates = await this.users.count({ userEmail: userData.userEmail });
            if (checkEmailDuplicates > 0) {
                return {
                    ...httpResponse.CONFLICT,
                    result: "email_duplicates"
                }
            }

            const checkUserNameDuplicates = await this.users.count({ userName: userData.userName });
            if (checkUserNameDuplicates > 0) {
                return {
                    ...httpResponse.CONFLICT,
                    result: "user_name_duplicates"
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
                ...httpResponse.CREATED,
                data: {...userInfo, token }
            }
        } catch (err) {
            return {
                ...httpResponse.INTERNAL_SERVER_ERROR,
                error: err
            };
        }
    }

    async logoutUser(userId: number) {
        try {
            await this.users.update({ id: userId }, { authToken: null });
            return httpResponse.OK;
        } catch (err) {
            return {
                ...httpResponse.INTERNAL_SERVER_ERROR,
                error: err
            };
        }
    }

    async getUser(userId: number) {
        try {
            const userInfo = await this.users.findOne({ id: userId }, { select: ['userEmail', 'userName'] });
            if (!userInfo) {
                return {
                    ...httpResponse.BAD_REQUEST,
                    result: "user_not_found"
                }
            } else {
                return {
                    ...httpResponse.OK,
                    data: userInfo
                }
            }
        } catch (err) {
            return {
                ...httpResponse.INTERNAL_SERVER_ERROR,
                error: err
            };
        }
    }

    async updateUser(updateData: UpdateUserDto, userId: number) {
        let updateResult = {};

        try {
            if (updateData.userName) {
                const getOldUserName = await this.users.findOne({ id: userId }, { select: ['userName'] });
                const checkUserNameDuplicates = await this.users.count({ userName: updateData.userName });
                if (updateData.userName !== getOldUserName.userName) {
                    if (checkUserNameDuplicates > 0) {
                        return {
                            ...httpResponse.CONFLICT,
                            result: "user_name_duplicates"
                        }
                    } else {
                        Object.assign(updateResult, { userName: updateData.userName });
                    }
                }
            }

            if (updateData.userPw) {
                const newPw = createHmac('sha256', 'secret').update(updateData.userPw).digest('hex');
                const checkPw = await this.users.count({ id: userId, userPw: newPw });
                if (checkPw > 0) {
                    return {
                        ...httpResponse.CONFLICT,
                        result: "same_password"
                    }
                } else {
                    Object.assign(updateResult, { userPw: newPw });
                }
            }

            if (Object.keys(updateResult).length > 0) {
                await this.users.update({ id: userId }, updateResult);
            }

            return httpResponse.OK;
        } catch (err) {
            return {
                ...httpResponse.INTERNAL_SERVER_ERROR,
                error: err
            };
        }
    }

    async deleteUser(userId: number) {
        try {
            await this.users.delete({ id: userId });
            return httpResponse.OK;
        } catch (err) {
            return {
                ...httpResponse.INTERNAL_SERVER_ERROR,
                error: err
            };
        }
    }
}

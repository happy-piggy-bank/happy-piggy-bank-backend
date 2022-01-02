import { Body, Controller, Delete, Get, Post, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from './dtos/createUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('login')
    async loginUser(@Body() loginData: LoginUserDto, @Res() res: Response) {
        const result = await this.usersService.loginUser(loginData);
        return res.status(result.statusCode).send(result);
    }

    @Post('join')
    async createUser(@Body() userData: CreateUserDto, @Res() res: Response) {
        const result = await this.usersService.createUser(userData);
        return res.status(result.statusCode).send(result);
    }

    @Post('logout')
    async lougoutUser(@Res() res: Response) {
        const result = await this.usersService.logoutUser(res.locals.userId);
        return res.status(result.statusCode).send(result);
    }

    @Get('myInfo')
    async getUserInfo() {}

    @Put('myInfo')
    async modifyUserInfo() {}

    @Delete('leave')
    async deteleUser() {}
}

import { Body, Controller, Delete, Get, Post, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from './dtos/createUser.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('login')
    async loginUser() {}

    @Post('join')
    async createUser(@Body() userData: CreateUserDto, @Res() res: Response) {
        const result = await this.usersService.createUser(userData);
        return res.status(result.statusCode).send(result);
    }

    @Post('logout')
    async lougoutUser() {}

    @Get('myInfo')
    async getUserInfo() {}

    @Put('myInfo')
    async modifyUserInfo() {}

    @Delete('leave')
    async deteleUser() {}
}

import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from './dtos/createUser.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('join')
    async createUser(@Body() userData: CreateUserDto, @Res() res: Response) {
        const result = await this.usersService.createUser(userData);
        return res.status(result.statusCode).send(result);
    }
}

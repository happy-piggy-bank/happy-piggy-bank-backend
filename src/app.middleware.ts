import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './jwt/jwt.service';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService
  ) {}

  async use(req: Request | any, res: Response, next: NextFunction) {
    if (!req.headers.token) {
      res.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        result: "no_auth_token",
        message: "인증 토큰 없음"
      });
    } else {
      const checkToken = await this.jwtService.verifyJwtToken(req.headers.token);
      if (checkToken === 'INVALID') {
        res.status(HttpStatus.UNAUTHORIZED).send({
          statusCode: HttpStatus.UNAUTHORIZED,
          result: "invalid_token",
          message: "유효하지 않은 인증 토큰"
        });
      } else {
        res.locals.userId = checkToken;
        next();
      }
    }
  }
}

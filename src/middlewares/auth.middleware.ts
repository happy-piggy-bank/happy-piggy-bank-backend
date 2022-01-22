import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '../utils/jwt.service';
import httpResponse from 'src/utils/httpResponse';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService
  ) {}

  async use(req: Request | any, res: Response, next: NextFunction) {
    if (!req.headers.token) {
      res.status(HttpStatus.BAD_REQUEST).send({
        ...httpResponse.BAD_REQUEST,
        result: "no_auth_token"
      });
    } else {
      const checkToken = await this.jwtService.verifyJwtToken(req.headers.token);
      if (checkToken === 'INVALID') {
        res.status(HttpStatus.UNAUTHORIZED).send({
          ...httpResponse.UNAUTHORIZED,
          result: "invalid_token"
        });
      } else {
        res.locals.userId = checkToken;
        next();
      }
    }
  }
}

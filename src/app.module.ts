import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PiggyBank } from './entities/piggyBank.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { BankController } from './bank/bank.controller';
import { BankModule } from './bank/bank.module';
import { JwtModule } from './utils/jwt/jwt.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { FileModule } from './utils/file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: Joi.object({
        CORS_ORIGIN: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        AWS_S3_BUCKET: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        JWT_SECRET: Joi.string().required()
      })
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, PiggyBank],
      synchronize: true,
      logging: true
    }),
    UsersModule,
    BankModule,
    JwtModule,
    FileModule
],
  controllers: [AppController, UsersController, BankController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(AuthMiddleware)
        .exclude(
          '/',
          'users/login',
          'users/join'
        )
        .forRoutes('*');
  }
}

import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @IsNumber()
    user_idx: number;

    @Column()
    @IsString()
    user_email: string;

    @Column()
    @IsString()
    user_pw: string;

    @Column()
    @IsString()
    user_name: string;

    @Column({ default: true })
    @IsBoolean()
    leave_yn: boolean;
}
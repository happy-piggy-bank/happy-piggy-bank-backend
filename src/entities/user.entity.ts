import { IsNumber, IsString } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PiggyBank } from './piggyBank.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number;

    @Column({ unique: true })
    @IsString()
    userNum: string;

    @Column()
    @IsString()
    userEmail: string;

    @Column()
    @IsString()
    userPw: string;

    @Column()
    @IsString()
    userName: string;

    @Column({ nullable: true, length: 300 })
    @IsString()
    authToken: string;

    @Column({ nullable: true, length: 300 })
    @IsString()
    uuid: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    @IsString()
    regDt: string;

    @OneToMany(() => PiggyBank, piggyBank => piggyBank.user)
    piggyBanks: PiggyBank[]
}
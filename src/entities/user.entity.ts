import { IsNumber, IsString } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PiggyBank } from './piggyBank.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number;

    @Column()
    @IsString()
    user_email: string;

    @Column()
    @IsString()
    user_pw: string;

    @Column()
    @IsString()
    user_name: string;

    @Column({ nullable: true })
    @IsString()
    access_token: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    @IsString()
    reg_dt: string;

    @OneToMany(() => PiggyBank, piggyBank => piggyBank.user)
    piggyBanks: PiggyBank[]
}
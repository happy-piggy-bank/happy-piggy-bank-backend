import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PiggyBank {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number;

    @Column()
    @IsString()
    bank_title: string;

    @Column({ type: 'text' })
    @IsString()
    bank_content: string;

    @Column()
    @IsNumber()
    bank_amount: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    @IsString()
    reg_dt: string;

    @ManyToOne(() => User, user => user.piggyBanks, { nullable: false, onDelete: 'CASCADE' })
    user: User
}
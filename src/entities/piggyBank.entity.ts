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
    bankTitle: string;

    @Column({ type: 'text' })
    @IsString()
    bankContents: string;

    @Column({ default: 0 })
    @IsNumber()
    bankAmount: number;

    @Column({ nullable: true, length: 500 })
    @IsString()
    contentsImg: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    @IsString()
    regDt: string;

    @ManyToOne(() => User, user => user.piggyBanks, { nullable: true, onDelete: 'CASCADE' })
    user: User
}
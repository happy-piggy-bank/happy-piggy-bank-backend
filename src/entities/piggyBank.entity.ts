import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PiggyBank {
    @PrimaryGeneratedColumn()
    @IsNumber()
    bank_idx: number;

    @Column()
    @IsString()
    bank_title: string;

    @Column()
    @IsString()
    bank_content: string;

    @Column()
    @IsNumber()
    bank_amount: number;

    @Column({ default: true })
    @IsBoolean()
    use_yn: boolean;

    @Column()
    @IsNumber()
    reg_idx: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    @IsString()
    reg_dt: string;
}
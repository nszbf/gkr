import { time } from '@gkr/core';
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ValidateCodeType } from '../../constants';

export class BaseValidator {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ comment: '验证码' })
    code!: string;

    @Column({
        type: 'enum',
        enum: ValidateCodeType,
        comment: '验证码类型',
    })
    type!: ValidateCodeType;

    @CreateDateColumn({
        comment: '创建时间',
        transformer: {
            from: (date) => time({ date }).format('YYYY-MM-DD HH:mm:ss'),
            to: (date: Date) => date,
        },
    })
    created_at!: Date;

    @UpdateDateColumn({
        comment: '更新时间',
        transformer: {
            from: (date) => time({ date }).format('YYYY-MM-DD HH:mm:ss'),
            to: (date: Date) => date,
        },
    })
    updated_at!: Date;
}

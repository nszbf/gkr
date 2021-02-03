import { time } from '@gkr/core';
import { BaseEntity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

/**
 * AccessToken与RefreshToken的公共字段
 *
 * @export
 * @abstract
 * @class BaseToken
 * @extends {BaseEntity}
 */
export abstract class BaseToken extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /**
     * 令牌字符串
     *
     * @type {string}
     * @memberof BaseToken
     */
    @Column({ length: 500 })
    value!: string;

    @Column({
        comment: '令牌过期时间',
        type: 'varchar',
        transformer: {
            from: (date) => time({ date }).format('YYYY-MM-DD HH:mm:ss'),
            to: (date: Date) => date,
        },
    })
    expired_at!: Date;

    @CreateDateColumn({
        comment: '令牌创建时间',
        transformer: {
            from: (date) => time({ date }).format('YYYY-MM-DD HH:mm:ss'),
            to: (date) => date,
        },
    })
    createdAt!: Date;
}
import { CommentEntity, PostEntity } from '@gkr/content';
import { ConfigRegister, env } from '@gkr/core';
import { UserConfig } from '@gkr/user';
import { OneToMany } from 'typeorm';

/**
 * 用户模块配置
 */
export const user: ConfigRegister<UserConfig> = () => ({
    relations: [
        {
            column: 'posts',
            relation: OneToMany(
                () => PostEntity,
                (post) => post.author,
                {
                    cascade: true,
                },
            ),
        },
        {
            column: 'comments',
            relation: OneToMany(
                () => CommentEntity,
                (comment) => comment.creator,
                {
                    cascade: true,
                },
            ),
        },
    ],
    jwt: {
        secret: env('AUTH_TOKEN_SECRET', 'my-secret'),
        token_expired: env('AUTH_TOKEN_EXPIRED', 3600),
        refresh_secret: env('AUTH_REFRESH_TOKEN_SECRET', 'my-refresh-secret'),
        refresh_token_expired: env('AUTH_REFRESH_TOKEN_EXPIRED', 3600 * 30),
    },
    validator: {
        sms: {
            sign: env('SMS_VALIDATOR_SIGN', 'your sign'),
            templates: {
                registration: {
                    id: env('SMS_REGISTRION_VALIDATOR_TEMPLATE', 'your-id'),
                    limit: env<number>('SMS_REGISTRION_VALIDATOR_LIMIT', (v) => Number(v), 60),
                    expired: env<number>(
                        'SMS_REGISTRION_VALIDATOR_LIMIT',
                        (v) => Number(v),
                        60 * 60,
                    ),
                },
                'reset-password': {
                    id: env('SMS_RESETPASSWORD_VALIDATOR_TEMPLATE', 'your-id'),
                    limit: env<number>('SMS_RESETPASSWORD_VALIDATOR_LIMIT', (v) => Number(v), 60),
                    expired: env<number>(
                        'SMS_REGISTRION_VALIDATOR_LIMIT',
                        (v) => Number(v),
                        60 * 60,
                    ),
                },
            },
        },
    },
});

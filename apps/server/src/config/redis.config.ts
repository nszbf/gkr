import { ConfigRegister, env } from '@gkr/core';
import { RedisConfig } from '@gkr/redis';

export const redis: ConfigRegister<RedisConfig> = () => ({
    default: 'local',
    enabled: [],
    connections: [
        {
            name: 'local',
            host: env('REDIS_HOST', '127.0.0.1'),
            port: env<number>('REDIS_PORT', (v) => Number(v), 6379),
            password: env('REDIS_PASSWORD', undefined),
        },
    ],
});

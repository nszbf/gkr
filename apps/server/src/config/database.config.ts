import { ConfigRegister, env } from '@gkr/core';
import { DatabaseConfig } from '@gkr/database';
import path from 'path';
import { CreateFirstTable1612197057988 } from '../migration/1612197057988-CreateFirstTable';
/**
 * 数据库配置
 */
export const database: ConfigRegister<DatabaseConfig> = () => {
    return {
        default: env('DATABASE_DEFAULT', 'mysql'),
        enabled: [],
        connections: [
            {
                name: 'sqlite',
                type: 'sqlite',
                database: path.join(process.cwd(), env('DATABASE_PATH', 'database.sqlite')),
            },
            {
                name: 'mysql',
                type: 'mysql',
                host: env('DATABASE_HOST', '127.0.0.1'),
                port: env('DATABASE_PORT', (v) => Number(v), 3306),
                username: env('DATABASE_USERNAME', 'root'),
                password: env('DATABASE_PASSWORD', '123456'),
                database: env('DATABASE_NAME', 'dev'),
            },
            {
                name: 'mysql2',
                type: 'mysql',
                host: env('DATABASE_SECOND_HOST', '127.0.0.1'),
                port: env('DATABASE_SECOND_PORT', (v) => Number(v), 3306),
                username: env('DATABASE_SECOND_USERNAME', 'root'),
                password: env('DATABASE_SECOND_PASSWORD', '123456'),
                database: env('DATABASE_SECOND_NAME', 'dev2'),
            },
        ],
        common: {
            migrations: [CreateFirstTable1612197057988],
            charset: 'utf8mb4',
            synchronize: false,
            logging: ['error'],
        },
    };
};

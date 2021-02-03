import { ContentModule } from '@gkr/content';
import { AppConfig, ConfigRegister, env, environment, HashUtil, TimeUtil } from '@gkr/core';
import { UserModule } from '@gkr/user';

/**
 * 应用配置
 */
export const app: ConfigRegister<AppConfig> = () => ({
    // 是否开启debug
    debug: env('APP_DEBUG', (v) => JSON.parse(v), environment() === 'development'),
    // 默认时区
    timezone: env('APP_TIMEZONE', 'Asia/Shanghai'),
    // 默认语言
    locale: env('APP_LOCALE', 'zh-cn'),
    // 是否开启HTTPS
    https: env<boolean>('SERVER_HTTPS', (v) => JSON.parse(v), false),
    // 主机地址
    host: env('SERVER_HOST', '127.0.0.1'),
    // 端口
    port: env<number>('SERVER_PORT', (v) => Number(v), 3000),
    // 自定义URL
    url: env('SERVER_URL', undefined),
    // Hash混淆值
    hash: env<number>('PASSWORD_HASH', (v) => Number(v), 10),
    // 启用组件
    utils: [HashUtil, TimeUtil],
    // 启用模块
    modules: [ContentModule, UserModule],
});

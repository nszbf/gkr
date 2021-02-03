import { Config as AliyunOptions } from '@alicloud/pop-core';
import { Filter, ValueOf } from '@gkr/core';

/**
 * 短信配置
 *
 * @export
 * @interface SmsConfig
 */
export interface SmsConfig {
    default: string;
    enabled: string[];
    connections: SmsConnectionOption[];
}

/**
 * 短信驱动配置
 *
 * @export
 * @interface SmsDriverOptions
 */
export interface SmsDriverOptions {
    // 阿里云短信配置接口
    ALIYUN: AliyunOptions & {
        RegionId: string;
    };
}

/**
 * 短信驱动类型
 */
export type SmsDriverType = keyof SmsDriverOptions;

/**
 * 短信连接配置,用于createSmsConection函数创建配置
 *
 * @export
 * @interface SmsConnectionConfig
 * @template T
 */
export interface SmsConnectionConfig<T extends SmsDriverType> {
    name: string;
    type: T;
    option: SmsDriverOptions[Filter<SmsDriverType, T>];
}

/**
 * 短信连接配置,用于sms util的_options属性
 *
 * @export
 * @interface SmsConnectionOption
 */
export interface SmsConnectionOption {
    name: string;
    type: SmsDriverType;
    option: ValueOf<SmsDriverOptions>;
}

/**
 * 发送端参数
 *
 * @export
 * @interface SendParams
 */
export interface SendParams {
    phone: string;
    sign: string;
    template: string;
    params: { [key: string]: any };
    [key: string]: any;
}

import { ClassType } from '@gkr/core';
import { SmsDriverType } from '../types';
import { AliyunSms } from './aliyun';
/**
 * 驱动名和类的映射接口
 */
export type SmsDriverClassMap = {
    [key in SmsDriverType]?: ClassType<AliyunSms>;
};

/**
 * 驱动列表
 */
export const SmsDrivers: SmsDriverClassMap = {
    ALIYUN: AliyunSms,
};

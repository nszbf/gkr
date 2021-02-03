import { ConfigRegister, env } from '@gkr/core';
import { createSmsConection, SmsConfig } from '@gkr/sms';

export const sms: ConfigRegister<SmsConfig> = () => ({
    default: env('SMS_DEFAULT', 'aliyun'),
    enabled: [],
    connections: [
        createSmsConection({
            name: 'aliyun',
            type: 'ALIYUN',
            option: {
                accessKeyId: env('SMS_ALIYUN_ID', 'yout-access-id'),
                accessKeySecret: env('SMS_ALIYUN_SECRET', 'your-access-secret'),
                endpoint: 'https://dysmsapi.aliyuncs.com',
                apiVersion: '2017-05-25',
                RegionId: env('SMS_ALIYUN_REGION', 'cn-hangzhou'),
            },
        }),
    ],
});

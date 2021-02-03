import AliyunClient from '@alicloud/pop-core';
import { omit } from 'lodash';
import { SendParams, SmsDriverOptions } from '../types';
import { BaseSms } from './base';

/**
 *阿里云短信发送参数
 *
 * @export
 * @interface AliyunSendParams
 */
export interface AliyunSendParams {
    PhoneNumbers: string;
    TemplateCode: string;
    SignName: string;
    RegionId?: string;
    TemplateParam?: string;
    SmsUpExtendCode?: string;
    OutId?: string;
}

/**
 * 阿里云短信驱动
 *
 * @export
 * @class AliyunSms
 * @extends {BaseSms<SmsDriverOptions['ALIYUN'], AliyunSendParams>}
 */
export class AliyunSms extends BaseSms<SmsDriverOptions['ALIYUN'], AliyunSendParams> {
    protected client!: AliyunClient;

    create() {
        this.client = new AliyunClient(omit(this.config, ['RegionId']));
    }

    async sendAction(params: AliyunSendParams) {
        return await this.client.request(
            'SendSms',
            { RegionId: this.config.RegionId, ...params },
            {
                method: 'POST',
            },
        );
    }

    transSendParams(options: SendParams): AliyunSendParams {
        return {
            ...omit(options, ['phone', 'template', 'sign', 'params']),
            PhoneNumbers: options.phone,
            TemplateCode: options.template,
            SignName: options.sign,
            TemplateParam: JSON.stringify(options.params),
        };
    }
}

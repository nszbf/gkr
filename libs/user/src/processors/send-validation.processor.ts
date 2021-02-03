import { config, environment } from '@gkr/core';
import { SmsUtil } from '@gkr/sms';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import shell from 'shelljs';
import { Repository } from 'typeorm';
import { SmsValidatorEntity } from '../database/entities';
import { SendSmsValidatorQuqueData } from '../types';

/**
 * 发送验证码的列队任务消费者
 *
 * @export
 * @class SendValidationProcessor
 */
@Processor('send-validation-code')
export class SendValidationProcessor {
    constructor(
        private readonly sms: SmsUtil,
        @InjectRepository(SmsValidatorEntity)
        private SmsValidatorRepository: Repository<SmsValidatorEntity>,
    ) {}

    @Process('sms')
    async smsHandler(job: Job<SendSmsValidatorQuqueData>) {
        this.sendSmsCode(job);
    }

    protected async sendSmsCode(job: Job<SendSmsValidatorQuqueData>) {
        const { id, phone, code, type, template } = job.data;

        try {
            if (environment() !== 'development') {
                await this.sms.send({
                    phone,
                    template: template.id,
                    sign: config('user.validator.sms.sign'),
                    params: { code },
                });
            } else {
                shell.exec('sleep 3', { async: false });
                console.log('send sms success!');
            }
            return this.SmsValidatorRepository.save({ id, phone, code, type });
        } catch (err) {
            throw new Error(err);
        }
    }
}

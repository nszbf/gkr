import { Column, Entity } from 'typeorm';
import { BaseValidator } from './base.validator';

@Entity('user_sms_validators')
export class SmsValidatorEntity extends BaseValidator {
    @Column({ comment: '手机号' })
    phone!: string;
}

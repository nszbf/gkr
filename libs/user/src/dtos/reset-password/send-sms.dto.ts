import { DtoValidation } from '@gkr/core';
import { Injectable } from '@nestjs/common';
import { SendRegistrationSmsDto } from '../registration/send-sms.dto';

/**
 * 发送重置密码短信
 *
 * @export
 * @class SendResetPasswordSmsDto
 * @extends {SendRegistrationSmsDto}
 */
@Injectable()
@DtoValidation({ groups: ['reset-password'] })
export class SendResetPasswordSmsDto extends SendRegistrationSmsDto {}

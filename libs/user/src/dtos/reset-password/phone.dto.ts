import { DtoValidation } from '@gkr/core';
import { Injectable } from '@nestjs/common';
import { RegisterByPhoneDto } from '../registration/phone.dto';

/**
 * 通过短信验证码重置密码
 *
 * @export
 * @class ResetPasswordByPhoneDto
 * @extends {RegisterByPhoneDto}
 */
@Injectable()
@DtoValidation({ groups: ['reset-password'] })
export class ResetPasswordByPhoneDto extends RegisterByPhoneDto {}

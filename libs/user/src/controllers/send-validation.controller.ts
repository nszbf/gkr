import { BaseController } from '@gkr/core';
import { Body, Controller, Post } from '@nestjs/common';
import { ValidateCodeType } from '../constants';
import { SendRegistrationSmsDto, SendResetPasswordSmsDto } from '../dtos';
import { SendValidationService } from '../services';

/**
 * 发送验证码
 *
 * @export
 * @class SendValidationController
 * @extends {BaseController}
 */
@Controller('send-code')
export class SendValidationController extends BaseController {
    constructor(private readonly sendService: SendValidationService) {
        super();
    }

    /**
     * 发送用户注册的验证短信
     *
     * @param {SendResetPasswordSmsDto} dto
     * @returns
     * @memberof SendValidationController
     */
    @Post('phone-registration')
    async phoneRegistration(
        @Body()
        dto: SendResetPasswordSmsDto,
    ) {
        return await this.sendService.sendSms(dto, ValidateCodeType.REGISTRATION);
    }

    /**
     * 发送重置密码的验证短信
     *
     * @param {SendRegistrationSmsDto} dto
     * @returns
     * @memberof SendValidationController
     */
    @Post('phone-reset-password')
    async phoneResetPassword(
        @Body()
        dto: SendRegistrationSmsDto,
    ) {
        return await this.sendService.sendSms(dto, ValidateCodeType.RESETPASSWORD);
    }
}

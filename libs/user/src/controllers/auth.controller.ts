import { BaseController } from '@gkr/core';
import { Body, Controller, Patch, Post, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserEntity } from '../database/entities';
import { ReqUser } from '../decorators';
import { RegisterByPhoneDto, ResetPasswordByPhoneDto } from '../dtos';
import { CredentialDto } from '../dtos/credential.dto';
import { JwtAuthGuard, LocalAuthGuard } from '../guards';
import { AuthService } from '../services';

/**
 * 用户认证控制器
 *
 * @export
 * @class AuthController
 * @extends {BaseController}
 */
@Controller('auth')
export class AuthController extends BaseController {
    constructor(private readonly authService: AuthService) {
        super();
    }

    /**
     * 用户登录
     *
     * @param {UserEntity} user
     * @param {CredentialDto} _data
     * @returns
     * @memberof AuthController
     */
    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@ReqUser() user: UserEntity, @Body(new ValidationPipe()) _data: CredentialDto) {
        return { token: await this.authService.login(user) };
    }

    /**
     * 注销登录
     *
     * @param {*} req
     * @returns
     * @memberof AuthController
     */
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Request() req: any) {
        return await this.authService.logout(req);
    }

    /**
     * 通过手机号注册
     *
     * @param {RegisterByPhoneDto} data
     * @returns
     * @memberof AuthController
     */
    @Post('register')
    async register(
        @Body()
        data: RegisterByPhoneDto,
    ) {
        return await this.authService.register(data);
    }

    /**
     * 忘记密码后使用手机号重置
     *
     * @param {ResetPasswordByPhoneDto} data
     * @returns
     * @memberof AuthController
     */
    @Patch('reset-password')
    async resetPassword(
        @Body()
        data: ResetPasswordByPhoneDto,
    ) {
        return await this.authService.resetPassword(data);
    }
}

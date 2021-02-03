import { config, decrypt, EnviromentType, environment, time } from '@gkr/core';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { FastifyRequest as Request } from 'fastify';
import { ExtractJwt } from 'passport-jwt';
import { Repository } from 'typeorm';
import { ValidateCodeType } from '../constants';
import { SmsValidatorEntity, UserEntity } from '../database/entities';
import { UserRepository } from '../database/repositories';
import { RegisterByPhoneDto, ResetPasswordByPhoneDto } from '../dtos';
import { MsmValidatorTemplate, UserConfig } from '../types';
import { TokenService } from './token.service';
import { UserService } from './user.service';

/**
 * 用户认证服务
 *
 * @export
 * @class AuthService
 */
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(SmsValidatorEntity)
        private SmsValidatorRepository: Repository<SmsValidatorEntity>,
        private readonly userRepository: UserRepository,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
    ) {}

    /**
     * 验证用户
     *
     * @param {string} credential
     * @param {string} password
     * @returns {Promise<any>}
     * @memberof AuthService
     */
    async validateUser(credential: string, password: string) {
        const user = await this.userService.findOneByCredential(credential, async (query) =>
            query.addSelect('user.password'),
        );
        if (user && decrypt(password, user.password)) {
            return user;
        }
        return false;
    }

    /**
     * 通过手机短信验证注册
     *
     * @param {RegisterByPhoneDto} data
     * @returns
     * @memberof AuthService
     */
    async register(data: RegisterByPhoneDto) {
        const { phone, code } = data;
        const codeItem = await this.SmsValidatorRepository.findOne({
            where: { code, phone, type: ValidateCodeType.REGISTRATION },
        });
        if (!codeItem) {
            throw new ForbiddenException('验证码错误!');
        }
        if (this.checkCodeExpired(codeItem, 'registration')) {
            throw new BadRequestException('验证码过期!');
        }
        return { message: '注册成功!' };
    }

    /**
     * 通过手机短信重置密码
     *
     * @param {ResetPasswordByPhoneDto} data
     * @returns
     * @memberof AuthService
     */
    async resetPassword(data: ResetPasswordByPhoneDto) {
        const { phone, password, code } = data;
        const codeItem = await this.SmsValidatorRepository.findOne({
            where: { code, phone, type: ValidateCodeType.RESETPASSWORD },
        });
        if (!codeItem) {
            throw new ForbiddenException('验证码错误!');
        }
        if (this.checkCodeExpired(codeItem, 'registration')) {
            throw new BadRequestException('验证码过期!');
        }
        const user = await this.userService.findOneByCondition({ phone });
        if (!user) {
            throw new ForbiddenException('用户不存在!');
        }
        user.password = password;
        await this.userRepository.save(user);
        return { message: '更改密码成功' };
    }

    /**

    /**
     * 登录用户,并生成新的token和refreshToken
     *
     * @param {UserEntity} user
     * @returns
     * @memberof AuthService
     */
    async login(user: UserEntity) {
        const now = time();
        const { accessToken } = await this.tokenService.generateAccessToken(user, now);
        return accessToken.value;
    }

    /**
     * 注销登录
     *
     * @param {Request} req
     * @returns
     * @memberof AuthService
     */
    async logout(req: Request) {
        const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req as any);
        if (accessToken) {
            await this.tokenService.removeAccessToken(accessToken);
        }

        return {
            msg: 'logout_success',
        };
    }

    /**
     * 检测验证码是否过期
     *
     * @protected
     * @param {SmsValidatorEntity} code
     * @param {string} template
     * @returns
     * @memberof AuthService
     */
    protected checkCodeExpired(code: SmsValidatorEntity, template: string) {
        const tplconfig = config<MsmValidatorTemplate>(`user.validator.sms.templates.${template}`);
        if (!tplconfig) return false;
        return time({ date: code.created_at }).add(tplconfig.expired, 'second').isBefore(time());
    }

    /**
     * 导入Jwt模块
     *
     * @static
     * @returns
     * @userof AuthService
     */
    static jwtModuleFactory() {
        return JwtModule.registerAsync({
            useFactory: () => {
                const data = config<UserConfig['jwt']>('user.jwt');
                return {
                    secret: data.secret,
                    ignoreExpiration: environment() === EnviromentType.DEV,
                    signOptions: { expiresIn: `${data.token_expired}s` },
                };
            },
        });
    }
}

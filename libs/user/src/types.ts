import { DynamicRelation } from '@gkr/database';
import { ObjectType } from 'typeorm';
import { ValidateCodeType } from './constants';
import { SmsValidatorEntity } from './database/entities';

/** ************************************ 模块配置 ******************************** */
/**
 * 用户模块配置
 *
 * @export
 * @interface UserConfig
 */
export interface UserConfig {
    jwt: JwtConfig;
    validator: ValidatorConfig;
    relations: DynamicRelation[];
}

/** ************************************ 所属资源判断 ******************************** */
/**
 * 所属资源接口
 *
 * @export
 * @interface OwnerResourceType
 */
export interface OwnerResourceType {
    model: ObjectType<{ [key: string]: any }>;
    queryColumn?: string;
    ownerResourceName?: string;
}

/**
 * 所属资源元数据接口
 *
 * @export
 * @interface OwnerResourceMeta
 */
export interface OwnerResourceMeta {
    resource: OwnerResourceType | OwnerResourceType[];
    owner: {
        model: ObjectType<{ [key: string]: any }>;
        requestKey: string;
        queryColumn?: string;
    };
}

/** ************************************ 认证 ******************************** */

/**
 * JWT配置
 *
 * @export
 * @interface JwtConfig
 */
export interface JwtConfig {
    secret: string;
    token_expired: number;
    refresh_secret: string;
    refresh_token_expired: number;
}

/**
 * JWT荷载
 *
 * @export
 * @interface JwtPayload
 */
export interface JwtPayload {
    sub: string;
    iat: number;
}

/**
 * 由JWT策略解析荷载后存入Rquest.user的对象
 *
 * @export
 * @interface RequestUser
 */
export interface RequestUser {
    id: string;
}

/** ************************************ 验证码 ******************************** */

/**
 * 手机验证码模板
 *
 * @export
 * @interface MsmValidatorTemplate
 */
export interface MsmValidatorTemplate {
    id: string;
    limit: number;
    expired: number;
}

/**
 * 手机验证码发送配置
 *
 * @export
 * @interface ValidatorConfig
 */
export interface ValidatorConfig {
    sms: {
        sign: string;
        templates: {
            [key in ValidateCodeType]: MsmValidatorTemplate;
        };
    };
}

/**
 * 手机验证码任务列队处理数据
 *
 * @export
 * @interface SendSmsValidatorQuqueData
 * @extends {(Pick<{
 *             [key in keyof SmsCode]: SmsCode[key];
 *         }, 'code' | 'phone' | 'type'>)}
 */
export interface SendSmsValidatorQuqueData
    extends Pick<
        {
            [key in keyof SmsValidatorEntity]: SmsValidatorEntity[key];
        },
        'code' | 'phone' | 'type'
    > {
    id?: string;
    template: MsmValidatorTemplate;
}

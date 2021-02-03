import { DtoValidation, IsMatch, IsMatchPhone, IsPassword } from '@gkr/core';
import { IsModelExist, IsUnique } from '@gkr/database';
import { transPhone } from '@gkr/sms';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsNumberString, Length, MinLength } from 'class-validator';
import { UserEntity } from '../../database/entities';

/**
 * 通过短信验证码注册用户
 *
 * @export
 * @class RegisterByPhoneDto
 * @extends {BaseCodeValdation}
 */
@Injectable()
@DtoValidation({ groups: ['registration'] })
export class RegisterByPhoneDto {
    @ApiProperty({ description: '手机号' })
    @Transform(({ value }) => transPhone(value), { toClassOnly: true })
    @IsUnique({ entity: UserEntity }, { message: '手机号已被注册', groups: ['registration'] })
    @IsModelExist(
        { entity: UserEntity, map: 'phone' },
        { message: '用户不存在', groups: ['reset-password'] },
    )
    @IsMatchPhone(
        undefined,
        { strictMode: true },
        {
            message: '手机格式错误,示例: 15005255555或+86.15005255555',
            always: true,
        },
    )
    phone!: string;

    @ApiProperty({ description: '密码' })
    @IsDefined({ message: '密码必须填写' })
    @IsPassword(1, { message: '密码必须包含数字和英文字母' })
    @MinLength(8, { message: `密码长度至少为8个字符` })
    password!: string;

    @ApiProperty({ description: '重复密码' })
    @IsDefined({ message: '确认密码必须填写' })
    @IsMatch('password', { message: '两次输入密码不同' })
    plainPassword!: string;

    @ApiProperty({ description: '验证码' })
    @IsNumberString(undefined, { message: '验证码必须为数字' })
    @Length(6, 6, { message: '验证码长度错误' })
    code!: string;
}

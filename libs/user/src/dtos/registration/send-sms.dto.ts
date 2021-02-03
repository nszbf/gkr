import { DtoValidation, IsMatchPhone } from '@gkr/core';
import { IsModelExist, IsUnique } from '@gkr/database';
import { transPhone } from '@gkr/sms';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined } from 'class-validator';
import { UserEntity } from '../../database/entities';

/**
 * 发送注册验证码短信
 *
 * @export
 * @class SendRegistrationSmsDto
 */
@Injectable()
@DtoValidation({ groups: ['registration'] })
export class SendRegistrationSmsDto {
    @ApiProperty({ description: '手机号' })
    @IsDefined({ message: '手机号必须填写', always: true })
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
}

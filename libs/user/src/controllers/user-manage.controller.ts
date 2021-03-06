import { BaseController } from '@gkr/core';
import { ParseUUIDEntityPipe } from '@gkr/database';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
    SerializeOptions,
    UseGuards,
} from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { UserEntity } from '../database/entities';
import { QueryUserDto, UpdateUserDto } from '../dtos';
import { JwtAuthGuard } from '../guards';
import { UserService } from '../services';

/**
 * 用户管理控制器
 *
 * @export
 * @class UserManageController
 * @extends {BaseController}
 */
@Controller()
export class UserManageController extends BaseController {
    constructor(private readonly userService: UserService) {
        super();
    }

    /**
     * 根据条件分页查询
     *
     * @param {QueryUserDto} { page, limit, actived }
     * @returns
     * @memberof UserManageController
     */
    @Get()
    @UseGuards(JwtAuthGuard)
    async index(@Query() { page, limit, actived }: QueryUserDto) {
        const result = await this.userService.paginate(
            {
                actived,
            },
            { page, limit },
        );
        return {
            ...result,
            items: classToPlain(result.items, {
                groups: ['user-list'],
            }),
        };
    }

    /**
     * 用户详细信息
     *
     * @param {UserEntity} user
     * @returns {Promise<UserEntity>}
     * @memberof UserManageController
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @SerializeOptions({
        groups: ['user-item'],
    })
    show(
        @Param('id', new ParseUUIDEntityPipe(UserEntity))
        user: UserEntity,
    ): Promise<UserEntity> {
        return this.userService.findOneById(user.id);
    }

    /**
     * 更新用户信息
     *
     * @param {UpdateUserDto} updateUserDto
     * @returns {Promise<UserEntity>}
     * @memberof UserManageController
     */
    @Patch()
    @UseGuards(JwtAuthGuard)
    @SerializeOptions({
        groups: ['user-item'],
    })
    async update(
        @Body()
        updateUserDto: UpdateUserDto,
    ): Promise<UserEntity> {
        return await this.userService.update(updateUserDto);
    }

    /**
     * 删除用户
     *
     * @param {UserEntity} user
     * @returns
     * @memberof UserManageController
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @SerializeOptions({
        groups: ['user-item'],
    })
    async destroy(@Param('id', new ParseUUIDEntityPipe(UserEntity)) user: UserEntity) {
        return await this.userService.delete(user);
    }
}

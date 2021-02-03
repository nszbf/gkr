import { Controller, Get, SerializeOptions } from '@nestjs/common';
import { UserEntity } from '../database/entities';
import { ReqUser } from '../decorators';
import { UserService } from '../services';
import { JWTController } from './jwt.controller';

/**
 * 账户中心控制器
 *
 * @export
 * @class AccountController
 * @extends {JWTController}
 */
@Controller()
export class AccountController extends JWTController {
    constructor(private readonly userService: UserService) {
        super();
    }

    /**
     * 获取用户个人信息
     *
     * @param {UserEntity} user
     * @returns
     * @memberof AccountController
     */
    @Get('info')
    @SerializeOptions({
        groups: ['user-item'],
    })
    async getProfile(@ReqUser() user: UserEntity) {
        return this.userService.findOneById(user.id);
    }
}

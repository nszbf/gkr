import { encrypt } from '@gkr/core';
import { BaseSubscriber } from '@gkr/database';
import crypto from 'crypto';
import { EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

/**
 * 用户模型监听器
 *
 * @export
 * @class UserSubscriber
 * @implements {BaseSubscriber<UserEntity>}
 */
@EventSubscriber()
export class UserSubscriber extends BaseSubscriber<UserEntity> {
    listenTo() {
        return UserEntity;
    }

    /**
     * 生成不重复的随机用户名`
     *
     * @param {InsertEvent<UserEntity>} event
     * @returns {Promise<string>}
     * @memberof UserSubscriber
     */
    async generateUserName(event: InsertEvent<UserEntity>): Promise<string> {
        const username = `gkr_${crypto.randomBytes(4).toString('hex').slice(0, 8)}`;
        const user = await event.manager.findOne(UserEntity, {
            username,
        });
        return !user ? username : await this.generateUserName(event);
    }

    /**
     * 自动生成唯一用户名和密码
     *
     * @param {InsertEvent<UserEntity>} event
     * @memberof UserSubscriber
     */
    async beforeInsert(event: InsertEvent<UserEntity>) {
        // 自动生成唯一用户名
        if (!event.entity.username) {
            event.entity.username = await this.generateUserName(event);
        }
        // 自动生成密码
        if (!event.entity.password) {
            event.entity.password = crypto.randomBytes(11).toString('hex').slice(0, 22);
        }

        // 自动加密密码
        event.entity.password = encrypt(event.entity.password);
    }

    /**
     * 当密码更改时加密密码
     *
     * @param {UpdateEvent<UserEntity>} event
     * @memberof UserSubscriber
     */
    async beforeUpdate(event: UpdateEvent<UserEntity>) {
        if (this.isUpdated('password', event)) {
            event.entity.password = encrypt(event.entity.password);
        }
    }
}

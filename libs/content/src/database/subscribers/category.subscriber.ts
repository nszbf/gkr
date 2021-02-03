import { BaseSubscriber } from '@gkr/database';
import crypto from 'crypto';
import { EventSubscriber, InsertEvent } from 'typeorm';
import { CategoryEntity } from '../entities';

/**
 * 分类模型观察者
 *
 * @export
 * @class CategorySubscriber
 * @extends {BaseSubscriber<CategoryEntity>}
 */
@EventSubscriber()
export class CategorySubscriber extends BaseSubscriber<CategoryEntity> {
    listenTo() {
        return CategoryEntity;
    }

    /**
     * 在添加分类时,如果没有设置slug则自动生成一个唯一值的slug
     *
     * @param {InsertEvent<CategoryEntity>} event
     * @memberof CategorySubscriber
     */
    async beforeInsert(event: InsertEvent<CategoryEntity>) {
        if (!event.entity.slug) {
            event.entity.slug = await this.generateUniqueSlug(event);
        }
    }

    /**
     * 为slug生成唯一值
     *
     * @param {InsertEvent<CategoryEntity>} event
     * @returns {Promise<string>}
     * @memberof CategorySubscriber
     */
    async generateUniqueSlug(event: InsertEvent<CategoryEntity>): Promise<string> {
        const slug = `gkr_${crypto.randomBytes(4).toString('hex').slice(0, 8)}`;
        const category = await event.manager.findOne(CategoryEntity, {
            slug,
        });
        return !category ? slug : await this.generateUniqueSlug(event);
    }
}

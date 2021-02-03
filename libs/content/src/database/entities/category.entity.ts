import {
    BaseEntity,
    Column,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeParent,
} from 'typeorm';
import { PostEntity } from './post.entity';

/**
 * 分类模型
 *
 * @export
 * @class CategoryEntity
 * @extends {BaseEntity}
 */
@Entity('content_categories')
@Tree('nested-set')
export class CategoryEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ comment: '分类名称' })
    name!: string;

    @Column({ comment: '分类标识符' })
    slug!: string;

    @Column({ comment: '分类排序', default: 0 })
    order!: number;

    @TreeChildren()
    children!: CategoryEntity[];

    @TreeParent()
    parent?: CategoryEntity;

    /**
     * 分类嵌套等级,只在打平时使用
     *
     * @type {number}
     * @memberof CategoryEntity
     */
    level = 0;

    /**
     * 分类关联的文章
     *
     * @type {PostEntity[]}
     * @memberof CategoryEntity
     */
    @ManyToMany((type) => PostEntity, (post) => post.categories)
    posts!: PostEntity[];
}

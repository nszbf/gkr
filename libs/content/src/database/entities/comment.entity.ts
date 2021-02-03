import { time } from '@gkr/core';
import { UserEntity } from '@gkr/user';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeParent,
} from 'typeorm';
import { PostEntity } from './post.entity';

/**
 * 评论模型
 *
 * @export
 * @class CommentEntity
 * @extends {BaseEntity}
 */
@Entity('content_comments')
@Tree('nested-set')
export class CommentEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ comment: '评论内容', type: 'longtext' })
    body!: string;

    @TreeChildren()
    children!: CommentEntity[];

    @TreeParent()
    parent?: CommentEntity;

    /**
     * 评论所属文章
     *
     * @type {PostEntity}
     * @memberof CommentEntity
     */
    @ManyToOne(() => PostEntity, (post) => post.comments, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    post!: PostEntity;

    @CreateDateColumn({
        comment: '创建时间',
        transformer: {
            from: (date) => time({ date }).format('YYYY-MM-DD HH:mm:ss'),
            to: (date) => date,
        },
    })
    createdAt!: Date;

    @ManyToOne(() => UserEntity, (user) => (user as any).comments)
    creator!: UserEntity;
}

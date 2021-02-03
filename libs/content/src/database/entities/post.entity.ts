import { time } from '@gkr/core';
import { UserEntity } from '@gkr/user';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { CommentEntity } from './comment.entity';

/**
 * 文章模型
 *
 * @export
 * @class PostEntity
 * @extends {BaseEntity}
 */
@Entity('content_posts')
export class PostEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ comment: '文章标题' })
    title!: string;

    @Column({ comment: '文章内容', type: 'longtext' })
    body!: string;

    @Column({ comment: '文章描述', nullable: true })
    summary?: string;

    @Column({ comment: '关键字', type: 'simple-array', nullable: true })
    keywords?: string[];

    @Column({ comment: '是否发布', default: false })
    isPublished?: boolean;

    /**
     * 文章关联的分类
     *
     * @type {CategoryEntity[]}
     * @memberof PostEntity
     */
    @ManyToMany((type) => CategoryEntity, (category) => category.posts, {
        cascade: true,
    })
    @JoinTable()
    categories!: CategoryEntity[];

    /**
     * 文章下的评论
     *
     * @type {CommentEntity[]}
     * @memberof PostEntity
     */
    @OneToMany(() => CommentEntity, (comment) => comment.post, {
        cascade: true,
    })
    comments!: CommentEntity[];

    @Column({
        comment: '发布时间',
        type: 'varchar',
        nullable: true,
        transformer: {
            from: (date) => (date ? time({ date }).format('YYYY-MM-DD HH:mm:ss') : null),
            to: (date?: Date | null) => date || null,
        },
    })
    publishedAt?: Date | null;

    @CreateDateColumn({
        comment: '创建时间',
        transformer: {
            from: (date) => time({ date }).format('YYYY-MM-DD HH:mm:ss'),
            to: (date) => date,
        },
    })
    createdAt!: Date;

    @UpdateDateColumn({
        comment: '更新时间',
        transformer: {
            from: (date) => time({ date }).format('YYYY-MM-DD HH:mm:ss'),
            to: (date) => date,
        },
    })
    updatedAt!: Date;

    @ManyToOne(() => UserEntity, (user) => (user as any).posts, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    author!: UserEntity;
}

import { config, time } from '@gkr/core';
import { AddRelations } from '@gkr/database';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AccessTokenEntity } from './access-token.entity';

/**
 * 用户模型
 *
 * @export
 * @class UserEntity
 */
@Entity('users')
@AddRelations(() => config('user.relations'))
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        comment: '姓名',
        nullable: true,
    })
    nickname?: string;

    @Column({ comment: '用户名', unique: true })
    username!: string;

    @Column({ comment: '密码', length: 500, select: false })
    password!: string;

    @Column({ comment: '手机号', nullable: true, unique: true })
    phone?: string;

    @Column({ comment: '邮箱', nullable: true, unique: true })
    email?: string;

    @Column({ comment: '用户状态,是否激活', default: true })
    actived?: boolean;

    @CreateDateColumn({
        comment: '用户创建时间',
        transformer: {
            from: (date) => time({ date }).format('YYYY-MM-DD HH:mm:ss'),
            to: (date) => date,
        },
    })
    createdAt!: Date;

    /**
     * 用户的登录令牌
     *
     * @type {AccessTokenEntity[]}
     * @memberof UserEntity
     */
    @OneToMany(() => AccessTokenEntity, (accessToken) => accessToken.user, {
        cascade: true,
    })
    accessTokens!: AccessTokenEntity[];

    /**
     * 每个用户可以拥有多个角色
     * 并且可以通过角色获取角色权限
     *
     * @type {Role[]}
     * @userof UserEntity
     */
    // @ManyToMany(() => RoleEntity, (role) => role.users, {
    //     cascade: true,
    // })
    // roles!: RoleEntity[];

    // /**
    //  * 每个用户可以拥有多个权限(获取用户直接权限)
    //  *
    //  * @type {Permission[]}
    //  * @userof UserEntity
    //  */
    // @ManyToMany(() => PermissionEntity, (permission) => permission.users, {
    //     cascade: true,
    // })
    // permissions!: PermissionEntity[];

    /**
     * 用户创建的文章
     *
     * @type {PostEntity}
     * @memberof UserEntity
     */
    // @OneToMany(() => PostEntity, (post) => post.author, {
    //     cascade: true,
    // })
    // posts!: PostEntity;

    /**
     * 用户创建的评论
     *
     * @type {CommentEntity}
     * @memberof UserEntity
     */
    // @OneToMany(() => CommentEntity, (comment) => comment.creator, {
    //     cascade: true,
    // })
    // comments!: CommentEntity;

    // [key: string]: any;
}

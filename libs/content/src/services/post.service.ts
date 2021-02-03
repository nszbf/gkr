import { QueryHook } from '@gkr/database';
import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { SelectQueryBuilder } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { PostOrderType } from '../constants';
import { PostEntity } from '../database/entities';
import { CategoryRepository, PostRepository } from '../database/repositories';
import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { CategoryService } from './category.service';

// 文章查询接口
type FindParams = {
    [key in keyof Omit<QueryPostDto, 'limit' | 'page'>]: QueryPostDto[key];
};

/**
 * 文章服务
 *
 * @export
 * @class PostService
 */
@Injectable()
export class PostService {
    constructor(
        private categoryRepository: CategoryRepository,
        private postRepository: PostRepository,
        private categoryService: CategoryService,
    ) {}

    /**
     * 查询文章列表,分页输出数据
     *
     * @param {FindParams} params
     * @param {IPaginationOptions} options
     * @returns
     * @memberof PostService
     */
    async paginate(params: FindParams, options: IPaginationOptions) {
        const query = await this.getListQuery(params);
        return await paginate<PostEntity>(query, options);
    }

    /**
     * 查询一篇文章的详细信息
     *
     * @param {string} id
     * @returns
     * @memberof PostService
     */
    async findOne(id: string) {
        const query = await this.getItemQuery();
        const item = await query.where('post.id = :id', { id }).getOne();
        if (!item) throw new EntityNotFoundError(PostEntity, id);
        return item;
    }

    async create(data: CreatePostDto) {
        const item = await this.postRepository.save(data);
        return this.findOne(item.id);
    }

    async update(data: UpdatePostDto) {
        const post = await this.findOne(data.id);
        if (data.categories) {
            await this.postRepository
                .buildBaseQuery()
                .relation(PostEntity, 'categories')
                .of(post)
                .addAndRemove(data.categories ?? [], post.categories ?? []);
        }
        await this.postRepository.save(omit(data, ['categories']));
        return await this.findOne(data.id);
    }

    /**
     * 删除文章
     *
     * @param {string} id
     * @returns
     * @memberof PostService
     */
    async delete(post: PostEntity) {
        return await this.postRepository.remove(post);
    }

    /**
     * 查询一篇文章的Query构建
     *
     * @protected
     * @param {QueryHook<PostEntity>} [callback]
     * @returns
     * @memberof PostService
     */
    protected async getItemQuery(callback?: QueryHook<PostEntity>) {
        let query = this.postRepository
            .buildBaseQuery()
            .leftJoinAndSelect('post.comments', 'comments');
        if (callback) {
            query = await callback(query);
        }
        return query;
    }

    /**
     * 根据条件查询文章列表的Query构建
     *
     * @protected
     * @param {FindParams} [params={}]
     * @param {FindHook} [callback]
     * @returns
     * @memberof PostService
     */
    protected async getListQuery(params: FindParams = {}, callback?: QueryHook<PostEntity>) {
        const { category, orderBy, isPublished } = params;
        let query = this.postRepository
            .buildBaseQuery()
            .leftJoinAndSelect('post.categories', 'categories');
        if (isPublished !== undefined && typeof isPublished === 'boolean') {
            query = query.where('a.isPublished = :isPublished', {
                isPublished,
            });
        }
        query = this.queryOrderBy(query, orderBy);
        if (callback) {
            query = await callback(query);
        }
        if (category) {
            query = await this.queryByCategory(category, query);
        }
        return query;
    }

    /**
     * 对文章进行排序的Query构建
     *
     * @protected
     * @param {SelectQueryBuilder<PostEntity>} query
     * @param {PostOrderType} [orderBy]
     * @returns
     * @memberof PostService
     */
    protected queryOrderBy(query: SelectQueryBuilder<PostEntity>, orderBy?: PostOrderType) {
        switch (orderBy) {
            case PostOrderType.CREATED:
                return query.orderBy('post.createdAt', 'DESC');
            case PostOrderType.UPDATED:
                return query.orderBy('post.updatedAt', 'DESC');
            case PostOrderType.PUBLISHED:
                return query.orderBy('post.publishedAt', 'DESC');
            case PostOrderType.COMMENTCOUNT:
                return query.orderBy('commentCount', 'DESC');
            default:
                return query
                    .orderBy('post.createdAt', 'DESC')
                    .addOrderBy('post.updatedAt', 'DESC')
                    .addOrderBy('post.publishedAt', 'DESC')
                    .addOrderBy('commentCount', 'DESC');
        }
    }

    /**
     * 查询出分类及其后代分类下的所有文章的Query构建
     *
     * @param {string} id
     * @param {SelectQueryBuilder<PostEntity>} query
     * @returns
     * @memberof PostService
     */
    async queryByCategory(id: string, query: SelectQueryBuilder<PostEntity>) {
        const root = await this.categoryService.findOne(id);
        const tree = await this.categoryRepository.findDescendantsTree(root);
        const flatDes = await this.categoryRepository.toFlatTrees(tree.children);
        const ids = [tree.id, ...flatDes.map((item) => item.id)];
        return query.where('categories.id IN (:...ids)', {
            ids,
        });
    }
}

import { DtoValidation } from '@gkr/core';
import { IsModelExist } from '@gkr/database';
import { Injectable } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { PostOrderType } from '../constants';
import { CategoryEntity } from '../database/entities';

/**
 * 文章列表查询数据验证
 *
 * @export
 * @class QueryPostDto
 */
@Injectable()
@DtoValidation({ type: 'query' })
export class QueryPostDto {
    /**
     * 过滤分类
     *
     * @type {string}
     * @memberof QueryPostDto
     */
    @IsModelExist(CategoryEntity, {
        groups: ['update'],
        message: '指定的分类不存在',
    })
    @IsUUID(undefined, { groups: ['update'], message: '分类ID格式错误' })
    @IsOptional()
    category?: string;

    /**
     * 过滤发布状态
     * 不填则显示所有文章
     *
     * @type {boolean}
     * @memberof QueryPostDto
     */
    @Transform(({ value }) => JSON.parse(value.toLowerCase()))
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    /**
     * 排序方式
     * 不填则综合排序
     *
     * @type {PostOrderType}
     * @memberof QueryPostDto
     */
    @IsEnum(PostOrderType, {
        message: `排序规则必须是${Object.values(PostOrderType).join(',')}其中一项`,
    })
    @IsOptional()
    orderBy?: PostOrderType;

    /**
     * 当前分页
     *
     * @memberof QueryPostDto
     */
    @Transform((value) => Number(value))
    @IsNumber()
    @IsOptional()
    page = 1;

    /**
     * 每页显示数据
     *
     * @memberof QueryPostDto
     */
    @Transform((value) => Number(value))
    @IsNumber()
    @IsOptional()
    limit = 10;
}

import { DtoValidation } from '@gkr/core';
import { IsModelExist } from '@gkr/database';
import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { getManager } from 'typeorm';
import { CategoryEntity } from '../database/entities';
import { CategoryRepository } from '../database/repositories';
import { UpdatePostDto } from './update-post.dto';

@Injectable()
@DtoValidation({ groups: ['create'] })
export class CreatePostDto {
    @MaxLength(255, {
        always: true,
        message: '文章标题长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '文章标题必须填写' })
    title!: string;

    @IsNotEmpty({ groups: ['create'], message: '文章内容必须填写' })
    body!: string;

    @MaxLength(500, {
        always: true,
        message: '文章描述长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    summary?: string;

    @MaxLength(20, {
        each: true,
        always: true,
        message: '每个关键字长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    keywords?: string[];

    @IsModelExist(CategoryEntity, {
        each: true,
        always: true,
        message: '分类不存在',
    })
    @IsUUID(undefined, { each: true, always: true, message: '分类ID格式错误' })
    @IsOptional({ always: true })
    categories?: CategoryEntity[];

    async transform(obj: CreatePostDto | UpdatePostDto) {
        const em = getManager();
        if (obj.categories) {
            obj.categories = await em
                .getCustomRepository(CategoryRepository)
                .findByIds(obj.categories);
        }
        return obj;
    }
}

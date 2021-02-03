import { DtoValidation } from '@gkr/core';
import { IsModelExist, IsTreeUnique, IsTreeUniqueExist } from '@gkr/database';
import { Injectable } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { getManager } from 'typeorm';
import { CategoryEntity } from '../database/entities';
import { CategoryRepository } from '../database/repositories';
import { UpdateCategoryDto } from './update-category.dto';

@Injectable()
@DtoValidation({ groups: ['create'] })
export class CreateCategoryDto {
    @IsTreeUnique(
        { entity: CategoryEntity },
        {
            groups: ['create'],
            message: '分类名称重复',
        },
    )
    @IsTreeUniqueExist(
        { entity: CategoryEntity },
        {
            groups: ['update'],
            message: '分类名称重复',
        },
    )
    @MaxLength(25, {
        always: true,
        message: '分类名称长度不能超过$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '分类名称不得为空' })
    name!: string;

    @IsTreeUnique(
        { entity: CategoryEntity },
        {
            groups: ['create'],
            message: '分类别名重复',
        },
    )
    @IsTreeUniqueExist(
        { entity: CategoryEntity },
        {
            groups: ['update'],
            message: '分类别名重复',
        },
    )
    @MaxLength(50, {
        always: true,
        message: '分类别名长度不能超过$constraint1',
    })
    @IsOptional({ always: true })
    slug?: string;

    @Transform((value) => Number(value))
    @IsNumber(undefined, { message: '排序必须为整数' })
    @IsOptional({ always: true })
    order?: number;

    @IsModelExist(CategoryEntity, { always: true, message: '父分类不存在' })
    @IsUUID(undefined, { always: true, message: '分类ID格式不正确' })
    @IsOptional({ always: true })
    parent?: CategoryEntity;

    async transform(obj: CreateCategoryDto | UpdateCategoryDto) {
        const em = getManager();
        if (obj.parent) {
            obj.parent = await em.getCustomRepository(CategoryRepository).findOneOrFail(obj.parent);
        }
        return obj;
    }
}

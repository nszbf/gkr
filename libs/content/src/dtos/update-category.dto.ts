import { IsModelExist } from '@gkr/database';
import { Injectable } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';
import { CategoryEntity } from '../database/entities';
import { CreateCategoryDto } from './create-category.dto';

@Injectable()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @IsModelExist(CategoryEntity, {
        groups: ['update'],
        message: '指定的分类不存在',
    })
    @IsUUID(undefined, { groups: ['update'], message: '分类ID格式错误' })
    @IsDefined({ groups: ['update'], message: '分类ID必须指定' })
    id!: string;
}

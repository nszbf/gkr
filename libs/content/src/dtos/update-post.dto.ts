import { IsModelExist } from '@gkr/database';
import { Injectable } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';
import { PostEntity } from '../database/entities';
import { CreatePostDto } from './create-post.dto';

@Injectable()
export class UpdatePostDto extends PartialType(CreatePostDto) {
    @IsModelExist(PostEntity, {
        groups: ['update'],
        message: '指定的文章不存在',
    })
    @IsUUID(undefined, { groups: ['update'], message: '文章ID格式错误' })
    @IsDefined({ groups: ['update'], message: '文章ID必须指定' })
    id!: string;
}

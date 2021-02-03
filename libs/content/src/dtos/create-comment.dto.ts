import { DtoValidation } from '@gkr/core';
import { IsModelExist } from '@gkr/database';
import { Injectable } from '@nestjs/common';
import { IsDefined, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { getManager } from 'typeorm';
import { PostEntity } from '../database/entities';
import { PostRepository } from '../database/repositories';

@Injectable()
@DtoValidation()
export class CreateCommentDto {
    @MaxLength(1000, { message: '评论内容不能超过$constraint1个字' })
    @IsNotEmpty({ message: '评论内容不能为空' })
    body!: string;

    @IsModelExist(PostEntity, { always: true, message: '指定的文章不存在' })
    @IsUUID(undefined, { message: '文章ID格式错误' })
    @IsDefined({ message: '评论文章ID必须指定' })
    post!: PostEntity;

    async transform(obj: CreateCommentDto) {
        const em = getManager();
        if (obj.post) {
            obj.post = await em.getCustomRepository(PostRepository).findOneOrFail(obj.post);
        }
        return obj;
    }
}

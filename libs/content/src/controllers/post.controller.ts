import { BaseController } from '@gkr/core';
import { ParseUUIDEntityPipe } from '@gkr/database';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostEntity } from '../database/entities';
import { QueryPostDto } from '../dtos';
import { PostService } from '../services';

@Controller('posts')
export class PostController extends BaseController {
    constructor(protected postService: PostService) {
        super();
    }

    @Get()
    async index(
        @Query()
        { page, limit, ...params }: QueryPostDto,
    ) {
        return await this.postService.paginate(params, { page, limit });
    }

    @Get(':post')
    async show(@Param('post', new ParseUUIDEntityPipe(PostEntity, false)) post: string) {
        return await this.postService.findOne(post);
    }
}

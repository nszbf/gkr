import { ParseUUIDEntityPipe } from '@gkr/database';
import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { PostEntity } from '../../database/entities';
import { CreatePostDto, UpdatePostDto } from '../../dtos';
import { PostController } from '../post.controller';

@Controller('posts')
export class PostManageController extends PostController {
    @Post()
    async store(
        @Body()
        data: CreatePostDto,
    ) {
        return await this.postService.create(data);
    }

    @Patch()
    async update(
        @Body()
        data: UpdatePostDto,
    ) {
        return await this.postService.update(data);
    }

    @Delete(':post')
    async destroy(
        @Param('post', new ParseUUIDEntityPipe(PostEntity))
        post: PostEntity,
    ) {
        return await this.postService.delete(post);
    }
}

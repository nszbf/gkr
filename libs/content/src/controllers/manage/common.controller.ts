import { BaseController } from '@gkr/core';
import { Body, Controller, Delete, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CommentEntity } from '../../database/entities';
import { CreateCommentDto } from '../../dtos';
import { CommentService } from '../../services';

@Controller('comments')
export class CommentManageController extends BaseController {
    constructor(private commentService: CommentService) {
        super();
    }

    @Post()
    async store(
        @Body()
        data: CreateCommentDto,
    ) {
        return await this.commentService.create(data);
    }

    @Delete(':id')
    async destroy(
        @Param('id', new ParseUUIDPipe())
        comment: CommentEntity,
    ) {
        return this.commentService.delete(comment.id);
    }
}

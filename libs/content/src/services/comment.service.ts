import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '../database/entities';
import { CreateCommentDto } from '../dtos';

/**
 * 文章评论服务
 *
 * @export
 * @class CommentService
 */
@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(CommentEntity)
        private commentRepository: Repository<CommentEntity>,
    ) {}

    async create(data: CreateCommentDto) {
        const item = await this.commentRepository.save(data);
        return this.commentRepository.findOneOrFail(item.id);
    }

    async delete(id: string) {
        const item = await this.commentRepository.findOneOrFail(id);
        return await this.commentRepository.remove(item);
    }
}

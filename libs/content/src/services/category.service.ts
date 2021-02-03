import { Injectable } from '@nestjs/common';
import { CategoryEntity } from '../database/entities';
import { CategoryRepository } from '../database/repositories';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos';

/**
 * 内容分类服务
 *
 * @export
 * @class CategoryService
 */
@Injectable()
export class CategoryService {
    constructor(private categoryRepository: CategoryRepository) {}

    async findTrees() {
        return await this.categoryRepository.findTrees();
    }

    async findOne(id: string) {
        return await this.categoryRepository.findOneOrFail(id);
    }

    async create(data: CreateCategoryDto) {
        const item = await this.categoryRepository.save(data);
        return this.findOne(item.id);
    }

    async update(data: UpdateCategoryDto) {
        await this.categoryRepository.save(data);
        return await this.findOne(data.id);
    }

    async delete(category: CategoryEntity) {
        return await this.categoryRepository.remove(category);
    }
}

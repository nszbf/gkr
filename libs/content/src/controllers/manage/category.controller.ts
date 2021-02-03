import { ParseUUIDEntityPipe } from '@gkr/database';
import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CategoryEntity } from '../../database/entities';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dtos';
import { CategoryController } from '../category.controller';
@Controller('categories')
export class CategoryManageController extends CategoryController {
    @Post()
    async store(
        @Body()
        data: CreateCategoryDto,
    ) {
        return this.categoryService.create(data);
    }

    @Patch()
    async update(
        @Body()
        data: UpdateCategoryDto,
    ) {
        return this.categoryService.update(data);
    }

    @Delete(':category')
    async destroy(
        @Param('category', new ParseUUIDEntityPipe(CategoryEntity))
        category: CategoryEntity,
    ) {
        return this.categoryService.delete(category);
    }
}

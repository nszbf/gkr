import { BaseController } from '@gkr/core';
import { ParseUUIDEntityPipe } from '@gkr/database';
import { Controller, Get, Param } from '@nestjs/common';
import { CategoryEntity } from '../database/entities';
import { CategoryService } from '../services';

@Controller('categories')
export class CategoryController extends BaseController {
    constructor(protected categoryService: CategoryService) {
        super();
    }

    @Get()
    async index() {
        return this.categoryService.findTrees();
    }

    @Get(':category')
    async show(
        @Param('category', new ParseUUIDEntityPipe(CategoryEntity, false))
        category: string,
    ) {
        return this.categoryService.findOne(category);
    }
}

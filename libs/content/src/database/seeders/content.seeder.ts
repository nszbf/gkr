import { config, isFile, panic } from '@gkr/core';
import { BaseSeeder, DbFactory } from '@gkr/database';
import faker from 'faker';
import fs from 'fs';
import path from 'path';
import { Connection, In } from 'typeorm';
import { ICategoryData, IPostData } from '../../types';
import { CategoryEntity, CommentEntity, PostEntity } from '../entities';
import { IPostFactoryOptions } from '../factories/content.factory';
import { CategoryRepository } from '../repositories';

export default class ContentSeeder extends BaseSeeder {
    protected truncates = [PostEntity, CategoryEntity, CommentEntity];

    protected factory!: DbFactory;

    public async run(_factory: DbFactory, _connection: Connection): Promise<any> {
        this.factory = _factory;
        await this.loadCategories(config('content.fixture.categories', []));
        await this.loadPosts(config('content.fixture.posts', []));
    }

    private async genRandomComments(post: PostEntity, count: number, parent?: CommentEntity) {
        const comments: CommentEntity[] = [];
        for (let i = 0; i < count; i++) {
            const comment = new CommentEntity();
            comment.body = faker.lorem.paragraph(Math.floor(Math.random() * 18) + 1);
            comment.post = post;
            if (parent) {
                comment.parent = parent;
            }
            comments.push(await this.em.save(comment));
            if (Math.random() >= 0.8) {
                comment.children = await this.genRandomComments(
                    post,
                    Math.floor(Math.random() * 2),
                    comment,
                );
                await this.em.save(comment);
            }
        }
        return comments;
    }

    private async loadCategories(data: ICategoryData[], parent?: CategoryEntity): Promise<void> {
        let order = 0;
        for (const item of data) {
            const category = new CategoryEntity();
            category.name = item.name;
            category.order = order;
            if (parent) category.parent = parent;
            await this.em.save(category);
            order++;
            if (item.children) {
                await this.loadCategories(item.children, category);
            }
        }
    }

    private async loadPosts(data: IPostData[]) {
        const allCates = await this.em.find(CategoryEntity);
        for (const item of data) {
            const filePath = process.env.RUN_DIST
                ? path.join(path.dirname(process.env.RUN_DIST), item.contentFile)
                : path.join(process.cwd(), item.contentFile);
            if (!isFile(filePath)) {
                panic(this.spinner, `post content file ${filePath} not exits!`);
            }
            const options: IPostFactoryOptions = {
                title: item.title,
                body: fs.readFileSync(filePath, 'utf8'),
                isPublished: true,
            };
            if (item.summary) {
                options.summary = item.summary;
            }
            if (item.categories) {
                options.categories = await this.em
                    .getCustomRepository(CategoryRepository)
                    .find({ where: { name: In(item.categories) } });
            }
            const post = await this.factory(PostEntity)(options).create();
            await this.genRandomComments(post, Math.floor(Math.random() * 5));
        }
        const redoms = await this.factory(PostEntity)<IPostFactoryOptions>({
            categories: this.randListData(allCates),
        }).createMany(100);
        for (const redom of redoms) {
            await this.genRandomComments(redom, Math.floor(Math.random() * 2));
        }
    }
}

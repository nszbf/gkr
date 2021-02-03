import { defineFactory } from '@gkr/database';
import Faker from 'faker';
import { CategoryEntity, CommentEntity, PostEntity } from '../entities';

export type IPostFactoryOptions = Partial<{
    title: string;
    summary: string;
    body: string;
    isPublished: boolean;
    categories: CategoryEntity[];
    comments: CommentEntity[];
}>;
export const ContentFactory = defineFactory(
    PostEntity,
    async (faker: typeof Faker, options?: IPostFactoryOptions) => {
        faker.setLocale('zh_CN');
        const post = new PostEntity();
        post.title = options?.title ?? faker.lorem.sentence(Math.floor(Math.random() * 10) + 6);
        if (options?.summary) {
            post.summary = options.summary;
        }
        post.body = options?.body ?? faker.lorem.paragraph(Math.floor(Math.random() * 500) + 1);
        post.isPublished = post.isPublished ?? Math.random() >= 0.5;
        if (options?.categories) {
            post.categories = options.categories;
        }
        return post;
    },
);

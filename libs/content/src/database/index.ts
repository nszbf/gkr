import { DbUtilMeta } from '@gkr/database';
import * as entities from './entities';
import { ContentFactory } from './factories/content.factory';
import * as repositories from './repositories';
import ContentSeeder from './seeders/content.seeder';
import { CategorySubscriber } from './subscribers/category.subscriber';
import { PostSubscriber } from './subscribers/post.subscriber';

export const database: DbUtilMeta['database'] = {
    entities: Object.values(entities),
    repositories: Object.values(repositories),
    subscribers: [CategorySubscriber, PostSubscriber],
    seeders: [ContentSeeder],
    factories: [ContentFactory],
};

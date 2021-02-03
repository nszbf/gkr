import { DbUtilMeta } from '@gkr/database';
import * as entities from './entities';
import { UserFactory } from './factories/user.factory';
import * as repositories from './repositories';
import UserSeeder from './seeders/user.seeder';
import { UserSubscriber } from './subscribers/user.subscriber';

export const database: DbUtilMeta['database'] = {
    entities: Object.values(entities),
    repositories: Object.values(repositories),
    subscribers: [UserSubscriber],
    seeders: [UserSeeder],
    factories: [UserFactory],
};

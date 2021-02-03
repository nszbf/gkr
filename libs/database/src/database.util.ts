import { ModuleMetaResolve } from '@gkr/core';
import { Type } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { BaseDbUtil } from './base/dbutil';
import { ADDTIONAL_RELATIONS } from './constants';
import { DbFactoryOption, DbUtilMeta, DynamicRelation, SeederConstructor } from './types';

export * from './base/seeder';
/**
 * 数据库工具类
 *
 * @export
 * @class DatabaseUtil
 */
export class DatabaseUtil extends BaseDbUtil {
    addEnitities(entities: EntityClassOrSchema[], connection?: string) {
        const cname = connection ?? this._default;
        if (!this.config.find((item) => item.name === cname)) {
            throw new Error(`Connection named ${cname}'s option not exists!`);
        }
        this.entities[cname] = [...(this.entities[cname] ?? []), ...entities].map((e) => {
            const relationsRegister = Reflect.getMetadata(ADDTIONAL_RELATIONS, e);
            if ('prototype' in e && relationsRegister && typeof relationsRegister === 'function') {
                const relations: DynamicRelation[] = relationsRegister();
                relations.forEach(({ column, relation }) => {
                    const cProperty = Object.getOwnPropertyDescriptor(e.prototype, column);
                    if (!cProperty) {
                        Object.defineProperty(e.prototype, column, {
                            writable: true,
                        });
                        relation(e, column);
                    }
                });
            }
            return e;
        });
    }

    addMigrations(migrations: Type<any>[], connection?: string) {
        const cname = connection ?? this._default;
        if (!this.config.find((item) => item.name === cname)) {
            throw new Error(`Connection named ${cname}'s option not exists!`);
        }
        this.migrations[cname] = [...(this.migrations[cname] ?? []), ...migrations];
    }

    addSubscribers(subscribers: Type<any>[], connection?: string) {
        const cname = connection ?? this._default;
        if (!this.config.find((item) => item.name === cname)) {
            throw new Error(`Connection named ${cname}'s option not exists!`);
        }
        this.subscribers[cname] = [
            ...(this.subscribers[cname] ?? []),
            ...subscribers.map((sub) => {
                const cnameProperty = Object.getOwnPropertyDescriptor(sub.prototype, 'cname');
                if (!cnameProperty) {
                    Object.defineProperty(sub.prototype, 'cname', {
                        value: cname,
                        writable: true,
                    });
                }
                return sub;
            }),
        ];
    }

    addRepositories(repositories: EntityClassOrSchema[]) {
        this.repositories = [...this.repositories, ...repositories];
    }

    addSeeders(seeders: SeederConstructor[], module: Type<any>) {
        const moduleSeeder = this._seeders.find((item) => item.module === module);
        if (moduleSeeder) {
            moduleSeeder.seeders = [...moduleSeeder.seeders, ...seeders];
        } else {
            this._seeders.push({ module, seeders });
        }
    }

    addFactories(factories: (() => DbFactoryOption<any, any>)[]) {
        for (const factory of factories) {
            const { entity, handler } = factory();
            this._factories[entity.name] = { entity, handler };
        }
    }

    resolveModule({ meta, module }: ModuleMetaResolve<DbUtilMeta>) {
        const { database } = meta;
        if (database?.migrations) {
            database?.migrations.forEach((item) => {
                'use' in item
                    ? this.addMigrations([item.use], item.connection)
                    : this.addMigrations([item]);
            });
        }

        if (database?.entities) {
            database?.entities.forEach((item) => {
                'use' in item
                    ? this.addEnitities([item.use], item.connection)
                    : this.addEnitities([item]);
            });
        }

        if (database?.repositories) {
            this.addRepositories(database?.repositories);
        }
        if (database?.subscribers) {
            database?.subscribers.forEach((item) => {
                'use' in item
                    ? this.addSubscribers([item.use], item.connection)
                    : this.addSubscribers([item]);
            });
        }
        if (database?.seeders) {
            this.addSeeders(database.seeders, module);
        }
        if (database?.factories) {
            this.addFactories(database.factories);
        }
        return { meta, module };
    }
}

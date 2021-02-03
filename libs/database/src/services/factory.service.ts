import { isPromiseLike, printError } from '@gkr/core';
import Faker from 'faker';
import { Connection, ObjectType } from 'typeorm';
import { DbFactoryHandler, FactoryOverride } from '../types';

/**
 * 运行Factory
 */
export class FactoryService<Entity, Settings> {
    private mapFunction!: (entity: Entity) => Promise<Entity>;

    constructor(
        public name: string,
        public entity: ObjectType<Entity>,
        protected readonly connection: Connection,
        private readonly factory: DbFactoryHandler<Entity, Settings>,
        private readonly settings?: Settings,
    ) {}

    map(mapFunction: (entity: Entity) => Promise<Entity>): FactoryService<Entity, Settings> {
        this.mapFunction = mapFunction;
        return this;
    }

    async make(overrideParams: FactoryOverride<Entity> = {}): Promise<Entity> {
        if (this.factory) {
            let entity = await this.resolveEntity(await this.factory(Faker, this.settings));
            if (this.mapFunction) {
                entity = await this.mapFunction(entity);
            }
            for (const key in overrideParams) {
                if (overrideParams[key]) {
                    entity[key] = overrideParams[key]!;
                }
            }

            return entity;
        }
        throw new Error('Could not found entity');
    }

    async create(overrideParams: FactoryOverride<Entity> = {}): Promise<Entity> {
        const em = this.connection.createEntityManager();
        try {
            const entity = await this.make(overrideParams);
            return em.save(entity);
        } catch (error) {
            const message = 'Could not save entity';
            printError(message, error);
            throw new Error(message);
        }
    }

    async makeMany(
        amount: number,
        overrideParams: FactoryOverride<Entity> = {},
    ): Promise<Entity[]> {
        const list = [];
        for (let index = 0; index < amount; index += 1) {
            list[index] = await this.make(overrideParams);
        }
        return list;
    }

    async createMany(
        amount: number,
        overrideParams: FactoryOverride<Entity> = {},
    ): Promise<Entity[]> {
        const list = [];
        for (let index = 0; index < amount; index += 1) {
            list[index] = await this.create(overrideParams);
        }
        return list;
    }

    private async resolveEntity(entity: Entity): Promise<Entity> {
        for (const attribute in entity) {
            if (entity[attribute]) {
                if (isPromiseLike(entity[attribute])) {
                    entity[attribute] = await Promise.resolve(entity[attribute]);
                }

                if (typeof entity[attribute] === 'object' && !(entity[attribute] instanceof Date)) {
                    const subEntityFactory = entity[attribute];
                    try {
                        if (typeof (subEntityFactory as any).make === 'function') {
                            entity[attribute] = await (subEntityFactory as any).make();
                        }
                    } catch (error) {
                        const message = `Could not make ${(subEntityFactory as any).name}`;
                        printError(message, error);
                        throw new Error(message);
                    }
                }
            }
        }
        return entity;
    }
}

import { Type } from '@nestjs/common';
import ora from 'ora';
import { Connection, EntityManager } from 'typeorm';
import { factoryBuilder, resetForeignKey } from '../helpers';
import { DbFactory, DbSeedArguments, Seeder, SeederConstructor } from '../types';

const getRandomIndex = (count: number) => Math.floor(Math.random() * Math.floor(count - 1));
export abstract class BaseSeeder implements Seeder {
    protected connection!: Connection;

    protected em!: EntityManager;

    protected truncates: Type<any>[] | Array<new (...args: any[]) => any> = [];

    constructor(protected readonly spinner: ora.Ora, protected readonly args: DbSeedArguments) {}

    async load(factory: DbFactory, connection: Connection): Promise<any> {
        this.connection = await resetForeignKey(connection);

        this.em = this.connection.createEntityManager();
        for (const truncate of this.truncates) {
            await this.em.clear(truncate);
        }
        this.connection = await resetForeignKey(connection, false);
        const result = await this.run(factory, this.connection);
        return result;
    }

    /**
     * 运行seeder的关键方法
     *
     * @param factory
     * @param connection
     */
    protected abstract run(factory: DbFactory, connection: Connection): Promise<any>;

    /**
     * 运行子seeder
     *
     * @param SubSeeder
     */
    protected async call(SubSeeder: SeederConstructor) {
        const subSeeder: Seeder = new SubSeeder(this.spinner, this.args);
        await subSeeder.load(factoryBuilder(this.connection), this.connection);
    }

    protected randItemData<
        T extends { id: string; [key: string]: any } = {
            id: string;
            [key: string]: any;
        }
    >(list: T[]) {
        return list[getRandomIndex(list.length)];
    }

    protected randListData<
        T extends { id: string; [key: string]: any } = {
            id: string;
            [key: string]: any;
        }
    >(list: T[]) {
        const result: T[] = [];
        for (let i = 0; i <= getRandomIndex(list.length); i++) {
            const random = this.randItemData<T>(list);
            if (!result.find((item) => item.id === random.id)) {
                result.push(random);
            }
        }
        return result;
    }
}

import { CommandHandlerArgs } from '@gkr/core';
import { Type } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import Faker from 'faker';
import ora from 'ora';
import { Connection, ObjectType, OneToMany, OneToOne, SelectQueryBuilder } from 'typeorm';

export interface DbUtilMeta {
    database?: {
        entities?: Array<EntityClassOrSchema | { use: EntityClassOrSchema; connection?: string }>;
        repositories?: EntityClassOrSchema[];
        subscribers?: Array<Type<any> | { use: Type<any>; connection?: string }>;
        migrations?: Array<Type<any> | { use: Type<any>; connection?: string }>;
        seeders?: SeederConstructor[];
        factories?: (() => DbFactoryOption<any, any>)[];
    };
}

export interface DynamicRelation {
    relation: ReturnType<typeof OneToOne> | ReturnType<typeof OneToMany>;
    column: string;
}

/**
 * 数据库配置
 *
 * @export
 * @interface DatabaseConfig
 * @template T
 */
export interface DatabaseConfig<T extends DbOption = DbOption> {
    default: string;
    enabled: string[];
    connections: T[];
    common: Record<string, any> & DbAdditionalOption;
}

type DbAdditionalOption = {
    seeder?: SeederConstructor;
    migrations?: Array<Type<any> | { use: Type<any>; connection?: string }>;
    paths?: {
        entities?: string;
        migrations?: string;
        subscribers?: string;
    };
};

/**
 * 数据库连接配置
 */
export type DbOption = TypeOrmModuleOptions &
    DbAdditionalOption & {
        name: string;
        migrations?: Array<Type<any> | { use: Type<any>; connection?: string }>;
    } & Record<string, any>;

/**
 * 为query添加查询的回调函数接口
 */
export type QueryHook<Entity> = (
    hookQuery: SelectQueryBuilder<Entity>,
) => Promise<SelectQueryBuilder<Entity>>;

/** ****************************************** Seeder **************************************** */
/**
 * Seeder类接口
 */
export interface Seeder {
    load: (factory: DbFactory, connection: Connection) => Promise<void>;
}

/**
 * Seeder类构造器接口
 */
export type SeederConstructor = new (spinner: ora.Ora, args: DbSeedArguments) => Seeder;

/** ****************************************** Factory **************************************** */

export type DbFactory = <Entity>(entity: ObjectType<Entity>) => <Options>(options?: Options) => any;

/**
 *  获取entity映射的factory的函数接口
 */
export type DbFactoryBuilder = (connection: Connection) => DbFactory;

export type DefineFactory = <E, O>(
    entity: ObjectType<E>,
    handler: DbFactoryHandler<E, O>,
) => () => DbFactoryOption<E, O>;

export type DbFactoryOption<E, O> = {
    entity: ObjectType<E>;
    handler: DbFactoryHandler<E, O>;
};

export type DbFactoryHandler<E, O> = (faker: typeof Faker, options?: O) => Promise<E>;

export type FactoryOverride<Entity> = {
    [Property in keyof Entity]?: Entity[Property];
};

/** ****************************************** Command **************************************** */

export type DbRefreshArguments = CommandHandlerArgs<{
    connection?: string;
    seed?: boolean;
    destory?: boolean;
}>;

export type DbSeedArguments = CommandHandlerArgs<{
    connection?: string;
    modules?: string[];
}>;
// export interface DbSeedArguments extends AppCommandArgs {
//     connection?: string;
//     modules?: string[];
// }

export type TypeOrmArguments = CommandHandlerArgs<{
    connection?: string;
}>;

export interface MigrationCreateArguments extends TypeOrmArguments {
    name: string;
    module: string;
}

export interface MigrationGenerateArguments extends TypeOrmArguments {
    name: string;
    dir?: string;
    pretty?: boolean;
}

export interface MigrationRunArguments extends TypeOrmArguments {
    transaction?: string;
    seed?: boolean;
    modules?: string[];
}

export interface MigrationRevertArguments extends TypeOrmArguments {
    transaction?: string;
}

export interface MigrationRefreshArguments extends TypeOrmArguments {
    transaction?: string;
    seed?: boolean;
    modules?: string[];
    force?: boolean;
}

import { Gkr, panic } from '@gkr/core';
import merge from 'deepmerge';
import ora from 'ora';
import {
    Connection,
    ConnectionOptions,
    getConnection,
    getConnectionManager,
    ObjectType,
} from 'typeorm';
import { DatabaseUtil } from './database.util';
import { FactoryService } from './services/factory.service';
import {
    DbFactoryBuilder,
    DbOption,
    DbSeedArguments,
    DefineFactory,
    Seeder,
    SeederConstructor,
} from './types';

/** ****************************************** Base **************************************** */

const db = () => Gkr.util.get(DatabaseUtil);

/**
 * 获取Entity类名
 *
 * @export
 * @template T
 * @param {ObjectType<T>} entity
 * @returns {string}
 */
export function entityName<T>(entity: ObjectType<T>): string {
    if (entity instanceof Function) {
        return entity.name;
    }
    if (entity) {
        return new (entity as any)().constructor.name;
    }
    throw new Error('Enity is not defined');
}

/** ****************************************** Options **************************************** */
/**
 * 获取所有数据库的连接配置
 *
 * @export
 * @template T
 * @returns {T[]}
 */
export function dbOptions<T extends DbOption = DbOption>(): T[] {
    return db().getOptions<T>();
}

/**
 * 通过名称获取一个数据库的连接配置
 *
 * @export
 * @template T
 * @param {string} [name]
 * @returns {T}
 */
export function dbOption<T extends DbOption = DbOption>(name?: string): T {
    return db().getOption<T>(name);
}

/**
 * 获取所有数据库连接名
 *
 * @export
 * @returns {string[]}
 */
export function dbNames(): string[] {
    return db().names;
}

/**
 * 获取默认数据库连接名
 *
 * @export
 * @returns {string}
 */
export function defaultDbName(): string {
    return db().default;
}

/** ****************************************** Connection **************************************** */
export async function makeCliConnection(name?: string) {
    const spinner = ora('Start connect to database').start();
    let connection: Connection | undefined;
    try {
        connection = await makeConnection(name);
        spinner.succeed();
    } catch (err) {
        panic(spinner, `Connection to database named ${name} failed!`, err);
    }
    return connection!;
}
/**
 * 关闭外键检测,防止数据注入出错
 *
 * @export
 * @param {Connection} connection
 * @param {boolean} [enabled=true]
 * @returns {Promise<Connection>}
 */
export async function resetForeignKey(connection: Connection, enabled = true): Promise<Connection> {
    const { type } = connection.driver.options;
    let key: string;
    let query: string;
    if (type === 'sqlite') {
        key = enabled ? 'OFF' : 'ON';
        query = `PRAGMA foreign_keys = ${key};`;
    } else {
        key = enabled ? '0' : '1';
        query = `SET FOREIGN_KEY_CHECKS = ${key};`;
    }
    await connection.query(query);
    return connection;
}

/**
 * 创建一个临时连接
 * 主要用于CLI操作
 *
 * @export
 * @param {string} [name]
 * @returns {Promise<Connection>}
 */
export async function makeConnection(
    name?: string,
    options?: Omit<DbOption, 'name'>,
): Promise<Connection> {
    const option = options
        ? merge(db().getOption(name) as Record<string, any>, options, {
              arrayMerge: (_d, s, _o) => s,
          })
        : db().getOption(name);
    try {
        if (getConnection(option.name).isConnected) {
            await getConnection(option.name).close();
        }
        // eslint-disable-next-line no-empty
    } catch (err) {}
    return getConnectionManager()
        .create(option as ConnectionOptions)
        .connect();
}

/** ****************************************** Seeder && Factory **************************************** */
/**
 * 定义factory,绑定Entiy类名
 * factoryFn自动注入faker.js对象
 *
 * @param entity
 * @param handler
 */
export const defineFactory: DefineFactory = (entity, handler) => () => ({
    entity,
    handler,
});

/**
 * factory函数,使用高阶包装
 * ObjectType通过new (): T用于从类生成接口类型
 *
 * @param entity
 */
export const factoryBuilder: DbFactoryBuilder = (connection) => (entity) => (settings) => {
    const name = entityName(entity);
    if (!db().factories[name]) {
        throw new Error(`has none factory for entity named ${name}`);
    }
    return new FactoryService(name, entity, connection, db().factories[name].handler, settings);
};

/**
 * 运行seeder
 *
 * @param Clazz
 */
export async function runSeeder(
    Clazz: SeederConstructor,
    args: DbSeedArguments,
    spinner: ora.Ora,
): Promise<Connection> {
    const seeder: Seeder = new Clazz(spinner, args);
    const connection = await makeCliConnection(args.connection);
    await seeder.load(factoryBuilder(connection), connection);
    return connection;
}

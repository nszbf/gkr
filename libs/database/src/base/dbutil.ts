import { BaseUtil, ClassType, CommandContiner, IConfigMaps, ModuleMetaResolve } from '@gkr/core';
import { Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import merge from 'deepmerge';
import { getConnection } from 'typeorm';
import * as commandMaps from '../commands';
import { DatabaseConfig, DbFactoryOption, DbOption, DbUtilMeta, SeederConstructor } from '../types';

/**
 * 数据库工具类
 *
 * @export
 * @class DatabaseUtil
 */
export abstract class BaseDbUtil extends BaseUtil<DbOption[]> {
    protected migrations: {
        [connectionName: string]: Type<any>[];
    } = {};

    protected entities: {
        [connectionName: string]: EntityClassOrSchema[];
    } = {};

    protected repositories: EntityClassOrSchema[] = [];

    protected subscribers: {
        [connectionName: string]: Type<any>[];
    } = {};

    protected _seeders: {
        module: ClassType<any>;
        seeders: SeederConstructor[];
    }[] = [];

    protected _factories: {
        [entityName: string]: DbFactoryOption<any, any>;
    } = {};

    protected configMaps: IConfigMaps = {
        required: true,
        maps: 'database',
    };

    protected _default!: string;

    protected _names: string[] = [];

    /**
     * 获取默认数据库配置名称
     *
     * @returns
     * @memberof Database
     */
    get default() {
        return this._default;
    }

    /**
     * 获取所有数据库配置名
     *
     * @returns
     * @memberof Database
     */
    get names() {
        return this._names;
    }

    get seeders() {
        return this._seeders;
    }

    get factories() {
        return this._factories;
    }

    /**
     * 获取所有连接配置
     *
     * @template T
     * @returns {T[]}
     * @memberof Database
     */
    getOptions<T extends DbOption = DbOption>(): T[] {
        return this.config.map((option) => ({
            ...option,
            migrations: this.migrations[option.name] as any[],
            entities: this.entities[option.name],
            subscribers: this.subscribers[option.name] as any[],
        })) as T[];
    }

    /**
     * 根据名称获取一个数据库连接的配置，可设置类型
     * name不设置的情况下返回默认连接的配置
     *
     * @template T
     * @param {string} [name]
     * @returns {T}
     * @memberof Database
     */
    getOption<T extends DbOption = DbOption>(name?: string): T {
        const findName: string | undefined = name ?? this._default;
        const option = this.getOptions().find((item) => item.name === findName);
        if (!option) {
            throw new Error(`Connection named ${findName}'s option not exists!`);
        }
        return option as T;
    }

    /**
     * 获取用于TypeOrmModule的数据库连接的配置
     * 设置autoLoadEntities为true,使entity在autoLoadEntities后自动加载
     * 由于entity在autoLoadEntities后自动加载,subscriber由提供者方式注册
     * 所以在配置中去除这两者
     *
     * @returns
     * @memberof Database
     */
    getNestOptions() {
        const options = this.getOptions().map((option) => {
            const all = {
                ...option,
                subscribers: (option.subscribers ?? []).map((item: any) => {
                    const sub = item;
                    if (sub.prototype.cname === this._default) {
                        Object.defineProperty(sub.prototype, 'cname', {
                            ...Object.getOwnPropertyDescriptor(sub.prototype, 'cname'),
                            value: undefined,
                            writable: false,
                        });
                    }
                    return sub;
                }),
                keepConnectionAlive: option.keepConnectionAlive ?? true,
                autoLoadEntities: true,
            };
            const { entities, migrations, ...nestOption } = all;
            if (option.name === this._default) {
                const { name, ...nameNone } = nestOption;
                return nameNone;
            }
            return nestOption;
        }) as DbOption[];
        return options;
    }

    /**
     * 根据名称获取一个用于TypeOrmModule的数据库连接的配置
     * 没有名称则获取默认配置
     *
     * @param {string} [name]
     * @returns
     * @memberof Database
     */
    getNestOption(name?: string) {
        const option = this.getNestOptions().find((item) => item.name === name);
        if (!option) {
            throw new Error(`Connection named ${name}'s option not exists!`);
        }
        return option;
    }

    async close() {
        this.getNestOptions().forEach(async (option) => {
            try {
                await getConnection(option.name).close();
                // eslint-disable-next-line no-empty
            } catch (err) {}
        });
        this.getOptions().forEach(async (option) => {
            try {
                await getConnection(option.name).close();
                // eslint-disable-next-line no-empty
            } catch (err) {}
        });
    }

    registerCommands(): CommandContiner<any, any>[] {
        return Object.values(commandMaps);
    }

    resolveModule({ meta, module }: ModuleMetaResolve<DbUtilMeta>) {
        return { meta, module };
    }

    registerMeta() {
        return {
            imports: () => {
                const imports = [
                    ...this.getNestOptions().map((connection) => TypeOrmModule.forRoot(connection)),
                    TypeOrmModule.forFeature(this.repositories),
                ];
                for (const name in this.entities) {
                    if (this.entities[name].length > 0) {
                        imports.push(TypeOrmModule.forFeature(this.entities[name]));
                    }
                }
                return imports;
            },
            providers: () => Object.values(this.subscribers).reduce((o, n) => [...o, ...n], []),
            exports: () => [TypeOrmModule.forFeature(this.repositories)],
        };
    }

    create(config: DatabaseConfig) {
        // 如果没有配置默认数据库则抛出异常
        if (!config.default) {
            throw new Error('default database connection name should been config!');
        }
        // 只把启用的数据库配置写入this.config
        // 数据库配置名必须填写,没有数据库配置名的直接略过
        this.config = config.connections
            .filter((connect) => {
                if (!connect.name) return false;
                if (config.default === connect.name) return true;
                return config.enabled.includes(connect.name);
            })
            .map((connect) => {
                const common = merge(
                    {
                        paths: {
                            entities: 'entities',
                            migrations: 'migration',
                            subscribers: 'subscribers',
                        },
                    },
                    config.common,
                );
                return merge(common, connect as Record<string, any>) as DbOption;
            });
        // 把启用的数据库配置名写入this.names
        this.config.forEach((connect) => {
            this._names.push(connect.name!);
            this.entities[connect.name!] = [];
            this.migrations[connect.name!] = (connect.migrations as Type<any>[]) ?? [];
            this.subscribers[connect.name!] = [];
        });
        this._default = config.default;
        // 如果启用的数据库配置名中不包含默认配置名则抛出异常
        if (!this._names.includes(this._default)) {
            throw new Error(`Default database connection named ${this._default} not exists!`);
        }
    }
}

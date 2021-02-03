import { BaseUtil, getUtil, hasUtil, IConfigMaps, ModuleMetaResolve } from '@gkr/core';
import { RedisUtil } from '@gkr/redis';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { DynamicModule, Type } from '@nestjs/common';
import { omit } from 'lodash';
import { QueueConfig, QueueOption, QueueUtilMeta } from './types';

/**
 * 列队设置
 *
 * @export
 * @class Redis
 * @extends {BaseUtil<RedisModuleOptions[]>}
 */
export class QueueUtil extends BaseUtil<QueueOption[]> {
    /**
     * 配置映射
     *
     * @protected
     * @type {IConfigMaps}
     * @memberof Redis
     */
    protected configMaps: IConfigMaps = {
        required: true,
        maps: 'redis',
    };

    /**
     * 默认配置名
     *
     * @protected
     * @type {string}
     * @memberof Redis
     */
    protected _default!: string;

    /**
     * 所有配置名
     *
     * @protected
     * @type {string[]}
     * @memberof Redis
     */
    protected _names: string[] = [];

    /**
     * 获取默认配置名称
     *
     * @returns
     * @memberof Database
     */
    get default() {
        return this._default;
    }

    /**
     * 获取所有配置名
     *
     * @returns
     * @memberof Database
     */
    get names() {
        return this._names;
    }

    /**
     * 获取所有配置
     *
     * @returns
     * @memberof Redis
     */
    getOptions() {
        return this.config;
    }

    /**
     * 获取单个配置
     *
     * @param {string} [name]
     * @returns
     * @memberof Redis
     */
    getOption(name?: string) {
        const findName: string | undefined = name ?? this._default;
        const option = this.getOptions().find((item) => item.name === findName);
        if (!option) {
            throw new Error(`Connection named ${findName}'s option not exists!`);
        }
        return option;
    }

    /**
     * 注册bull模块
     *
     */
    registerImports() {
        if (!hasUtil(RedisUtil)) {
            throw new Error('Queue depend on Redis,if want to use, please enable Redis first');
        }
        const redis = getUtil(RedisUtil);
        return () =>
            this.config.map((connection) => {
                if (connection.redis && !redis.names.includes(connection.redis)) {
                    throw new Error(
                        `Redis connection config named ${connection.redis} not exists!`,
                    );
                }
                return BullModule.forRoot(connection.name, {
                    redis: redis.getOption(connection.redis),
                    ...omit(connection, ['name', 'redis']),
                });
            });
    }

    registerMeta() {
        if (!hasUtil(RedisUtil)) {
            throw new Error('Queue depend on Redis,if want to use, please enable Redis first');
        }
        const redis = getUtil(RedisUtil);
        return {
            imports: () =>
                this.config.map((connection) => {
                    if (connection.redis && !redis.names.includes(connection.redis)) {
                        throw new Error(
                            `Redis connection config named ${connection.redis} not exists!`,
                        );
                    }
                    return BullModule.forRoot(connection.name, {
                        redis: redis.getOption(connection.redis),
                        ...omit(connection, ['name', 'redis']),
                    });
                }),
        };
    }

    resolveModule({ meta, module }: ModuleMetaResolve<QueueUtilMeta>) {
        let producers: DynamicModule[] = [];
        let consumers: Type<any>[] = [];
        const { queue } = meta;
        if (queue?.producers) {
            queue.producers.forEach((option) => {
                if (option.configKey && !this._names.includes(option.configKey)) {
                    throw new Error(
                        `Queue connection config named ${option.configKey} not exists!`,
                    );
                }
            });
            producers = queue.producers.map((option) =>
                BullModule.registerQueue({
                    ...option,
                    configKey: option.configKey ?? this._default,
                }),
            );
        }
        if (queue?.consumers) {
            consumers = queue.consumers;
        }
        return {
            meta: {
                ...meta,
                imports: [...(meta.imports ?? []), ...producers],
                providers: [...(meta.providers ?? []), ...consumers],
            },
            module,
        };
    }

    addProducers(...producers: BullModuleOptions[]) {
        producers.forEach((option) => {
            if (option.configKey && !this._names.includes(option.configKey)) {
                throw new Error(`Queue connection config named ${option.configKey} not exists!`);
            }
        });

        return producers.map((option) =>
            BullModule.registerQueue({
                ...option,
                configKey: option.configKey ?? this._default,
            }),
        );
    }

    /**
     * 创建配置
     *
     * @param {RedisConfig} config
     * @memberof Redis
     */
    create(config: QueueConfig) {
        // 如果没有默认配置则抛出异常
        if (!config.default) {
            throw new Error('default queue connection name should been config!');
        }
        this.config = config.connections.filter((connect) => {
            if (!connect.name) return false;
            if (config.default === connect.name) return true;
            return config.enabled.includes(connect.name);
        });
        // 把启用的配置名写入this.names
        this.config.forEach((connect) => this._names.push(connect.name!));
        this._default = config.default;
        // 如果启用的配置名中不包含默认配置名则抛出异常
        if (!this._names.includes(this._default)) {
            throw new Error(`Default queue connection named ${this._default} not exists!`);
        }
    }
}

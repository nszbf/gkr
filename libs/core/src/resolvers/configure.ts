import merge from 'deepmerge';
import { get, has, set } from 'lodash';
import { loadEnvs } from '../env';
import { BaseConfig, ConfigRegCollection } from '../types';

const defaultConfigs: BaseConfig = {
    app: {
        timezone: 'UTC',
        locale: 'en',
        debug: true,
        port: 3000,
        host: 'localhost',
        https: false,
        hash: 10,
        utils: [],
        modules: [],
    },
};

/**
 * 核心配置类
 *
 * @export
 * @class Configure
 * @template T
 */
class Configure<T extends BaseConfig = BaseConfig> {
    protected _created = false;

    protected _config!: { [key: string]: any };

    protected _registers!: ConfigRegCollection<T>;

    /**
     * 根据传入的配置构造器对象集创建所有配置
     *
     * @param {ConfigRegCollection<T>} _config
     * @memberof Configure
     */
    create(_config: ConfigRegCollection<T>) {
        if (!this._created) {
            this.reset(_config);
        }
    }

    reset(_config: ConfigRegCollection<T>) {
        loadEnvs();
        this._config = this.loadConfig(_config);
        this._created = true;
    }

    /**
     * 判断是否创建
     *
     * @readonly
     * @memberof Configure
     */
    get created() {
        return this._created;
    }

    /**
     * 获取一个配置,不存在则返回defaultValue
     *
     * @template CT
     * @param {string} key
     * @param {CT} [defaultValue]
     * @returns
     * @memberof Configure
     */
    get<CT extends any = any>(key: string, defaultValue?: CT) {
        if (!has(this._config, key) && defaultValue === undefined) {
            return undefined;
        }
        return get(this._config, key, defaultValue) as CT;
    }

    /**
     * 判断一个配置是否存在
     *
     * @static
     * @param {string} key
     * @returns {boolean}
     * @memberof Configure
     */
    has(key: string): boolean {
        return has(this._config, key);
    }

    /**
     * 获取所有配置
     *
     * @template CT
     * @returns
     * @memberof Configure
     */
    all<CT extends T = T>() {
        return this._config as CT;
    }

    /**
     * 设置配置
     *
     * @template CT
     * @param {string} key
     * @param {() => CT} callback
     * @param {boolean} [isAdd=true]
     * @returns
     * @memberof Configure
     */
    set<CT extends any = any>(key: string, callback: () => CT, isAdd = true) {
        const config = callback();
        if (isAdd || !this.has(key)) {
            set(this._config, key, config);
            return this;
        }
        if (!(config instanceof Object)) {
            return this;
        }
        const newConfig = Array.isArray(config)
            ? Array.from(new Set([...this._config[key], ...config]))
            : merge(this._config[key], config, {
                  arrayMerge: (_d, s, _o) => Array.from(new Set([..._d, ...s])),
              });
        set(this._config, key, newConfig);
        return this;
    }

    /**
     * 加载配置
     *
     * @protected
     * @param {ConfigRegCollection<T>} _config
     * @returns
     * @memberof Configure
     */
    protected loadConfig(_config: ConfigRegCollection<T>) {
        const customConfigs = Object.fromEntries(
            Object.entries(_config).map(([name, value]) => [name, value()]),
        );
        const config = merge(defaultConfigs, customConfigs, {
            arrayMerge: (_d, s, _o) => s,
        }) as T;
        if (!config.app.url) {
            config.app.url = `${config.app.https ? 'https' : 'http'}://${config.app.host!}:${
                config.app.port
            }`;
        }
        return config;
    }
}

export { Configure };

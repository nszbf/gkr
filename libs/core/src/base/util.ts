/*
 * Description  : 使用配置的Util的基类
 * Author       : lichnow
 * Homepage     : https://gkr.io
 * My Blog      : https://lichnow.com
 * Date         : 2020-03-28 23:31:51 +0800
 * LastEditTime : 2021-02-03 12:56:58 +0800
 * Licensed     : MIT
 */
import { set } from 'lodash';
import { Configure } from '../resolvers/configure';
import { CommandContiner, ModuleMetaResolve, UtilMetaRegister } from '../types';

/**
 * 配置映射接口
 *
 * @export
 * @interface IConfigMaps
 */
export interface IConfigMaps {
    required?: boolean | string[];
    maps?: { [key: string]: string } | string;
}

/**
 * 工具基础类
 * 所有工具都应该继承此类
 *
 * @export
 * @abstract
 * @class BaseUtil
 * @template CT
 */
export abstract class BaseUtil<CT> {
    protected created = false;

    /**
     * 配置类
     *
     * @protected
     * @type {Configure}
     * @memberof BaseUtil
     */
    protected configure!: Configure;

    /**
     * 子类配置
     *
     * @protected
     * @type {CT}
     * @memberof BaseUtil
     */
    protected config!: CT;

    /**
     * 配置映射
     *
     * @protected
     * @type {IConfigMaps}
     * @memberof BaseUtil
     */
    protected abstract configMaps?: IConfigMaps;

    resolveModule(
        data: ModuleMetaResolve<Record<string, any>>,
    ): ModuleMetaResolve<Record<string, any>> {
        return data;
    }

    registerMeta(): UtilMetaRegister {
        return {};
    }

    registerCommands(): CommandContiner<any, any>[] {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async close(): Promise<void> {}

    /**
     * 初始化工具类
     * 将隐射后的配置放入子类的factory进行进一步操作
     * 比如赋值给this.config
     *
     * @memberof BaseUtil
     */
    factory(configure: Configure) {
        this.configure = configure;
        if (!this.created) {
            this.create(this.mapConfig());
            this.created = true;
        }
    }

    /**
     * 子类初始化方法
     *
     * @protected
     * @abstract
     * @param {*} config
     * @memberof BaseUtil
     */
    protected abstract create(config: any): void;

    /**
     * 根据configMaps获取映射后的配置
     * 如果configs是一个string则直接在获取其在配置池中的值
     * 如果configs是一个对象则获取后再一一映射
     *
     * @private
     * @returns
     * @memberof BaseUtil
     */
    private mapConfig() {
        if (this.configMaps?.maps) {
            const { maps, required } = this.configMaps;
            if (typeof maps === 'string') {
                return this.checkAndGetConfig(maps, maps, required);
            }
            const mapSet = {};
            for (const [name, slug] of Object.entries(maps!)) {
                set(mapSet, name, this.checkAndGetConfig(name, slug, required));
            }
            return mapSet;
        }
        return {};
    }

    /**
     * 检测并获取配置
     * 如果required为true则检测每个配置在配置池中是否存在
     * 如果required为数组则只把数组中的值作为key去检测它们在配置池中是否存在
     * 其它情况不检测
     *
     * @protected
     * @param {string} name
     * @param {string} key
     * @param {IConfigMaps['required']} [required]
     * @returns
     * @memberof BaseUtil
     */
    protected checkAndGetConfig(name: string, key: string, required?: IConfigMaps['required']) {
        const data = this.configure.get(key, undefined);
        if (required && typeof data !== 'boolean' && !data) {
            const msg = `config for ${key} is incorrect ！`;
            if (typeof required === 'boolean' && required) {
                throw new Error(msg);
            }
            if (required instanceof Array && required.includes(name)) {
                throw new Error(msg);
            }
        }
        return data;
    }
}

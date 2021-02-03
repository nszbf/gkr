import { INestApplication } from '@nestjs/common';
import { BaseUtil } from '../base/util';
import { BaseUtilMeta, ClassType, UtilMeta } from '../types';
import { Configure } from './configure';

/**
 * 扩展操作服务
 *
 * @export
 * @class UtilResolver
 */
export class UtilResolver {
    protected app!: INestApplication;

    /**
     * 所有扩展合并后的模块元素数据
     *
     * @protected
     * @type {UtilMeta}
     * @memberof UtilResolver
     */
    protected meta: UtilMeta = {
        imports: [],
        providers: [],
        exports: [],
    };

    /**
     * 扩展集合
     *
     * @protected
     * @type {UtilCollection}
     * @memberof UtilResolver
     */
    protected _utils: UtilCollection = [];

    constructor(protected readonly configure: Configure) {}

    /**
     * 设置当前APP实例
     *
     * @param {INestApplication} app
     * @returns
     * @memberof UtilResolver
     */
    setApp(app: INestApplication) {
        this.app = app;
        return this;
    }

    /**
     * 添加扩展
     *
     * @template T
     * @template C
     * @template CT
     * @param {...T} adds
     * @returns
     * @memberof UtilResolver
     */
    add<T extends Array<UtilType<C>>, C extends BaseUtil<CT>, CT>(...adds: T) {
        for (const option of adds) {
            // 获取扩展类
            const ClassName = 'useClass' in option ? option.useClass : option;
            // 如果扩展集合中已经存在则不重复添加
            if (this.has(ClassName)) continue;
            let util: C;
            // 实例化扩展
            if ('value' in option && option.value) {
                util = option.value();
            } else {
                util = new ClassName();
                util.factory(this.configure);
            }
            // 添加扩展以及扩展实例
            this._utils.push({ name: ClassName, value: util });
            // 添加扩展到核心模块的全局提供者
            const utilProvider = () => [{ provide: ClassName, useValue: util }];
            if (!('useClass' in option) || !option.noneProvider) {
                this.meta.providers.push(utilProvider);
                this.meta.exports.push(() => [ClassName]);
            }
            // 添加扩展中需要注册的元数据注册函数(如导入第三方模块等)到this.meta中用于在核心模块中注册
            const utilMeta = util.registerMeta();
            Object.keys(utilMeta).forEach((key) => {
                const name = key as keyof UtilMeta;
                if (utilMeta[name]) {
                    this.meta[name].push((utilMeta[name] as unknown) as any);
                }
            });
        }
        return this;
    }

    /**
     * 获取全部已注册的Util对象
     *
     * @readonly
     * @memberof UtilTool
     */
    get all() {
        return this._utils;
    }

    /**
     * 生成最终用于核心模块注册的全局元数据
     *
     * @returns {Required<BaseUtilMeta>}
     * @memberof UtilResolver
     */
    forModule(): Required<BaseUtilMeta> {
        const getList = (data: any[]) =>
            data.map((reg) => reg()).reduce((o, n) => [...o, ...n], []);
        return {
            imports: getList(this.meta.imports),
            providers: getList(this.meta.providers),
            exports: getList(this.meta.exports),
        };
    }

    /**
     * 判断一个Util是否被注册
     *
     * @template T
     * @template CT
     * @param {ClassType<T>} name
     * @returns
     * @memberof UtilTool
     */
    has<T extends BaseUtil<CT>, CT>(name: ClassType<T>) {
        return !!this.get(name);
    }

    /**
     * 获取一个Util的提供者对象用于注册提供者
     *
     * @template T
     * @template CT
     * @param {ClassType<T>} name
     * @returns
     * @memberof UtilTool
     */
    get<T extends BaseUtil<CT>, CT>(name: ClassType<T>): T {
        return this._utils.find((item) => item.name === name)?.value as T;
    }

    /**
     * 获取一个Util的实例
     *
     * @template T
     * @template CT
     * @param {ClassType<T>} name
     * @returns {T}
     * @memberof UtilTool
     */
    fromContainer<T extends BaseUtil<CT>, CT>(name: ClassType<T>): T {
        return this.app.get(name);
    }
}

export type UtilType<T extends BaseUtil<any> = BaseUtil<any>> =
    | {
          useClass: ClassType<T>;
          noneProvider?: boolean;
          value?: () => T;
      }
    | ClassType<T>;

export type UtilItem<T extends BaseUtil<CT>, CT> = {
    name: ClassType<T>;
    value: T;
};

export type UtilCollection<CT extends any = any> = Array<UtilItem<BaseUtil<CT>, CT>>;

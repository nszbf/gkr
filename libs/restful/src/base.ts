import { BaseUtil, IConfigMaps } from '@gkr/core';
import { Type } from '@nestjs/common';
import { omit, pick, trim } from 'lodash';
import { ApiConfig, RouteOption } from './types';

export class ApiBase extends BaseUtil<ApiConfig> {
    protected configMaps: IConfigMaps = {
        required: true,
        maps: 'api',
    };

    protected _default!: string;

    protected _versions: string[] = [];

    protected _modules: { [key: string]: Type<any> } = {};

    get default() {
        return this._default;
    }

    get versions() {
        return this._versions;
    }

    get modules() {
        return this._modules;
    }

    create(_config: ApiConfig) {}

    /**
     * 创建配置
     *
     * @protected
     * @param {ApiConfig} config
     * @memberof ApiUtil
     */
    protected createConfig(config: ApiConfig) {
        if (!config.default) {
            throw new Error('default api version name should been config!');
        }
        config.versions = config.versions
            .filter(({ name }) => {
                if (config.default === name) return true;
                return config.enabled.includes(name);
            })
            .map((version) => ({
                ...pick(config, ['title', 'description', 'auth']),
                ...version,
                tags: Array.from(new Set([...(config.tags ?? []), ...(version.tags ?? [])])),
            }));
        config.versions.forEach(({ name }) => this._versions.push(name));
        this._default = config.default;
        if (!this._versions.includes(this._default)) {
            throw new Error(`Default api version named ${this._default} not exists!`);
        }
        this.config = {
            ...config,
            versions: this.createVersions(config),
        };
    }

    /**
     * 创建版本配置
     *
     * @protected
     * @param {ApiConfig} config
     * @returns
     * @memberof ApiUtil
     */
    protected createVersions(config: ApiConfig) {
        const configRoutes = (data: RouteOption[]): RouteOption[] => {
            return data.map((option) => {
                const route: RouteOption = {
                    ...omit(option, 'children'),
                    path: this.trimPath(option.path),
                };
                if (option.children && option.children.length > 0) {
                    route.children = configRoutes(option.children);
                } else {
                    delete route.children;
                }
                return route;
            });
        };
        return config.versions.map((version) => ({
            ...version,
            routes: configRoutes(version.routes),
        }));
    }

    protected trimPath(routePath: string, addPrefix = true) {
        return `${addPrefix ? '/' : ''}${trim(routePath.replace('//', '/'), '/')}`;
    }

    protected getFlatModule(routes: RouteOption[], parent?: string) {
        const result = routes
            .map(({ name, children }) => {
                const routeName = parent ? `${parent}.${name}` : name;
                let modules: Type<any>[] = [this._modules[routeName]];
                if (children) modules = [...modules, ...this.getFlatModule(children, routeName)];
                return modules;
            })
            .reduce((o, n) => [...o, ...n], [])
            .filter((i) => !!i);
        return result;
    }
}

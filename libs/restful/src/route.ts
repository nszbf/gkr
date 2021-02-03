import { CreateModule } from '@gkr/core';
import { Type } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { camelCase, upperFirst } from 'lodash';
import { Route, Routes } from 'nest-router';
import { ApiBase } from './base';
import { RouteOption } from './types';

export class ApiRoute extends ApiBase {
    protected _routes: Routes = [];

    get routes() {
        return this._routes;
    }

    /**
     * 创建路由树
     *
     * @protected
     * @memberof ApiUtil
     */
    protected createRoutes() {
        const filterRoutes = (
            vdepends: Type<any>[],
            routes: RouteOption[],
            parentModule?: string,
        ): Routes =>
            routes.map(({ name, path, children, controllers, depends, tags }) => {
                const moduleName = parentModule ? `${parentModule}.${name}` : name;
                const rdpends = depends
                    ? [...vdepends, ...depends].reduce((o: Type<any>[], n) => {
                          if (o.find((i) => i === n)) return o;
                          return [...o, n];
                      }, [])
                    : [...vdepends];
                if (Object.keys(this._modules).includes(moduleName)) {
                    throw new Error('route name should be unique in same level!');
                }
                if (tags && tags.length > 0) {
                    controllers.forEach((controller) => ApiTags(...tags)(controller));
                }
                const module = CreateModule(`${upperFirst(camelCase(name))}RouteModule`, () => ({
                    controllers,
                    imports: rdpends,
                }));
                this._modules[moduleName] = module;
                const route: Route = { path, module };
                if (children) route.children = filterRoutes(vdepends, children, moduleName);
                return route;
            });
        this._routes = this.config.versions
            .map(({ name, depends, routes }) =>
                filterRoutes(depends, routes, name).map((route) => ({
                    ...route,
                    path: this.genRoutePath(route.path, name),
                })),
            )
            .reduce((o, n) => [...o, ...n], []);
        const defaultVersion = this.config.versions.find((v) => v.name === this._default)!;
        this._routes = [
            ...this._routes,
            ...filterRoutes(defaultVersion.depends, defaultVersion.routes).map((route) => ({
                ...route,
                path: this.genRoutePath(route.path),
            })),
        ];
    }

    protected genRoutePath(routePath: string, version?: string) {
        return this.trimPath(
            `${this.config.prefix?.route}${
                version ? `/${version.toLowerCase()}/` : '/'
            }${routePath}`,
        );
    }
}

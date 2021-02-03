import { Type } from '@nestjs/common';
import { trim } from 'lodash';
import { ApiRoute } from './route';
import { APIDocOption, RouteOption, SwaggerOption, VersionOption } from './types';

export class ApiDoc extends ApiRoute {
    protected _docs!: {
        [version: string]: APIDocOption;
    };

    protected excludeVersionModules: string[] = [];

    get docs() {
        return this._docs;
    }

    /**
     * 创建文档
     *
     * @protected
     * @returns
     * @memberof ApiUtil
     */
    protected createDocs() {
        const vDocs = this.config.versions.map((option) => [
            option.name,
            this.getDocOption(option),
        ]);
        this._docs = Object.fromEntries(vDocs);
        const defaultVersion = this.config.versions.find(({ name }) => name === this._default)!;
        this._docs.default = this.getDocOption(defaultVersion, true);
    }

    protected getDocOption(voption: VersionOption, isDefault = false) {
        const docConfig: APIDocOption = {};
        const defaultDoc = {
            title: voption.title!,
            description: voption.description!,
            tags: voption.tags ?? [],
            version: voption.name,
            path: trim(`${this.config.prefix?.doc}${isDefault ? '' : `/${voption.name}`}`, '/'),
        };
        const routesDoc = isDefault
            ? this.getRouteDocs(defaultDoc, voption.routes)
            : this.getRouteDocs(defaultDoc, voption.routes, voption.name);
        if (Object.keys(routesDoc).length > 0) {
            docConfig.routes = routesDoc;
        }
        const flatModules = isDefault
            ? this.getFlatModule(voption.routes)
            : this.getFlatModule(voption.routes, voption.name);
        const include = this.filterExcludeModules(flatModules);
        if (include.length > 0 || !docConfig.routes) {
            docConfig.default = { ...defaultDoc, include: include ?? [] };
        }
        return docConfig;
    }

    protected filterExcludeModules(flatModules: Type<any>[]) {
        const excludeModules: Type<any>[] = [];
        const excludeNames = Array.from(new Set(this.excludeVersionModules));
        for (const [name, module] of Object.entries(this._modules)) {
            if (excludeNames.includes(name)) {
                excludeModules.push(module);
            }
        }
        return flatModules.filter(
            (fmodule) => !excludeModules.find((emodule) => emodule === fmodule),
        );
    }

    protected getRouteDocs(
        option: Omit<SwaggerOption, 'include'>,
        routes: RouteOption[],
        parent?: string,
    ): { [key: string]: SwaggerOption } {
        const mergeDoc = (vDoc: Omit<SwaggerOption, 'include'>, route: RouteOption) => ({
            ...vDoc,
            ...route.doc,
            tags: Array.from(new Set([...(vDoc.tags ?? []), ...(route.tags ?? [])])),
            path: this.genDocPath(route.path, parent),
            include: this.getFlatModule([route], parent),
        });
        let routeDocs: { [key: string]: SwaggerOption } = {};
        for (const route of routes) {
            const { name, doc, children } = route;
            const moduleName = parent ? `${parent}.${name}` : name;
            if (doc || parent) this.excludeVersionModules.push(moduleName);
            if (doc)
                routeDocs[moduleName.replace(`${option.version}.`, '')] = mergeDoc(option, route);
            if (children) {
                routeDocs = {
                    ...routeDocs,
                    ...this.getRouteDocs(option, children, moduleName),
                };
            }
        }
        return routeDocs;
    }

    protected genDocPath(routePath: string, version?: string) {
        return this.trimPath(
            `${this.config.prefix?.doc}${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`,
            false,
        );
    }
}

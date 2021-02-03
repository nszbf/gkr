import { Global, Module, ModuleMetadata, Type } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { pick } from 'lodash';
import { GMODULE_REGISTER } from '../constants';
import { AppFilter, AppIntercepter, AppPipe } from '../global';
import { CreateModule } from '../helpers';
import { BaseUtilMeta, GModuleMeta, ModuleMetaResolve } from '../types';
import { Configure } from './configure';
import { UtilResolver } from './util.resolver';

/**
 * 启动模块与核心模块生成服务
 *
 * @export
 * @class ModuleResolver
 */
export class ModuleResolver {
    constructor(protected configure: Configure, protected utilResolver: UtilResolver) {}

    async checkMounted(modules: Type<any>[]) {
        const results = await Promise.allSettled(
            modules.map(async (mod) => {
                const options = this.getModuleOptions(mod);
                return options.mount?.check ? options.mount?.check(this.configure) : true;
            }),
        );
        return !results.find((e) => (e as any).value === false);
    }

    /**
     * 构建引导模块
     *
     * @static
     * @param {Routes} routes
     * @param {Type<any>} [target]
     * @returns
     * @memberof Gkr
     */
    async getBootModule(modules: Type<any>[], target?: Type<any>) {
        const name = target ?? 'Bootstrap';
        const imports: NonNullable<ModuleMetadata['imports']> = await Promise.all(
            modules.map(async (mod) => {
                const options = this.getModuleOptions(mod);
                if (options.utils) {
                    options.utils.forEach((util) => {
                        if (!this.utilResolver.has(util)) {
                            this.utilResolver.add(util);
                        }
                    });
                }

                let utilResolve: ModuleMetaResolve<Record<string, any>> = {
                    meta: options,
                    module: mod,
                };

                // 遍历所有已引用的扩展,每个扩展都根据模块元数据对模块进行处理
                // 每次处理后都会返回ModuleMetaResolve类型的数据
                utilResolve = this.utilResolver.all.reduce(
                    (o, n) => n.value.resolveModule(o),
                    utilResolve,
                );

                // 使用Module装饰器把处理后的元数据绑定模块
                Module(pick(utilResolve.meta, ['imports', 'providers', 'exports', 'controllers']))(
                    utilResolve.module,
                );
                // 返回最终处理后的模块
                return mod;
            }),
        );
        // 添加核心模块
        imports.push(this.createCoreModule(this.utilResolver.forModule()));

        return CreateModule(name, () => ({
            imports,
        }));
    }

    /**
     * 生成核心模块
     *
     * @protected
     * @param {Required<BaseUtilMeta>} utilForModule
     * @param {Routes} routes
     * @returns
     * @memberof ModuleResolver
     */
    protected createCoreModule(utilForModule: Required<BaseUtilMeta>) {
        // 添加所有扩展中导入的模块到核心模块的imports
        const imports = [...utilForModule.imports];
        // 注册所有扩展中的提供者
        const providers: ModuleMetadata['providers'] = [
            ...utilForModule.providers,
            {
                provide: Configure,
                useValue: this.configure,
            },
            {
                provide: APP_PIPE,
                useFactory: () =>
                    new AppPipe({
                        transform: true,
                        forbidUnknownValues: true,
                        validationError: { target: false },
                    }),
            },
            {
                provide: APP_FILTER,
                useClass: AppFilter,
            },
            {
                provide: APP_INTERCEPTOR,
                useClass: AppIntercepter,
            },
        ];
        // 导出所有扩展中的exports
        const exports = [...utilForModule.exports, Configure];
        const CoreModule = CreateModule('CoreModule', () => ({
            imports,
            providers,
            exports,
        }));
        // 设置核心模块为全局模块
        Global()(CoreModule);
        return CoreModule;
    }

    getModuleOptions(mod: Type<any>): GModuleMeta<Record<string, any>> {
        // 获取模块的元数据构造器
        const metaRegister = Reflect.getMetadata(GMODULE_REGISTER, mod);
        // 执行构造器获取元数据
        return metaRegister ? metaRegister() : {};
    }
}

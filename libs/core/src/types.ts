import { INestApplication, ModuleMetadata, Type } from '@nestjs/common';
import yargs, { CommandModule } from 'yargs';
import { BaseUtil } from './base';
import { Configure } from './resolvers/configure';

export type ClassType<T> = { new (...args: any[]): T };
export type AnyInstance = new (...args: any[]) => any;
export type AnyClass = ClassType<AnyInstance>;
export type RePartial<T> = {
    [P in keyof T]?: RePartial<T[P]>;
};
/**
 * 过滤类型,去除U中T不包含的类型
 */
export type Filter<T, U> = T extends U ? T : never;

/**
 * 反向过滤类型,去除U中T包含的类型
 */
export type Diff<T, U> = T extends U ? never : T;

/**
 * 获取一个对象的值类型
 */
export type ValueOf<T> = T[keyof T];

/**
 * 获取不同类组成的数组的类型
 */
export type ClassesType<T extends Array<any>> = {
    new (...args: any[]): T[number];
}[];

export interface BaseConfig {
    app: AppConfig;
    [key: string]: any;
}

// 配置注册函数
export type ConfigRegister<T> = () => T;
// 多个配置集合对象
export type ConfigRegCollection<T> = {
    [P in keyof T]?: () => T[P];
};

export type BaseUtilMeta = Omit<ModuleMetadata, 'controllers'>;
export type UtilMeta = {
    [key in keyof Required<BaseUtilMeta>]: (() => Required<BaseUtilMeta>[key])[];
};
export type UtilMetaRegister = {
    [key in keyof BaseUtilMeta]: () => BaseUtilMeta[key];
};
export type ModuleMetaResolve<T extends Record<string, any>> = {
    meta: ModuleMetadata & T;
    module: Type<any>;
};

export type ModuleImporter = () => {
    module: Type<any>;
    meta: ModuleMetadata;
};

export type GModuleMeta<T extends Record<string, any>> = ModuleMetadata & {
    mount?: GModuleMount;
    utils?: ClassesType<BaseUtil<any>[]>;
} & T;

export type GModuleMount = {
    resolve?: () => Promise<void>;
    check?: (configure: Configure) => Promise<boolean>;
};

export type CommandHandlerArgs<T = any> = T & { app: INestApplication; close: () => Promise<void> };
export type CommandArgs<T = any> = yargs.Arguments<CommandHandlerArgs<T>>;
export type CommandContiner<T = any, U = any> = CommandModule<T, U> & {
    source?: boolean;
};
/** ****************************************** APP配置 **************************************** */
export interface AppConfig {
    debug: boolean;
    timezone: string;
    locale: string;
    port: number;
    https: boolean;
    host: string;
    hash: number;
    url?: string;
    utils: ClassesType<BaseUtil<any>[]>;
    modules: Type<any>[];
    paths?: {
        modules?: string;
    };
}

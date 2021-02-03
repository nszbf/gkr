import { Module, ModuleMetadata, Type } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';
import chalk from 'chalk';
import fs from 'fs';
/* eslint-disable global-require */
import glob from 'glob';
import ora from 'ora';
import shell from 'shelljs';
import { BaseUtil } from './base';
import { Gkr } from './factory';
import { UtilType } from './resolvers/util.resolver';
import { BaseConfig, ClassType } from './types';

/** ***************************       Config       *********************************** */
export function config<T extends BaseConfig = BaseConfig>(): T;
export function config<T = any>(key: string, defaultValue?: T): T;
export function config<T = any>(key?: string, defaultValue?: T) {
    if (typeof key === 'string') {
        return Gkr.configure.get<T>(key, defaultValue);
    }
    return Gkr.configure.all();
}

/** ***************************       Util        *********************************** */
export const addUtil = <T extends Array<UtilType<C>>, C extends BaseUtil<any>>(...enabled: T) =>
    Gkr.util.add(...enabled);
export const getUtil = <T extends BaseUtil<CT>, CT>(name: ClassType<T>) => Gkr.util.get(name);
export const hasUtil = <T extends BaseUtil<CT>, CT>(name: ClassType<T>) => Gkr.util.has(name);

/** ***************************       Typescript        *********************************** */
/**
 * 判断一个变量是否为promise对象
 *
 * @export
 * @param {*} o
 * @returns {boolean}
 */
export function isPromiseLike(o: any): boolean {
    return (
        !!o &&
        (typeof o === 'object' || typeof o === 'function') &&
        typeof o.then === 'function' &&
        !(o instanceof Date)
    );
}

export const Trait = (mixins: any[], override = false) => <T extends new (...args: any[]) => any>(
    target: T,
) => {
    mixins.forEach((mixin) => {
        Object.getOwnPropertyNames(mixin.prototype).forEach((name) => {
            if (override || (!Object.getOwnPropertyDescriptor(target, name) && !override)) {
                Object.defineProperty(
                    target.prototype,
                    name,
                    Object.getOwnPropertyDescriptor(mixin.prototype, name)!,
                );
            }
        });
    });
    return target;
};

/** ***************************       File       *********************************** */
export const isFile = (filePath: string): boolean =>
    fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();

export const isDir = (dirPath: string): boolean =>
    fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();

/**
 * glob路径配置获取合并后的所有文件
 *
 * @export
 * @param {string[]} filePattern
 * @param {glob.IOptions} [options={}]
 * @param {boolean} [cwd]
 * @returns {string[]}
 */
export function matchGlobs(filePattern: string[], options: glob.IOptions = {}): string[] {
    return filePattern
        .map((pattern) => glob.sync(pattern, options))
        .reduce((acc, filePath) => [...acc, ...filePath]);
}

/** ***************************       Console       *********************************** */
/**
 * 命令行打应错误
 *
 * @export
 * @param {string} message
 * @param {*} [error]
 */
export function printError(message: string): void;
export function printError(message: string, error: any): void;
export function printError(message: string, exit: boolean): void;
export function printError(message: string, error: any, exit: boolean): void;
export function printError(message: string, error?: any, exit?: boolean) {
    let option: { error?: any; exit: boolean } = { error: undefined, exit: true };
    if (exit !== undefined) {
        option = { error, exit };
    } else if (error !== undefined) {
        option = typeof error === 'boolean' ? { ...option, exit: error } : { ...option, error };
    }
    // tslint:disable-next-line
    console.log();
    if (option.error) console.log(chalk.red(option.error));
    console.log(chalk.red(`\n❌ ${message}`));
    if (option.exit) process.exit(1);
}

/**
 * 命令行抛出异常并终止运行
 *
 * @export
 * @param {ora.Ora} spinner
 * @param {string} message
 * @param {*} [error]
 */
export function panic(spinner: ora.Ora, message: string, error?: any) {
    console.log();
    if (error) console.log(chalk.red(error));
    spinner.fail(chalk.red(`\n❌${message}`));
    process.exit(1);
}

/** ***************************       Shell      *********************************** */
/**
 * 执行shell命令
 *
 * @export
 * @param {string} command
 * @param {boolean} [pretty=false]
 * @returns
 */
export function execShell(command: string, pretty = false) {
    return new Promise<void>((resolve, reject) => {
        shell.exec(command, { silent: true }, (code, stdout, stderr) => {
            console.log('\n');
            if (pretty) {
                console.log(code !== 0 && stderr ? chalk.red(stdout) : chalk.green(stdout));
            }
            if (code !== 0 && stderr) {
                return reject(new Error(stderr));
            }
            return resolve();
        });
    });
}

/** ***************************       Framework      *********************************** */
export function PartialDto<T>(classRef: Type<T>): Type<Partial<T>> {
    const PartialTypeClass = PartialType(classRef);
    if (classRef.prototype.transform && typeof classRef.prototype.transform === 'function') {
        PartialTypeClass.prototype.transform = classRef.prototype.transform;
    }
    return PartialTypeClass;
}

export function CreateModule(
    target: string | Type<any>,
    metaSetter: () => ModuleMetadata = () => ({}),
) {
    let ModuleClass: Type<any>;
    if (typeof target === 'string') {
        ModuleClass = class {};
        Object.defineProperty(ModuleClass, 'name', { value: target });
    } else {
        ModuleClass = target;
    }
    Module(metaSetter())(ModuleClass);
    return ModuleClass;
}

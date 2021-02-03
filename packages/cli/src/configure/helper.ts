/* eslint-disable global-require */
import chalk from 'chalk';
import merge from 'deepmerge';
import fs from 'fs';
import path from 'path';
import { CLICommonConfig, CustomConfig, PackageItem } from '../types';

export function getCustomConfig() {
    const rootPath = process.cwd();
    let config: CustomConfig = {
        prefix: '@app',
        stubs: {
            apps: 'apps',
            libs: 'libs',
        },
        apps: {},
        libs: {},
    };
    const jsonConfigFile = path.join(rootPath, 'gkr-cli.json');
    if (fs.existsSync(jsonConfigFile) && fs.lstatSync(jsonConfigFile).isFile()) {
        const jsonConfig = JSON.parse(fs.readFileSync(jsonConfigFile, 'utf8'));
        config = merge(config, jsonConfig as any, {
            arrayMerge: (_d, s, _o) => s,
        });
    }
    config.apps = addPackageName(config, 'apps') as CustomConfig['apps'];
    config.libs = addPackageName(config, 'libs') as CustomConfig['libs'];
    return config;
}
export function checkPackage(name: string, pack?: PackageItem) {
    if (!pack) {
        console.log();
        console.log(chalk.red(`\n❌ app or lib ${name} not exits!`));
        process.exit(1);
    }
    return pack;
}

export function getPackage(name: string): PackageItem;
export function getPackage<T extends boolean>(
    name: string,
    check: boolean,
): T extends true ? PackageItem : PackageItem | undefined;
export function getPackage(name: string, check?: boolean) {
    const toCheck = check ?? true;
    const rootPath = process.cwd();
    const config = getCustomConfig();
    const packages = getPackages(rootPath, config);
    let pack = packages.find((item) => item.name === name);
    if (!pack) pack = packages.find((item) => item.name === `${config.prefix}/${name}`);
    return toCheck ? checkPackage(name, pack) : pack;
}

export function getPackageName(name: string): string;
export function getPackageName<T extends boolean>(
    name: string,
    check: T,
): T extends true ? string : string | undefined;

export function getPackageName(name: string, check?: boolean) {
    const pack = check === undefined ? getPackage(name) : getPackage(name, check);
    return pack?.name;
}

function addPackageName(config: CustomConfig, key: 'apps' | 'libs') {
    return Object.fromEntries(
        Object.entries(config[key]).map(([name, conf]) => [
            name,
            {
                ...conf,
                name: conf.name ?? `${config.prefix}/${name}`,
            },
        ]),
    );
}

export function getPackages(rootPath: string, config: CustomConfig): Array<PackageItem> {
    const getter = (key: 'apps' | 'libs') =>
        Object.entries(config[key]).map(
            ([name, conf]): PackageItem => ({
                name: conf.name ?? `${config.prefix}/${name}`,
                type: key === 'apps' ? 'app' : 'lib',
                path: path.join(rootPath, conf.path),
            }),
        );
    return [...getter('apps'), ...getter('libs')];
}

export function getDeps(config: CLICommonConfig & { packPath: string }) {
    const packFile = path.join(config.packPath, 'package.json');
    if (!fs.existsSync(packFile) || !fs.lstatSync(packFile).isFile()) {
        console.log();
        console.log(chalk.red(`\n❌ packFile not exits!`));
        process.exit(1);
    }
    const packConfig = JSON.parse(fs.readFileSync(packFile, 'utf8'));
    return [
        ...(Object.keys(packConfig.dependencies) ?? []),
        ...(Object.keys(packConfig.devDependencies) ?? []),
    ].filter((name) => config.packages.map((pack) => pack.name).includes(name));
}

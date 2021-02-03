import chalk from 'chalk';
import findUp from 'find-up';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import { IConfig } from '../types';

const getLernaPakcages = (config: IConfig, lernaFile: string) => {
    const lernaConfig = JSON.parse(fs.readFileSync(lernaFile, 'utf8'));
    const appPack = JSON.parse(
        fs.readFileSync(path.resolve(config.appPath, 'package.json'), 'utf8'),
    );
    const deps: string[] = [
        ...(Object.keys(appPack.dependencies) ?? []),
        ...(Object.keys(appPack.devDependencies) ?? []),
    ];
    const workspaces: string[] = lernaConfig.packages ?? [];
    const packPaths = workspaces
        .map((pattern) => glob.sync(pattern, { absolute: true, cwd: config.rootPath }))
        .reduce((acc, filePath) => [...acc, ...filePath]);
    const packages: Record<string, string> = packPaths
        .map((ppath) => {
            const packageFile = path.join(ppath, 'package.json');
            if (fs.existsSync(packageFile) && fs.lstatSync(packageFile).isFile()) {
                const packConfig = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
                if (packConfig.name && !packConfig.private) {
                    return [packConfig.name, ppath] as string[];
                }
            }
            return undefined;
        })
        .filter((item) => item !== undefined)
        .reduce((o, n) => ({ ...o, [n![0]]: n![1] }), {});
    return Object.fromEntries(Object.entries(packages).filter(([name, _]) => deps.includes(name)));
};
export const configRootPath = (config: IConfig) => {
    if (!config.mono.enabled) return config;
    const lernaFile = findUp.sync(['lerna.json']) as string;
    if (!lernaFile) {
        console.log();
        console.log(
            '\n❌ ',
            chalk.red(
                `${config.appname} run failed: Lerna config file named lerna.json not found!`,
            ),
        );
        process.exit(1);
    }

    config.rootPath = path.dirname(lernaFile);
    return config;
};
export const configMono = (config: IConfig) => {
    if (!config.mono.enabled) return config;
    const lernaFile = path.join(config.rootPath, 'lerna.json');
    let packages: Record<string, string> = {};
    if (typeof config.mono.externals !== 'boolean') {
        packages =
            Object.keys(config.mono.externals).length <= 0
                ? getLernaPakcages(config, lernaFile)
                : config.mono.externals;
    } else {
        packages = config.mono.externals ? getLernaPakcages(config, lernaFile) : {};
    }
    packages = { ...packages, ...config.mono.additionalExternals };
    config.mono.externals = Object.fromEntries(
        Object.entries(packages).filter(([name, _]) => !config.mono.ignoreExternals.includes(name)),
    );

    return config;
};

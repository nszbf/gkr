/* eslint-disable global-require */
import path from 'path';
import {
    CLIAppConfig,
    CLICommonConfig,
    CLILibConfig,
    CustomAppConfig,
    CustomLibConfig,
} from '../types';
import { getAppConfig } from './app';
import { getCustomConfig, getDeps, getPackage, getPackages } from './helper';
import { getLibConfig } from './lib';

export function getConfig(packName: string): CLIAppConfig | CLILibConfig {
    const rootPath = process.cwd();
    const customConfig = getCustomConfig();
    const pack = getPackage(packName);
    const packConfig = Object.values(customConfig[pack.type === 'app' ? 'apps' : 'libs']).find(
        (item) => item.name === packName,
    )!;
    const packDir = packConfig.path;
    const sourceDir = path.join(packDir, packConfig.source);
    const outputDir = path.join(packDir, packConfig.output);
    const commonConfig: CLICommonConfig = {
        name: packName,
        prefix: customConfig.prefix,
        environment: process.env.NODE_ENV as CLIAppConfig['environment'],
        packages: getPackages(rootPath, customConfig),
        deps: [],
        paths: {
            root: rootPath,
            source: path.join(rootPath, sourceDir),
            output: path.join(rootPath, outputDir),
            stubs: {
                apps: path.join(rootPath, customConfig.stubs.apps),
                libs: path.join(rootPath, customConfig.stubs.libs),
            },
        },
        dirs: {
            source: packConfig.source,
            output: packConfig.output,
            stubs: customConfig.stubs,
        },
        tsconfig: packConfig.tsconfig,
    };
    commonConfig.deps = getDeps({ ...commonConfig, packPath: path.join(rootPath, packDir) });
    if (pack.type === 'app') {
        return getAppConfig(commonConfig, packConfig as CustomAppConfig);
    }
    return getLibConfig(commonConfig, packConfig as CustomLibConfig);
}

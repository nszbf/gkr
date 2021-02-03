import merge from 'deepmerge';
import webpack from 'webpack';
import Chain from 'webpack-chain';
import configure from '../config';
import { IConfig } from '../types';
import { configMono, configRootPath } from './mono';

export const getConfig = async (): Promise<IConfig> => {
    const rootPath = process.cwd();
    const appPath = rootPath;
    const isDev = process.env.NODE_ENV === 'development';
    const isProd = process.env.NODE_ENV === 'production';

    let mode: webpack.Configuration['mode'] = 'none';
    if (isDev) mode = 'development';
    if (isProd) mode = 'production';
    let config: IConfig = {
        appname: 'gkr server',
        rootPath,
        appPath,
        srcPath: 'src',
        buildPath: 'dist',
        entryFile: 'main.ts',
        distFile: 'server.js',
        devtool: isDev ? 'eval-source-map' : false,
        mode,
        tsconfig: {
            start: 'tsconfig.start.json',
            build: 'tsconfig.build.json',
        },
        alias: {},
        assets: [],
        watchAssets: false,
        watchIngore: [
            '**.js',
            '**/*.js',
            '**.d.ts',
            '**/*.d.ts',
            'node_modules/**',
            '**/node_modules/**',
            'dist/**',
            '**/dist/**',
            '**/scripts',
            'back',
        ],
        webpackConfig: (_config: IConfig) => ({}),
        webpackChain: (chain: Chain, _config: IConfig) => chain,
        mono: {
            enabled: false,
            references: false,
            externals: true,
            additionalExternals: {},
            ignoreExternals: [],
        },
    };
    config = merge(config, configure(config), {
        arrayMerge: (_d, s, _o) => s,
    }) as IConfig;
    if (!config.mono.enabled) return config;
    config = merge(config, configure(configRootPath(config)), {
        arrayMerge: (_d, s, _o) => s,
    }) as IConfig;
    return configMono(config);
};

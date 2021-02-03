/* eslint-disable global-require */
import chalk from 'chalk';
import merge from 'deepmerge';
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import Chain from 'webpack-chain';
import { CLIAppConfig, CLICommonConfig, CustomAppConfig, WebpackConfigOptions } from '../types';
import { tsNode } from '../utils/tsnode';

export function getAppConfig(commonConfig: CLICommonConfig, appConfig: CustomAppConfig) {
    const isDev = process.env.NODE_ENV === 'development';
    const mode: webpack.Configuration['mode'] = 'none';
    const config: CLIAppConfig = {
        ...commonConfig,
        dirs: {
            ...commonConfig.dirs,
            app: appConfig.path,
        },
        paths: {
            ...commonConfig.paths,
            app: path.join(commonConfig.paths.root, appConfig.path),
            entry: path.join(
                commonConfig.paths.root,
                appConfig.path,
                appConfig.source,
                appConfig.entry,
            ),
            dist: path.join(
                commonConfig.paths.root,
                appConfig.path,
                appConfig.output,
                appConfig.dist,
            ),
        },
        files: {
            entry: appConfig.entry,
            dist: appConfig.dist,
        },
        compile: {
            tsRefrences: false,
            devtool: isDev ? 'eval-source-map' : false,
            mode,
            alias: {},
            assets: [],
            chain: (chain: Chain, _config: CLIAppConfig, options: WebpackConfigOptions) => chain,
            webpackConfig: (_config: CLIAppConfig, options: WebpackConfigOptions) => ({}),
            watchIgnore: [
                '**.js',
                '**/*.js',
                '**/*d.ts',
                '**/*spec.ts',
                '**/*test.ts',
                'node_modules/**',
                '**/node_modules/**',
                'dist/**',
                '**/dist/**',
                '**/scripts',
                'back',
            ],
        },
    };
    const tscompiler = path.join(config.paths.app, 'compiler.ts');
    const jscompiler = path.join(config.paths.app, 'compiler.js');
    if (fs.existsSync(jscompiler) && fs.lstatSync(jscompiler).isFile()) {
        try {
            const configure = require(require.resolve(jscompiler));
            config.compile = merge(config.compile, configure(config) as CLIAppConfig['compile'], {
                arrayMerge: (_d, s, _o) => s,
            });
        } catch (err) {
            console.log();
            console.log(chalk.red(`\n❌ ${err}`));
            process.exit(1);
        }
    }
    if (fs.existsSync(tscompiler) && fs.lstatSync(tscompiler).isFile()) {
        try {
            tsNode({ configFile: path.join(config.paths.app, config.tsconfig), paths: true });
            const configure = require(require.resolve(tscompiler));
            config.compile = merge(config, configure(config) as CLIAppConfig['compile'], {
                arrayMerge: (_d, s, _o) => s,
            });
        } catch (err) {
            console.log();
            console.log(chalk.red(`\n❌ ${err}`));
            process.exit(1);
        }
    }
    return config;
}

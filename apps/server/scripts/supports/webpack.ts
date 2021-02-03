import chalk from 'chalk';
// import NodeHmrPlugin from 'node-hmr-plugin';
// import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ora from 'ora';
import path from 'path';
// import RunNodeWebpackPlugin from 'run-node-webpack-plugin';
import StartServerPlugin from 'start-server-nestjs-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
import Chain from 'webpack-chain';
import formatMessages from 'webpack-format-messages';
import WebpackMerge from 'webpack-merge';
import nodeExternals from 'webpack-node-externals';
import { IConfig } from '../types';

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

export const getWebpackConfig = (config: IConfig, build = false): webpack.Configuration => {
    const isDev = process.env.NODE_ENV === 'development';
    const isRefrences = build && config.mono.references;
    const chain = new Chain();
    const entryFile = `./${path.join(config.srcPath, config.entryFile)}`;
    const outputPath = path.join(config.appPath, config.buildPath);
    const tsconfig = path.join(
        config.appPath,
        build ? config.tsconfig.build : config.tsconfig.start,
    );

    chain
        .stats('minimal')
        .context(config.appPath)
        .mode(config.mode)
        .target('node')
        .devtool(config.devtool)
        .entry('main')
        .add('webpack/hot/poll?100')
        .add(entryFile)
        .end()
        .output.pathinfo(isDev)
        .path(outputPath)
        .filename(config.distFile)
        .libraryTarget('umd');

    chain.module
        .rule('scripts')
        .test(/\.(ts|tsx)$/)
        .exclude.add(/node_modules/)
        .end()
        .use('ts')
        .loader('ts-loader')
        .options({
            configFile: tsconfig,
            projectReferences: isRefrences,
            transpileOnly: true,
        });

    chain.plugin('clean').use(new CleanWebpackPlugin());
    // .end()
    // .plugin('webpack-bar')
    // .use(
    //     new WebpackBar({
    //         name: `🚚 Start [Server]...`,
    //         color: '#3979ed',
    //     }),
    // );

    chain.when(!build, (pipe) => {
        pipe.plugin('run-node').use(
            new StartServerPlugin({
                name: 'server.js',
                args: ['start'], // pass args to script
                // signal: true, // signal to send for HMR (defaults to `false`, uses 'SIGUSR2' if `true`)
                // keyboard: true | false, // Allow typing 'rs' to restart the server. default: only if NODE_ENV is 'development'
            }) as any,
            // new RunNodeWebpackPlugin({
            //     nodeArgs: ['start'],
            // }) as any,
        );
        pipe.plugin('hot').use(new webpack.HotModuleReplacementPlugin() as any);
    });

    // .plugin('fork-ts')
    // .use(
    //     new ForkTsCheckerWebpackPlugin({
    //         typescript: {
    //             configFile: tsconfig,
    //             memoryLimit: isDev ? 1024 : 1024 * 2,
    //         },
    //     }),
    // );
    // .end()
    chain.when(!config.mono.enabled || isRefrences, (pipe) => {
        pipe.externals(
            nodeExternals({
                allowlist: ['webpack/hot/poll?100'],
                modulesFromFile: true,
            }),
        );
    });
    chain.when(config.mono.enabled && !isRefrences, (pipe) => {
        const nodeModulePaths = [
            path.join(config.rootPath, 'node_modules'),
            ...Object.values(config.mono.externals).map((value) =>
                path.join(value, 'node_modules'),
            ),
        ];
        pipe.module
            .rule('scripts')
            .test(/\.(ts|tsx)$/)
            .exclude.add(nodeModulePaths);
        pipe.externals(
            nodeExternals({
                allowlist: ['webpack/hot/poll?100', Object.keys(config.mono.externals)],
                additionalModuleDirs: nodeModulePaths,
                modulesFromFile: {
                    filename: path.join(config.appPath, 'package.json'),
                },
            }),
        );
    });
    chain.resolve.extensions
        .add('.tsx')
        .add('.ts')
        .add('.jsx')
        .add('.js')
        .end()
        .plugin('ts-config-paths')
        .use(
            new TsconfigPathsPlugin({
                configFile: tsconfig,
            }),
        );
    for (const [name, value] of Object.entries(config.alias)) {
        chain.resolve.alias.set(name, value);
    }

    let wconfig = config.webpackChain(chain, config).toConfig() as webpack.Configuration;
    wconfig = WebpackMerge(wconfig, config.webpackConfig(config));
    wconfig.externalsPresets = { node: true };
    return wconfig;
};
export const compileMsg = (spinner: ora.Ora, stats?: webpack.Stats) => {
    const { errors, warnings } = formatMessages(stats);
    console.log();
    if (!errors.length && !warnings.length) {
        spinner.succeed(chalk.green('build successfully!'));
    }
    errors.forEach((err) => {
        console.log();
        spinner.fail(chalk.red(err));
    });
    warnings.forEach((warn) => {
        console.log();
        spinner.warn(chalk.yellow(warn));
    });
};

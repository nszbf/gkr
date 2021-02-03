// import StartServerPlugin from 'start-server-nestjs-webpack-plugin';
import NodeHotLoaderWebpackPlugin from 'node-hot-loader/NodeHotLoaderWebpackPlugin';
import path from 'path';
import RunNodeWebpackPlugin from 'run-node-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
import Chain from 'webpack-chain';
import WebpackMerge from 'webpack-merge';
import nodeExternals from 'webpack-node-externals';
import { CLIAppConfig, WebpackConfigOptions } from '../types';

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

export const getWebpackConfig = (
    config: CLIAppConfig,
    options: WebpackConfigOptions,
): webpack.Configuration => {
    const isDev = config.environment === 'development';
    const isWatch = options.watch ?? false;
    const isBuild = options.build ?? false;
    const isHmr = options.hmr ?? false;
    const chain = new Chain();
    const outputPath = config.paths.output;
    const entryFile = `./${path.join(config.dirs.source, config.files.entry)}`;
    const tsconfig = path.join(config.paths.app, config.tsconfig);
    const hotEntry = 'webpack/hot/poll?100';
    const allowlist: string[] =
        !isBuild && isWatch && isHmr ? [hotEntry, ...config.deps] : config.deps;

    chain
        .stats('errors-only')
        .context(config.paths.app)
        .mode(config.compile.mode)
        .target('node')
        .devtool(config.compile.devtool)
        .entry('main')
        .add(entryFile)
        .end()
        .output.pathinfo(isDev)
        .path(outputPath)
        .filename(config.files.dist)
        .libraryTarget('umd')
        .end()
        .module.rule('scripts')
        .test(/\.(ts|tsx)$/)
        .exclude.add(/node_modules/)
        .end()
        .use('ts')
        .loader('ts-loader')
        .options({
            configFile: tsconfig,
            projectReferences: isBuild && config.compile.tsRefrences,
            transpileOnly: true,
        })
        .end()
        .resolve.extensions.add('.tsx')
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
    for (const [name, value] of Object.entries(config.compile.alias)) {
        chain.resolve.alias.set(name, value);
    }
    chain.plugin('clean').use(new CleanWebpackPlugin());

    chain.when(!isBuild, (pipe) => {
        const nodeModulePaths = [
            path.join(config.paths.root, 'node_modules'),
            ...config.deps.map((name) => {
                const pack = config.packages.find((item) => item.name === name)!;
                return path.join(pack.path, 'node_modules');
            }),
        ];
        chain.module
            .rule('scripts')
            .test(/\.(ts|tsx)$/)
            .exclude.add(nodeModulePaths);
        chain.externals(
            nodeExternals({
                allowlist,
                additionalModuleDirs: nodeModulePaths,
                modulesFromFile: {
                    filename: path.join(config.paths.app, 'package.json'),
                },
            }),
        );

        if (isWatch && isHmr) {
            pipe.entryPoints
                .get('main')
                .add(hotEntry)
                .end()
                .plugin('hmr')
                .use(
                    new NodeHotLoaderWebpackPlugin({
                        force: true, // boolean. true - always launch entries, false (by default) - launch entries only in watch mode.
                        fork: true, // boolean | string[]. For example ['--key', 'key value'].
                        args: ['start'], // string[]. For example ['--arg1', 'arg2'].
                        autoRestart: true, // boolean
                        logLevel: 'errors-only',
                    }),
                    // new StartServerPlugin({
                    //     name: 'server.js',
                    //     args: ['start'], // pass args to script
                    //     // signal: true, // signal to send for HMR (defaults to `false`, uses 'SIGUSR2' if `true`)
                    //     // keyboard: true | false, // Allow typing 'rs' to restart the server. default: only if NODE_ENV is 'development'
                    // }),
                );
        } else {
            pipe.plugin('run-node').use(
                new RunNodeWebpackPlugin({
                    nodeArgs: ['start'],
                }),
            );
        }
    });

    chain.when(isBuild, (pipe) => {
        pipe.externals(
            nodeExternals({
                modulesFromFile: true,
            }),
        );
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

    let wconfig = config.compile.chain(chain, config, options).toConfig() as webpack.Configuration;
    wconfig = WebpackMerge(wconfig, config.compile.webpackConfig(config, options));
    wconfig.externalsPresets = { node: true };
    return wconfig;
};

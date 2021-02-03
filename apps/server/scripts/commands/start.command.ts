/* eslint-disable global-require */
import ora from 'ora';
import path from 'path';
import webpack from 'webpack';
import { AssetsManager, compileMsg, getWebpackConfig } from '../supports';
import { RunArgs } from '../types';

export const command = ['start', '$0'];
export const describe = 'Start app dev server';
export const builder = {
    watch: {
        type: 'boolean',
        alias: 'w',
        default: false,
    },
};

export const handler = async (args: RunArgs) => {
    const { config } = args;
    const spinner = ora(`Start to build ${config.appname}..`).start();
    const compiler = webpack(getWebpackConfig(config));
    const am = new AssetsManager(config, args.watch);
    if (!args.watch) {
        compiler.run((error, stats) => {
            am.copyAssets().closeWatchers();
            compileMsg(spinner, stats);
        });
    } else {
        compiler.watch(
            {
                ignored: config.watchIngore.map((file) => path.resolve(config.rootPath, file)),
            },
            (error, stats) => {
                am.copyAssets();
                compileMsg(spinner, stats);
            },
        );
    }
};

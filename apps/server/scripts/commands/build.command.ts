/* eslint-disable global-require */
import ora from 'ora';
import webpack from 'webpack';
import { AssetsManager, compileMsg, getWebpackConfig } from '../supports';
import { ICommandArgs } from '../types';

export const command = ['build'];
export const describe = 'Start app dev server';
export const builder = {};

export const handler = async (args: ICommandArgs) => {
    const { config } = args;
    const spinner = ora(`Start to build ${config.appname}..`).start();
    const am = new AssetsManager(config, false);
    const compiler = webpack(getWebpackConfig(config, true));
    compiler.run((error, stats) => {
        am.copyAssets().closeWatchers();
        compileMsg(spinner, stats);
    });
};

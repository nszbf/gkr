import ora from 'ora';
import webpack from 'webpack';
import yargs, { CommandModule } from 'yargs';
import { getConfig } from '../configure';
import { getPackage } from '../configure/helper';
import { CLIAppConfig, CLILibConfig } from '../types';
import { AssetsManager } from '../utils/assets';
import { execShell } from '../utils/console';
import { compileMsg } from '../utils/message';
import { getWebpackConfig } from '../utils/webpack';

type BuildArgs = {
    name: string;
};
export const build: CommandModule<any, BuildArgs> = {
    command: ['build <name>', 'b'],
    describe: 'build app or lib',
    builder: {},

    handler: async (args: yargs.Arguments<BuildArgs>) => handlerBuild(args.name),
};

const builded: string[] = [];

const handlerBuild = async (name: string) => {
    const packConfig = getPackage(name);
    const config = getConfig(packConfig.name);
    for (const dep of config.deps) {
        await handlerBuild(dep);
        builded.push(dep);
    }
    if (!builded.includes(packConfig.name)) {
        process.chdir(
            packConfig.type === 'lib'
                ? (config as CLILibConfig).paths.lib
                : (config as CLIAppConfig).paths.app,
        );
        const spinner = ora(`Start to build ${packConfig.name}..`).start();
        if (packConfig.type === 'app') {
            const compiler = webpack(getWebpackConfig(config as CLIAppConfig, { build: true }));
            const am = new AssetsManager(config as CLIAppConfig, false);
            compiler.run((error, stats) => {
                am.copyAssets().closeWatchers();
                compileMsg(spinner, stats);
            });
        } else {
            await execShell('yarn run clean && yarn run build');
            spinner.succeed();
        }
        process.chdir(config.paths.root);
    }
};

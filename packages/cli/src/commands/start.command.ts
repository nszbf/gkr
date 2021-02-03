import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import webpack from 'webpack';
import yargs, { CommandModule } from 'yargs';
import { getConfig } from '../configure';
import { getPackage } from '../configure/helper';
import { CLIAppConfig } from '../types';
import { AssetsManager } from '../utils/assets';
import { compileMsg } from '../utils/message';
import { getWebpackConfig } from '../utils/webpack';

type StartArgs = {
    name: string;
    watch: boolean;
    hmr: boolean;
};
export const start: CommandModule<any, StartArgs> = {
    command: ['start <name>', 's'],
    describe: 'Start run app',
    builder: {
        hmr: {
            type: 'boolean',
            alias: 'r',
            default: false,
        },
        watch: {
            type: 'boolean',
            alias: 'w',
            default: false,
        },
    },

    handler: async (args: yargs.Arguments<StartArgs>) => {
        const packConfig = getPackage(args.name);
        if (packConfig.type !== 'app') {
            console.log();
            console.log(
                chalk.red(
                    `\n❌ start command been run must in an app,but package ${packConfig.name} is not an app!`,
                ),
            );
            process.exit(1);
        }
        const config = getConfig(packConfig.name) as CLIAppConfig;
        const spinner = ora(`Start to build ${packConfig.name}..`).start();
        const compiler = webpack(getWebpackConfig(config, { watch: args.watch, hmr: args.hmr }));
        const am = new AssetsManager(config, args.watch);
        if (!args.watch) {
            compiler.run((error, stats) => {
                am.copyAssets().closeWatchers();
                compileMsg(spinner, stats);
            });
        } else {
            compiler.watch(
                {
                    ignored: config.compile.watchIgnore.map((file) =>
                        path.resolve(config.paths.app, file),
                    ),
                },
                (error, stats) => {
                    am.copyAssets();
                    compileMsg(spinner, stats);
                },
            );
        }
    },
};

import { INestApplication, Type } from '@nestjs/common';
import chalk from 'chalk';
import yargs from 'yargs';
import { ModuleResolver } from '../resolvers/module.resolver';
import { UtilResolver } from '../resolvers/util.resolver';
import { IApp, LifeCycleHooks } from './types';

export function generateCommands(
    app: INestApplication,
    util: UtilResolver,
    close: () => Promise<void>,
) {
    return util.all
        .map(({ value }) => value.registerCommands())
        .reduce((o, n) => [...o, ...n], [])
        .filter(
            (command) => !!process.env.RUN_SOURCE || command.source || command.source === undefined,
        )
        .map((command) => {
            const { source, ...onKey } = command;
            return onKey;
        })
        .map((command) => ({
            ...command,
            handler: async (args: yargs.Arguments<any>) => {
                const handler = command.handler as (
                    ...argvs: yargs.Arguments<any>
                ) => Promise<void>;
                await handler({ app, close, ...args });
                await close();
            },
        }));
}

export function buildCommands(app: IApp) {
    console.log();
    // eslint-disable-next-line global-require
    const { hideBin } = require('yargs/helpers');
    yargs
        .usage('Usage: $0 <command> [options]')
        .scriptName('cli')
        .demandCommand(1, '')
        .fail((msg, err, y) => {
            const command = hideBin(process.argv)[0];
            if (!app.mounted && !['module:init', 'm:i'].includes(command)) {
                const message = `🙄 warning: some moudles not be mounted yet,please use 'moudule:init' comand to mount there in sources environment for every moudules first!`;
                console.error(chalk.yellow(message));
                process.exit();
            }
            if (!msg && !err) {
                yargs.showHelp();
                process.exit();
            }
            if (msg) console.error(chalk.red(msg));
            if (err) console.error(chalk.red(err.message));
            process.exit();
        })
        .strict()
        .alias('v', 'version')
        .help('h')
        .alias('h', 'help').argv;
}
export function getMountCommand(moduler: ModuleResolver, modules: Type<any>[]) {
    const mounts = modules
        .map((mod) => {
            const options = moduler.getModuleOptions(mod);
            return options.mount?.resolve;
        })
        .filter((r) => r !== undefined) as Array<() => Promise<void>>;
    return {
        command: ['module:init', 'm:i'],
        describe: 'Creates a new migration file',
        builder: {},
        handler: async (args: yargs.Arguments<any>) => {
            mounts.forEach(async (mount) => await mount());
        },
    };
}
export function getRunCommand(app: IApp, hooks: LifeCycleHooks) {
    const { configure, util, instance } = app;

    return {
        command: ['start'],
        describe: 'Start app',
        builder: {},
        handler: async () => {
            const host = configure.get<boolean>('app.host');
            const port = configure.get<number>('app.port')!;
            const https = configure.get<boolean>('app.https');
            let appUrl = configure.get<string>('app.url');
            if (!appUrl) {
                appUrl = `${https ? 'https' : 'http'}://${host!}:${port}`;
            }
            await instance.listen(port, '0.0.0.0', () => {
                console.log();
                console.log('Server has started:');
                hooks.echo
                    ? hooks.echo(configure, util)
                    : console.log(`- API: ${chalk.green.underline(appUrl!)}`);
            });
            const { hmr } = hooks;
            if (hmr) {
                hmr.accept();
                hmr.dispose(async () => instance.close());
            }
        },
    };
}

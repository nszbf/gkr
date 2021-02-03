import chalk from 'chalk';
import yargs, { CommandModule } from 'yargs';
import * as scripts from './commands';
import { getConfig } from './supports';

process.env.RUN_CLI = 'on';
// eslint-disable-next-line consistent-return
// eslint-disable-next-line consistent-return
const buildCommands = async () => {
    const config = await getConfig();

    try {
        return Object.values(scripts).map((command) => ({
            ...command,
            builder: {
                ...command.builder,
                dist: {
                    type: 'string',
                    describe: 'If run commands by dist file,specify its path',
                },
            },
            handler: async (args: yargs.Arguments<any>) => command.handler({ ...args, config }),
        })) as Array<CommandModule<any, any>>;
    } catch (err) {
        console.log();
        console.log('\n❌ ', chalk.red(err));
        process.exit(1);
    }
};

buildCommands().then((commands) => {
    commands.forEach((command) => yargs.command(command));
    yargs
        .usage('Usage: $0 <command> [options]')
        .demandCommand(1)
        .strict()
        .alias('v', 'version')
        .help('h')
        .alias('h', 'help').argv;
});

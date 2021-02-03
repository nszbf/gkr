import yargs, { CommandModule } from 'yargs';
import { excuteHandler, ExcuteOptions } from '../utils/console';

export const excute: CommandModule<any, ExcuteOptions> = {
    command: ['excute <name> [cmd]', 'e'],
    describe: 'Excute app commands',
    handler: async (args: yargs.Arguments<ExcuteOptions>) => excuteHandler(args),
};

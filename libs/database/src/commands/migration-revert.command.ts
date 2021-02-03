import { CommandContiner } from '@gkr/core/src';
import yargs from 'yargs';
import { MigrationRevertHandler } from '../handlers';
import { MigrationRunArguments } from '../types';

export const MRTCommand: CommandContiner<any, MigrationRunArguments> = {
    command: ['db:migration:resvert', 'db:mrt'],
    describe: 'Reverts last executed migration',
    builder: {
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Name of the connection on which run a query.',
        },
        transaction: {
            type: 'string',
            alias: 't',
            describe:
                ' Indicates if transaction should be used or not formigration revert. Enabled by default.',
            default: 'default',
        },
    } as const,

    handler: async (args: yargs.Arguments<MigrationRunArguments>) =>
        await MigrationRevertHandler(args),
};

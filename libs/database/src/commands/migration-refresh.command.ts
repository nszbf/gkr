import { CommandContiner } from '@gkr/core/src';
import yargs from 'yargs';
import { MigrationRefreshHandler } from '../handlers';
import { MigrationRefreshArguments } from '../types';

export const MRFCommand: CommandContiner<any, MigrationRefreshArguments> = {
    command: ['db:migration:refresh', 'db:mrf'],
    describe: 'Refresh migrations',
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
        seed: {
            type: 'boolean',
            alias: 's',
            describe: 'Seed data after runned',
            default: false,
        },
        modules: {
            type: 'array',
            alias: 'm',
            describe: 'Specific which modules to run seed.',
        },
        force: {
            type: 'boolean',
            alias: 'f',
            describe: 'Run migration after delete all tables',
        },
    } as const,

    handler: async (args: yargs.Arguments<MigrationRefreshArguments>) =>
        await MigrationRefreshHandler(args),
};

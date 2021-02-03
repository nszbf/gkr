import { CommandContiner } from '@gkr/core/src';
import yargs from 'yargs';
import { MigrationRunHandler } from '../handlers';
import { MigrationRunArguments } from '../types';

export const MRNCommand: CommandContiner<any, MigrationRunArguments> = {
    command: ['db:migration:run', 'db:mrn'],
    describe: 'Runs all pending migrations.',
    builder: {
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Connection name of typeorm to connect database.',
        },
        transaction: {
            type: 'string',
            alias: 't',
            describe:
                ' Indicates if transaction should be used or not formigration revert. Enabled by default.',
            default: 'default',
        },
        // pretty: {
        //     type: 'boolean',
        //     alias: 'p',
        //     describe: 'Pretty-print generated SQL',
        //     default: false,
        // },
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
    } as const,

    handler: async (args: yargs.Arguments<MigrationRunArguments>) =>
        await MigrationRunHandler(args),
};

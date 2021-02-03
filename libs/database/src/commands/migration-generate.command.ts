import { CommandContiner } from '@gkr/core/src';
import yargs from 'yargs';
import { MigrationGenerateHandler } from '../handlers';
import { MigrationGenerateArguments } from '../types';

export const MGCommand: CommandContiner<any, MigrationGenerateArguments> = {
    source: true,
    command: ['db:migration:generate', 'db:mg'],
    describe: 'Generates a new migration file with sql needs to be executed to update schema.',
    builder: {
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Connection name of typeorm to connect database.',
        },
        name: {
            type: 'string',
            alias: 'n',
            describe: 'Name of the migration class.',
            demandOption: true,
        },
        dir: {
            type: 'string',
            alias: 'd',
            describe: 'Which directory where migration should be generated.',
        },
        pretty: {
            type: 'boolean',
            alias: 'p',
            describe: 'Pretty-print generated SQL',
            default: false,
        },
    } as const,

    handler: async (args: yargs.Arguments<MigrationGenerateArguments>) =>
        await MigrationGenerateHandler(args),
};

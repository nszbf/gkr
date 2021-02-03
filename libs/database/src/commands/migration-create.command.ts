import { CommandContiner } from '@gkr/core';
import yargs from 'yargs';
import { MigrationCreateHandler } from '../handlers';
import { MigrationCreateArguments } from '../types';

export const MCCommand: CommandContiner<any, MigrationCreateArguments> = {
    source: true,
    command: ['db:migration:create', 'db:mc'],
    describe: 'Creates a new migration file',
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
        module: {
            type: 'string',
            alias: 'm',
            describe: 'Module directory where migration should be created.',
            demandOption: true,
        },
    } as const,

    handler: async (args: yargs.Arguments<MigrationCreateArguments>) =>
        await MigrationCreateHandler(args),
};

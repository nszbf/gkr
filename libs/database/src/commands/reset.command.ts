import { CommandContiner } from '@gkr/core/src';
import * as yargs from 'yargs';
import { ResetHandler } from '../handlers';
import { DbRefreshArguments } from '../types';

export const RCommand: CommandContiner<any, DbRefreshArguments> = {
    source: true,
    command: ['db:reset', 'db:r'],
    describe: 'Delete all tables and run migrate',
    builder: {
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Connection name of typeorm to connect database.',
        },
        destory: {
            type: 'boolean',
            alias: 'd',
            describe: 'Only delete all tables of database.',
        },
        seed: {
            type: 'boolean',
            alias: 's',
            describe: 'Run seed for database.',
        },
    } as const,

    handler: async (args: yargs.Arguments<DbRefreshArguments>) => await ResetHandler(args),
};

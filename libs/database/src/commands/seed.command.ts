import { CommandArgs, CommandContiner } from '@gkr/core';
import { SeedHandler } from '../handlers';
import { DbSeedArguments } from '../types';

export const SCommand: CommandContiner<any, DbSeedArguments> = {
    command: ['db:seed', 'db:s'],
    describe: 'Runs the databased seeds',
    builder: {
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Connection name of typeorm to connect database.',
        },
        modules: {
            type: 'array',
            alias: 'm',
            describe: 'Specific which modules to run seed.',
        },
    } as const,

    handler: async (args: CommandArgs<DbSeedArguments>) => await SeedHandler(args),
};

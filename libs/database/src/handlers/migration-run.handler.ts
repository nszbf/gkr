import { printError } from '@gkr/core';
import chalk from 'chalk';
import ora from 'ora';
import { makeCliConnection } from '../helpers';
import { MigrationRunArguments } from '../types';
import { SeedHandler } from './seed.handler';
import { TypeormMigrationRun } from './typeorm';

export const MigrationRunHandler = async (args: MigrationRunArguments) => {
    const connection = await makeCliConnection(args.connection);

    try {
        const spinner = ora('Start to run migration').start();
        const runner = new TypeormMigrationRun();
        console.log();
        await runner.handler({ t: args.transaction || 'default' }, connection);
        await connection!.close();
        spinner.succeed(chalk.greenBright.underline('\n 👍 Run migration successed'));
    } catch (err) {
        printError('Run migration failed!', err);
    }
    if (args.seed) {
        console.log('\n');
        try {
            await SeedHandler(args);
        } catch (err) {
            process.exit(1);
        }
    }
};

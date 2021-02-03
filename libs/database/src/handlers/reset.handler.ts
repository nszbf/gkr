import { panic } from '@gkr/core';
import chalk from 'chalk';
import ora from 'ora';
import { makeCliConnection } from '../helpers';
import { DbRefreshArguments } from '../types';
import { SeedHandler } from './seed.handler';

export const ResetHandler = async (args: DbRefreshArguments) => {
    const { log } = console;
    const connection = await makeCliConnection(args.connection);
    const spinner = ora('Start sync entity to database').start();
    try {
        await connection.dropDatabase();
        if (args.destory) {
            await connection.close();
            log('\n', '\n 👍 ', chalk.greenBright.underline('Finished destory the database'));
            process.exit(0);
        }
        await connection.synchronize();
        await connection.close();
        spinner.succeed(chalk.greenBright.underline('\n 👍 Finished reset database'));
    } catch (error) {
        panic(spinner, 'Database sync failed', error);
    }
    if (args.seed) {
        log('\n');
        await SeedHandler(args);
    }
    process.exit(0);
};

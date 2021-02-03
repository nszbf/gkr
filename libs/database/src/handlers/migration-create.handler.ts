import { panic } from '@gkr/core';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import yargs from 'yargs';
import { dbOption, defaultDbName } from '../helpers';
import { DbOption, MigrationCreateArguments } from '../types';
import { TypeormMigrationCreate } from './typeorm';

export const MigrationCreateHandler = async (args: yargs.Arguments<MigrationCreateArguments>) => {
    const spinner = ora('Start to create migration').start();
    const cname = args.connection ?? defaultDbName();
    let option: DbOption;
    try {
        option = dbOption(cname);
    } catch (err) {
        panic(spinner, err.message);
    }
    try {
        const runner = new TypeormMigrationCreate();
        console.log();
        runner.handler(
            {
                name: cname,
                dir: path.join('src/modules', args.module, 'database/migration'),
            },
            option!,
        );
        spinner.succeed(chalk.greenBright.underline('\n 👍 Finished create migration'));
    } catch (err) {
        panic(spinner, 'Create migration failed!', err);
    }
};

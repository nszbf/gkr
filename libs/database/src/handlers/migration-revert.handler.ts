import { printError } from '@gkr/core';
import chalk from 'chalk';
import ora from 'ora';
import { makeCliConnection } from '../helpers';
import { MigrationRevertArguments } from '../types';
import { TypeormMigrationRevert } from './typeorm';

export const MigrationRevertHandler = async (args: MigrationRevertArguments) => {
    const connection = await makeCliConnection(args.connection);
    try {
        const spinner = ora('Start to revert migration').start();
        const runner = new TypeormMigrationRevert();
        console.log();
        await runner.handler({ t: args.transaction || 'default' }, connection);
        await connection!.close();
        spinner.succeed(chalk.greenBright.underline('\n 👍 Revert migration successed'));
    } catch (err) {
        printError('Revert migration failed!', err);
    }
};

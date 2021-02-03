import { config, printError } from '@gkr/core';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import yargs from 'yargs';
import { makeCliConnection } from '../helpers';
import { MigrationGenerateArguments } from '../types';
import { TypeormMigrationGenerate } from './typeorm';

export const MigrationGenerateHandler = async (
    args: yargs.Arguments<MigrationGenerateArguments>,
) => {
    const connection = await makeCliConnection(args.connection);
    try {
        const spinner = ora('Start to generate migration').start();
        const migrationDir = path.join(
            'src',
            config('database.common.migration') ?? 'migration',
            args.dir ?? '',
        );
        const runner = new TypeormMigrationGenerate();
        console.log();
        await runner.handler(
            {
                name: args.name,
                dir: migrationDir,
                pretty: args.pretty,
            },
            connection,
        );
        if (connection.isConnected) await connection.close();
        spinner.succeed(chalk.greenBright.underline('\n 👍 Finished generate migration'));
    } catch (err) {
        printError('Generate migration failed!', err);
    }
};

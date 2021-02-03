import { printError } from '@gkr/core';
import chalk from 'chalk';
import ora from 'ora';
import { dbOption, runSeeder } from '../helpers';
import { SeederService } from '../services/seeder.service';
import { DbSeedArguments } from '../types';

export const SeedHandler = async (args: DbSeedArguments) => {
    const runner = dbOption(args.connection).seeder ?? SeederService;
    try {
        const spinner = ora('Start run seeder').start();
        await runSeeder(runner, args, spinner);
        spinner.succeed(`\n 👍 ${chalk.greenBright.underline(`Finished Seeding`)}`);
    } catch (error) {
        printError(`Run seeder failed`, error);
    }
};

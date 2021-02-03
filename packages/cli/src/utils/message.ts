import chalk from 'chalk';
import ora from 'ora';
import webpack from 'webpack';
import formatMessages from 'webpack-format-messages';

export const compileMsg = (spinner: ora.Ora, stats?: webpack.Stats) => {
    const { errors, warnings } = formatMessages(stats);
    console.log();
    if (!errors.length && !warnings.length) {
        spinner.succeed(chalk.green('build successfully!'));
    }
    errors.forEach((err) => {
        console.log();
        spinner.fail(chalk.red(err));
    });
    warnings.forEach((warn) => {
        console.log();
        spinner.warn(chalk.yellow(warn));
    });
};

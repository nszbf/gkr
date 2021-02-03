import chalk from 'chalk';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import shell from 'shelljs';
import { getConfig } from '../configure';
import { getPackage } from '../configure/helper';
import { CLIAppConfig } from '../types';

export type ExcuteOptions = {
    name: string;
    cmd?: string;
};
export function execShell(command: string, pretty = false) {
    return new Promise<void>((resolve, reject) => {
        shell.exec(command, (code, stdout, stderr) => {
            if (pretty) {
                console.log(stderr ? chalk.red(stderr) : chalk.green(stdout));
            }
            if (stderr) {
                return reject(new Error(stderr));
            }
            return resolve();
        });
    });
}
export async function excuteHandler({ name, cmd }: ExcuteOptions) {
    const packConfig = getPackage(name);
    if (packConfig.type !== 'app') {
        console.log();
        console.log(
            chalk.red(
                `\n❌ excute command been run must in an app,but package ${packConfig.name} is not an app!`,
            ),
        );
        process.exit(1);
    }
    if (cmd === 'start') {
        console.log();
        console.log(
            chalk.red(`\n❌ in dev envriment,please run gkr start ${packConfig.name} direct`),
        );
        process.exit(1);
    }
    const config = getConfig(packConfig.name) as CLIAppConfig;
    if (!fs.existsSync(config.paths.entry) || !fs.lstatSync(config.paths.entry).isFile()) {
        console.log();
        console.log(chalk.red(`\n❌ entry file ${config.paths.entry} not exists!`));
        console.log(
            chalk.yellow(
                `\n😅 cli command should run in src files(dev stage)entry,in production environment you can run dist file direct`,
            ),
        );
        process.exit(1);
    }
    const script = `./${path.join(config.dirs.source, config.files.entry)}`;
    let pms = ['--files', '-T', `-P`, config.tsconfig, '-r', 'tsconfig-paths/register', script];
    if (cmd) {
        pms = [...pms, ...cmd.split(' ')];
    }
    spawn('ts-node', pms, {
        cwd: config.paths.app,
        stdio: 'inherit',
        env: { ...process.env, RUN_SOURCE: 'on' },
    });
    process.on('close', (code) => process.exit());
}

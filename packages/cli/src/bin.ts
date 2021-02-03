#!/usr/bin/env node

import yargs, { CommandModule } from 'yargs';
import * as commands from './commands';
import { excuteHandler } from './utils/console';

process.env.NODE_SOURCE = 'on';
const { hideBin } = require('yargs/helpers');

let args = hideBin(process.argv) as string[];
if (args.includes('excute')) {
    args = ['excute', ...args.slice(args.indexOf('excute') + 1)];
}

if (args[0] === 'excute' && ((args.length >= 2 && !args.includes('-h')) || args.length >= 3)) {
    args.shift();
    const appName = args.shift();
    const cmd = args.length > 0 ? args.join(' ') : undefined;
    excuteHandler({ name: appName!, cmd });
} else {
    yargs(args);
    const cmds = Object.values(commands) as Array<CommandModule<any, any>>;

    cmds.forEach((command) => yargs.command(command));
    yargs
        .usage('Usage: $0 <command> [options]')
        .demandCommand(1)
        .strict()
        .alias('v', 'version')
        .help('h')
        .alias('h', 'help').argv;
}

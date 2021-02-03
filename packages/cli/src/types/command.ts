import yargs from 'yargs';
import { CLIAppConfig, CLILibConfig } from './config';

export type ICommandArgs<
    C extends CLIAppConfig | CLILibConfig,
    T extends Record<string, any> = Record<string, any>
> = yargs.Arguments<T & { config: C }>;
export type RunAppCommandArgs = yargs.Arguments<{
    name: string;
    watch: boolean;
}>;

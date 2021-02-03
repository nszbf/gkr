import webpack from 'webpack';
import Chain from 'webpack-chain';
import { Asset, WebpackConfigOptions } from './util';

type AppCompile = {
    mode: Exclude<webpack.Configuration['mode'], undefined>;
    devtool: Chain.DevTool;
    alias: Record<string, string>;
    watchIgnore: string[];
    tsRefrences: boolean;
    assets: Asset[];
    chain: (chain: Chain, config: CLIAppConfig, options: WebpackConfigOptions) => Chain;
    webpackConfig: (config: CLIAppConfig, options: WebpackConfigOptions) => webpack.Configuration;
};

type CustomCommonConfig = {
    name: string;
    path: string;
    source: string;
    output: string;
    tsconfig: string;
};

export type CustomAppConfig = CustomCommonConfig & {
    entry: string;
    dist: string;
};
export type CustomLibConfig = CustomCommonConfig;
export type CustomConfig = {
    prefix: string;
    stubs: {
        apps: string;
        libs: string;
    };
    apps: { [name: string]: CustomAppConfig };
    libs: { [name: string]: CustomLibConfig };
};
export type PackageItem = { name: string; type: 'app' | 'lib'; path: string };
export type CLICommonConfig = Pick<CustomConfig, 'prefix'> &
    Pick<CustomCommonConfig, 'tsconfig'> & {
        name: string;
        environment: 'development' | 'production' | 'test';
        packages: Array<PackageItem>;
        paths: {
            root: string;
            stubs: CustomConfig['stubs'];
            source: string;
            output: string;
        };
        dirs: {
            stubs: CustomConfig['stubs'];
            source: string;
            output: string;
        };
        deps: string[];
    };
export type CLIAppConfig = CLICommonConfig & {
    paths: CLICommonConfig['paths'] & {
        app: string;
        entry: string;
        dist: string;
    };
    dirs: CLICommonConfig['dirs'] & {
        app: string;
    };
    files: {
        entry: string;
        dist: string;
    };
    compile: AppCompile;
};

export type CLILibConfig = CLICommonConfig & {
    paths: CLICommonConfig['paths'] & {
        lib: string;
    };
    dirs: CLICommonConfig['dirs'] & {
        lib: string;
    };
};

export type CLIConfig = CLIAppConfig | CLILibConfig;

import webpack from 'webpack';
import Chain from 'webpack-chain';
import yargs from 'yargs';

export type RePartial<T> = {
    [P in keyof T]?: T[P] extends Record<string, any> | Array<Record<string, any>>
        ? RePartial<T[P]>
        : T[P];
};

export type Asset = string | AssetEntry;
export interface AssetEntry {
    glob?: string;
    include?: string;
    flat?: boolean;
    exclude?: string;
    outDir?: string;
    resolve?: (dest: string) => string;
    watchAssets?: boolean;
}

export interface ActionOnFile {
    action: 'change' | 'unlink';
    item: AssetEntry;
    path: string;
    watchAssetsMode: boolean;
}

export type IConfig = {
    appname: string;
    rootPath: string;
    readonly appPath: string;
    srcPath: string;
    buildPath: string;
    entryFile: string;
    distFile: string;
    readonly devtool: Chain.DevTool;
    readonly mode: Exclude<webpack.Configuration['mode'], undefined>;
    tsconfig: {
        // 运行时tsconfig配置
        start: string;
        // 编译时tsconfig配置
        build: string;
    };
    alias: {
        [key: string]: string;
    };
    assets: Asset[];
    watchAssets: boolean;
    watchIngore: string[];
    webpackConfig: (config: IConfig) => webpack.Configuration;
    webpackChain: (chain: Chain, config: IConfig) => Chain;
    mono: {
        enabled: boolean;
        // 是否在build时开启refrences project功能
        references: boolean;
        // 打包到产出物中的扩展包(添加后会自动watch扩展包文件)
        // 默认根据package.json和lerna.json做对比自动获取
        // 如果手动设置则直接覆盖,如果开启references则在编译时不打包
        externals: Record<string, string> | boolean;
        /**
         * 额外的扩展包: 用于把不写入package.json中的依赖打包进去
         * 如果是references模式编译,则设置此项会导致运行编译后的产出物丢包
         * 比如打包@gkr/common进去,但package.json中没有添加@gkr/common
         * 在运行时会通过paths路径重写把@gkr/common打包进去,运行时不会产生问题
         * 而开启references后在打包时会自动排除所有的依赖包
         * 这就会导致在运行产出物时找不到@gkr/common这个包,从而引发错误
         */
        additionalExternals: Record<string, string>;
        /**
         * 需要排除的扩展包: 排除packages中一些不需要打包进产出物以及运行时需要watch的包
         * 由于开启references模式后会自动在编译时排除所有的包,所以在references模式的编译时此项设置无效
         * 在非references模式下编译后,需要先build此项中的包才能运行产出物
         * 否则会导致找不到这些扩展包中的'main'字段中的dist文件
         */
        ignoreExternals: string[];
    };
};

export type IConfigure = (config: IConfig) => RePartial<IConfig>;

export type ICommandArgs<T extends Record<string, any> = Record<string, any>> = yargs.Arguments<
    T & { config: IConfig }
>;
export type RunArgs = ICommandArgs<{
    root?: string;
    watch: boolean;
}>;

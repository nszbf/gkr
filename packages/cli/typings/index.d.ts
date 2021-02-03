declare module 'webpack-node-externals' {
    export = nodeExternals;
}
declare module 'node-hot-loader/NodeHotLoaderWebpackPlugin' {
    export default any;
}
declare module 'webpack-format-messages' {
    const formatMessages: (
        stats,
    ) => {
        errors: string[];
        warnings: string[];
    };
    export default formatMessages;
}

declare module 'start-server-nestjs-webpack-plugin' {
    // eslint-disable-next-line import/no-extraneous-dependencies
    import { Plugin } from 'webpack';

    export = StartServerWebpackPlugin;

    declare class StartServerWebpackPlugin extends Plugin {
        constructor(options?: string | StartServerWebpackPlugin.Options);
    }

    declare namespace StartServerWebpackPlugin {
        interface Options {
            /**
             * Name of the server to start (built asset from webpack).
             * If not provided, the plugin will tell you the available names.
             */
            name?: string;
            /**
             * Arguments for node.
             * Default: `[]`.
             */
            nodeArgs?: string[];
            /**
             * Arguments for the script.
             * Default: `[]`.
             */
            args?: string[];
            /**
             * Signal to send for HMR.
             * Default: 'false'.
             */
            signal?: false | true | 'SIGUSR2';
            /**
             * Allow typing 'rs' to restart the server.
             * Default: 'true' if in 'development' mode, 'false' otherwise.
             */
            keyboard?: boolean;
        }
    }
}

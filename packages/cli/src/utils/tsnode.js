/* eslint-disable global-require */
module.exports = {
    tsNode(options = {}) {
        const { configFile, paths } = options;
        if (typeof configFile !== 'undefined') {
            process.env.TS_NODE_PROJECT = configFile;
            require('ts-node').register({
                files: true,
                transpileOnly: true,
                project: configFile,
            });
            if (typeof paths !== 'undefined') {
                return require('tsconfig-paths').register();
            }
        }

        require('ts-node').register({ transpileOnly: true });
        return undefined;
    },
};

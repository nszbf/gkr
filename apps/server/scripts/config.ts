import { IConfigure } from './types';

const config: IConfigure = (_config) => ({
    app: { name: 'gkr server' },
    mono: {
        enabled: true,
        references: true,
    },
    assets: [
        {
            include: 'data/**/*.md',
            outDir: 'dist/data',
            resolve: (dest) => dest.replace(/[\w/]*data/, ''),
        },
    ],
});
export = config;

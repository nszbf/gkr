module.exports = (config) => {
    return {
        assets: [
            {
                include: 'data/**/*.md',
                outDir: 'dist/data',
                resolve: (dest) => dest.replace(/[\w/]*data/, ''),
            },
        ],
    };
};

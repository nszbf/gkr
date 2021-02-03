module.exports = {
    root: true,
    extends: [require.resolve('@gkr/fabric/eslint/node')],
    rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: ['scripts/**/*.ts'] }],
    },
};

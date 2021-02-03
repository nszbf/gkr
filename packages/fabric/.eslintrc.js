module.exports = {
    extends: [
        // airbnb规范
        // https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb
        "airbnb",
        // 使用prettier格式化代码
        // https://github.com/prettier/eslint-config-prettier#readme
        "prettier",
        // 整合eslint recommend规范与prettier
        // https://prettier.io/docs/en/integrating-with-linters.html#recommended-configuration
        "plugin:prettier/recommended",
    ],
    settings: {
        "import/resolver": {
            node: {
                extensions: [".js", ".json"],
            },
        },
    },
    env: {
        es6: true,
        browser: true,
        jest: true,
        node: true,
    },
    rules: {
        // ES6+
        "no-console": 0,
        "no-var-requires": 0,
        "no-restricted-syntax": 0,
        "no-continue": 0,
        "no-await-in-loop": 0,
        "no-return-await": 0,
        "no-unused-vars": 0,
        "no-multi-assign": 0,
        "no-param-reassign": [2, { props: false }],
        "import/prefer-default-export": 0,
        "import/no-cycle": 0,
        "import/no-dynamic-require": 0,
        "max-classes-per-file": 0,
        "class-methods-use-this": 0,
        "guard-for-in": 0,
        "no-underscore-dangle": 0,

        "prettier/prettier": "error",
        "import/no-extraneous-dependencies": 1,
        "global-require": 0,
        "import/extensions": 0,
        "import/no-unresolved": [2, { commonjs: true }],
    },
};

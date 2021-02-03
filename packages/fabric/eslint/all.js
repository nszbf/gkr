module.exports = {
    parser: "vue-eslint-parser",
    extends: [
        "plugin:vue/vue3-recommended",
        // typescript的eslint插件
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md
        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",

        // airbnb规范
        // https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb
        // 'airbnb',
        // 兼容typescript的airbnb规范
        // https://github.com/iamturns/eslint-config-airbnb-typescript
        "airbnb-typescript",
        // react hooks的airbnb规范
        "airbnb/hooks",

        // 使用prettier格式化代码
        // https://github.com/prettier/eslint-config-prettier#readme
        "prettier",
        // 整合typescript-eslint与prettier
        "prettier/@typescript-eslint",
        // 整合react与prettier
        "prettier/react",
        "prettier/vue",
        // 整合eslint recommend规范与prettier
        // https://prettier.io/docs/en/integrating-with-linters.html#recommended-configuration
        "plugin:prettier/recommended",
    ],
    parserOptions: {
        parser: "@typescript-eslint/parser",
        // 指定ESLint可以解析JSX语法
        ecmaVersion: "2020",
        sourceType: "module",
        project: "./tsconfig.json",
        // React启用jsx
        ecmaFeatures: {
            jsx: true,
        },
        extraFileExtensions: ["vue"],
    },
    plugins: ["@typescript-eslint", "import", "vue"],
    env: {
        es6: true,
        browser: true,
        jest: true,
        node: true,
    },
    settings: {
        "import/resolver": {
            node: {
                extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".vue"],
            },
            alias: {
                extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".vue"],
            },
        },
    },
    rules: {
        // 'import/extensions': [
        //     'error',
        //     'ignorePackages',
        //     {
        //         js: 'never',
        //         mjs: 'never',
        //         jsx: 'never',
        //         ts: 'never',
        //         tsx: 'never',
        //         vue: 'never',
        //     },
        // ],
        "prettier/prettier": "error",

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
        "max-classes-per-file": 0,
        "class-methods-use-this": 0,
        "guard-for-in": 0,
        "no-underscore-dangle": 0,
        "no-plusplus": 0,

        // Module Import
        "import/prefer-default-export": 0,
        "import/no-cycle": 0,
        "import/no-dynamic-require": 0,
        "import/no-extraneous-dependencies": 0,
        "import/no-absolute-path": 0,

        // React
        "react/display-name": 0,
        "react/prop-types": 0,
        "react/jsx-props-no-spreading": 0,
        "react/destructuring-assignment": 0,
        "react/static-property-placement": 0,
        "react/react-in-jsx-scope": 0,
        "react/jsx-filename-extension": [1, { extensions: [".jsx", ".tsx"] }],

        // React Hooks
        "react-hooks/exhaustive-deps": 0,

        // Typescript
        "@typescript-eslint/no-empty-interface": 0,
        "@typescript-eslint/no-this-alias": 0,
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/no-use-before-define": 0,
        "@typescript-eslint/explicit-member-accessibility": 0,
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/no-unnecessary-type-assertion": 0,
        "@typescript-eslint/require-await": 0,
        "@typescript-eslint/no-for-in-array": 0,
        "@typescript-eslint/interface-name-prefix": 0,
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "@typescript-eslint/no-floating-promises": 0,
        "@typescript-eslint/restrict-template-expressions": 0,
        "@typescript-eslint/no-unsafe-assignment": 0,
        "@typescript-eslint/no-unsafe-return": 0,
        "@typescript-eslint/no-unused-expressions": 0,
        "@typescript-eslint/no-misused-promises": 0,
        "@typescript-eslint/no-unsafe-member-access": 0,
        "@typescript-eslint/no-unsafe-call": 0,
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                vars: "all",
                args: "none",
                ignoreRestSiblings: true,
            },
        ],
    },
};

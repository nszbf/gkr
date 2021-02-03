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
        "airbnb-typescript/base",

        // 使用prettier格式化代码
        // https://github.com/prettier/eslint-config-prettier#readme
        "prettier",
        // 整合typescript-eslint与prettier
        "prettier/@typescript-eslint",
        // 整合vue与prettier
        "prettier/vue",
        // 整合eslint recommend规范与prettier
        // https://prettier.io/docs/en/integrating-with-linters.html#recommended-configuration
        "plugin:prettier/recommended",
        require.resolve("./shared"),
    ],
    parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: ["vue"],
    },
    plugins: ["@typescript-eslint", "import", "vue"],
    settings: {
        "import/resolver": {
            alias: {
                extensions: [
                    ".ts",
                    ".tsx",
                    ".js",
                    ".jsx",
                    ".d.ts",
                    ".json",
                    ".vue",
                ],
            },
        },
    },
};

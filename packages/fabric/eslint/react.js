module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
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
        // 整合eslint recommend规范与prettier
        // https://prettier.io/docs/en/integrating-with-linters.html#recommended-configuration
        "plugin:prettier/recommended",
        require.resolve("./shared"),
    ],
    parserOptions: {
        // React启用jsx
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ["@typescript-eslint", "import"],
    rules: {
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

        // jax-a11y
        "jsx-a11y/anchor-is-valid": 0,
        "jsx-a11y/no-static-element-interactions": 0,
        "jsx-a11y/click-events-have-key-events": 0,
    },
};

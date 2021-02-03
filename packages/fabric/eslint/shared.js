module.exports = {
    parserOptions: {
        // 指定ESLint可以解析JSX语法
        ecmaVersion: "2020",
        sourceType: "module",
        project: "./tsconfig.json",
    },
    env: {
        es6: true,
        browser: true,
        jest: true,
        node: true,
    },
    settings: {
        "import/resolver": {
            node: {
                extensions: [
                    ".js",
                    ".jsx",
                    ".ts",
                    ".tsx",
                    ".d.ts",
                    ".json",
                    ".vue",
                ],
            },
        },
    },
    rules: {
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
        // "import/no-extraneous-dependencies": 1,
        "import/no-absolute-path": 0,

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

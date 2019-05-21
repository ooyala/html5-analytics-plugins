module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: 'airbnb-base',
  globals: {
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "max-len": [
      "error", 110,
      {
        "ignoreComments": true,
        "ignorePattern": "if \\(\/\\(\\w*|\\)\/",
        "ignoreUrls": true,
        "ignoreRegExpLiterals": true,
        "ignoreTemplateLiterals": true
      }
    ],
    "require-jsdoc": [
      "warn",
      {
      "require": {
        "FunctionDeclaration": true,
        "MethodDefinition": true,
        "ClassDeclaration": true,
        "ArrowFunctionExpression": true,
        "FunctionExpression": true
      }
    }],
    "valid-jsdoc": [
      "warn",
      {
        "prefer": {
          "return": "returns"
        },
        "requireReturn": false
      }
    ],
    "no-undef": "warn",
    "no-unused-vars": "warn",
    "import/no-dynamic-require": "warn",
    "global-require": "warn",
    "no-plusplus": "warn",
    "default-case": "warn",
    "no-param-reassign": "warn",
    "no-restricted-syntax": "warn",
    "no-underscore-dangle": "warn",
    "no-shadow": "warn",
    "no-var": "warn",
    "no-redeclare": "warn",
    "guard-for-in": "warn",
    "no-use-before-define": "warn",
    "vars-on-top": "warn",
    "prefer-rest-params": "warn",
    "prefer-destructuring": "warn",
    "no-prototype-builtins": "warn",
    "valid-typeof": "warn",
    "no-multi-assign": "warn",
    "no-unused-expressions": "warn",
    "no-void": "warn",
    "prefer-const": "warn",
    "no-bitwise": "warn",
    "no-continue": "warn",
    "no-restricted-properties": "warn",
    "radix": "warn",
    "no-extend-native": "warn",
    "no-restricted-globals": "warn",
    "no-nested-ternary": "warn",
    "no-return-assign": "warn",
    "no-cond-assign": "warn",
    "block-scoped-var": "warn",
    "no-mixed-operators": "warn",
    "consistent-return": "warn",
    "prefer-spread": "warn",
  },
};

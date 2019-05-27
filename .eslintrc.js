module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: 'airbnb-base',
  globals: {
    expect: 0,
    OO: 0,
    it: 0,
    describe: 0,
    SRC_ROOT: 0,
    beforeEach: 0,
    afterEach: 0,
    jest: 0,
    COMMON_SRC_ROOT: 0,
    TEST_ROOT: 0,
    ADB: 0,
    MockGa: 0,
    resetMockGa: 0,
    Conviva: 0,
    jsdom: 0,
    AppMeasurement: 0,
    Visitor: 0,
    Ooyala: 0,
    _: 0,
    recordedEvent: 0,
    _gaq: 0,
    ooyalaGaTrackSettings: 0,
    ga: 0,
    listFiles: 0,
    resetGlobalInstances: 0,
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
    "no-param-reassign": [
      "warn",
      {
        "props": false
      }
    ],
    "no-plusplus": [
      "error",
      {
        "allowForLoopAfterthoughts": true
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
    "no-unused-vars": "warn",
    "import/no-dynamic-require": "warn",
    "global-require": "warn",
    "no-restricted-syntax": "warn",
    "no-underscore-dangle": "warn",
    "guard-for-in": "warn",
    "no-use-before-define": "warn",
    "prefer-rest-params": "warn",
    "prefer-destructuring": "warn",
    "no-prototype-builtins": "warn",
    "valid-typeof": "warn",
    "no-restricted-globals": "warn",
    "no-mixed-operators": "warn",
    "consistent-return": "warn",
    "prefer-spread": "warn",
    "no-shadow": "warn",
  },
};

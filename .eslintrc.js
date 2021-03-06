module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true
  },
  extends: 'airbnb-base',
  globals: {
    OO: 0,
    SRC_ROOT: 0,
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
    "no-plusplus": [
      "error",
      {
        "allowForLoopAfterthoughts": true
      }
    ],
    "no-param-reassign": [
      "error",
      {
        "props": false
      }
    ],
    "require-jsdoc": [
      "error",
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
      "error",
      {
        "prefer": {
          "return": "returns"
        },
        "requireReturn": false
      }
    ],
    "no-underscore-dangle": 0,
    "func-names": 0,
  },
};

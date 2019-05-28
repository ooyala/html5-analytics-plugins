/* eslint-disable require-jsdoc */
jest.dontMock('underscore');
jest.dontMock('jquery');

global.SRC_ROOT = '../../js/';
global.COMMON_SRC_ROOT = '../../html5-common/js/';
global.TEST_ROOT = '../../test/';
global.COMMON_TEST_ROOT = '../../html5-common/test/';
global.OO = {
  publicApi: {}, platform: 'MacIntel', os: {}, browser: { version: 1, webkit: true }, TEST_TEST_TEST: true,
};


// The function setTimeout from jsdom is not working, this overwrites the function with the function defined by node
global.window.setTimeout = setTimeout;
global.window.setInterval = setInterval;
global.window.clearInterval = clearInterval;
global.navigator = window.navigator;

// a wrapper domparser simulating Mozilla DOMParser in the browser:
window.DOMParser = function () {};
require.requireActual(`${COMMON_SRC_ROOT}utils/InitModules/InitOOUnderscore.js`);

OO._.extend(window.DOMParser.prototype, {
  parseFromString(data, type) {
    return jsdom.jsdom(data, jsdom.level(3, 'core'));
  },
});

OO.log = console.log;

// In a browser environment, all of the properties of "window" (like navigator) are in the global scope:
OO._.extend(global, window);

require.requireActual(`${COMMON_SRC_ROOT}utils/InitModules/InitOOHazmat.js`);
require.requireActual(`${COMMON_SRC_ROOT}utils/InitModules/InitOOPlayerParamsDefault.js`);

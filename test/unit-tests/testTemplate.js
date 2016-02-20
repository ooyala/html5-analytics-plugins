describe('Analytics Framework Template Unit Tests', function()
{
  jest.autoMockOff();
  //this file is the file that defines TEST_ROOT and SRC_ROOT
  require("../unit-test-helpers/test_env.js");
  require(SRC_ROOT + "framework/AnalyticsFramework.js");
//  require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  require(TEST_ROOT + "unit-test-helpers/AnalyticsFrameworkTestUtils.js");
  require(COMMON_SRC_ROOT + "utils/InitModules/InitOOUnderscore.js");

  var Analytics = OO.Analytics;
  var Utils = OO.Analytics.Utils;
  var _ = OO._;
  var framework;

  //setup for all tests
  var initialSetup = function()
  {
  };

  //cleanup after all tests
  var finalCleanup = function()
  {

  };

  //setup for individual tests
  var testSetup = function()
  {
    framework = new Analytics.Framework();
  };

  //cleanup for individual tests
  var testCleanup = function()
  {

  };

  initialSetup();
  beforeEach(testSetup);
  afterEach(testCleanup);

  it('Test Analytics Template Validity', function()
  {
    var templatePluginFactory = require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
    expect(templatePluginFactory).not.toBeNull();
    var plugin = new templatePluginFactory();
    expect(framework.validatePlugin(plugin)).toBe(true);
  });

  it('Test Registering Template', function()
  {
      var templatePlugin = require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
      var pluginID = framework.registerPlugin(templatePlugin);
      expect(pluginID).not.toBeFalsy();
      expect(pluginID && _.isString(pluginID)).toBe(true);
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(1);
  });

  finalCleanup();

});

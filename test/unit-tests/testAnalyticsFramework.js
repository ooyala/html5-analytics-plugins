
describe('Analytics Framework Unit Tests', function()
{
  jest.autoMockOff();
  //this file is the file that defines TEST_ROOT and SRC_ROOT
  jest.dontMock("../unit-test-helpers/test_env.js");
  require("../unit-test-helpers/test_env.js");

  jest.dontMock(SRC_ROOT + "framework/AnalyticsFramework.js");
  require(SRC_ROOT + "framework/AnalyticsFramework.js");

  jest.dontMock(COMMON_TEST_ROOT + "unit-test-helpers/message_bus_helper.js");
  require(COMMON_TEST_ROOT + "unit-test-helpers/message_bus_helper.js");

  jest.dontMock(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
//  require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");

  jest.dontMock(TEST_ROOT + "unit-test-helpers/AnalyticsFrameworkTestUtils.js");
  require(TEST_ROOT + "unit-test-helpers/AnalyticsFrameworkTestUtils.js");

  var Analytics = OO.Analytics;
  var Utils = OO.Analytics.Utils;
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

  //////////////////////////////////////////////
  ///Plugin Validation Testing
  //////////////////////////////////////////////

  describe("Test Plugin Validator", function()
  {
    it('Test Undefined Factory', function()
    {
      var badPluginFactory;
      expect(framework.validatePluginFactory(badPluginFactory)).toBe(false);
    });

    it('Test Null Factory', function()
    {
      var nullPluginFactory = null;
      expect(framework.validatePluginFactory(nullPluginFactory)).toBe(false);
    });

    it('Test Object as Factory', function()
    {
      var emptyObjectPluginFactory = {};
      expect(framework.validatePluginFactory(emptyObjectPluginFactory)).toBe(false);
    });

    it('Test Factory Returning Null', function()
    {
      var badEmptyPluginFactory = function() {};
      expect(framework.validatePluginFactory(badEmptyPluginFactory)).toBe(false);
    });

    it('Test Factory Returns Plugin With Missing Required Function', function()
    {
      var i;
      for (i = 0; i < Analytics.REQUIRED_PLUGIN_FUNCTIONS.length; i++ )
      {
        var missingFunctionFactory = Utils.createMissingFunctionFactory(Analytics.REQUIRED_PLUGIN_FUNCTIONS[i]);
        expect(framework.validatePluginFactory(missingFunctionFactory)).toBe(false);
      }
    });

    it('Test Valid Factory', function()
    {
      var goodPluginFactory = Utils.createValidPluginFactory();
      expect(framework.validatePluginFactory(goodPluginFactory)).toBe(true);
    });

    it('Test Factory Returns Plugin With More Than Just Required Function', function()
    {
      var extraFunctionFactory = Utils.createExtraFunctionFactory("something");
      var extraFunctionFactory2 = Utils.createExtraFunctionFactory("somethingMore");
      expect(framework.validatePluginFactory(extraFunctionFactory)).toBe(true);
      expect(framework.validatePluginFactory(extraFunctionFactory2)).toBe(true);
    });

    it('Test Return Value Types For getName()', function()
    {
      var wrongReturnPluginFactory = Utils.createWrongNameReturnTypeFactory();
      expect(framework.validatePluginFactory(wrongReturnPluginFactory)).toBe(false);
    });

    it('Test Return Value Types For getVersion()', function()
    {
      var wrongReturnPluginFactory = Utils.createWrongVersionReturnTypeFactory();
      expect(framework.validatePluginFactory(wrongReturnPluginFactory)).toBe(false);
    });

  });

  //////////////////////////////////////////////
  ///Template Testing
  //////////////////////////////////////////////

  it('Test Analytics Template Validity', function()
  {
    var templatePlugin = require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
    expect(templatePlugin).not.toBeNull();
    var isValidPlugin = framework.validatePluginFactory(templatePlugin);
    expect(framework.validatePluginFactory(templatePlugin)).toBe(true);
  });

  //////////////////////////////////////////////
  ///Registration Testing
  //////////////////////////////////////////////
  describe('Test Registering Factory', function()
  {

    it('Test No Plugins Registered', function()
    {
      var pluginList = framework.getPluginList();
      expect(Array.isArray(pluginList)).toBe(true);
      expect(pluginList.length).toBe(0);
    });

    it('Test Registering Bad Plugins')
    {

    }

    it('Test Registering Template', function()
    {
        var templatePlugin = require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
        var pluginID = framework.registerPlugin(templatePlugin);
        expect(pluginID).not.toBeFalsy();
        expect(pluginID).not.toBeNull();
        var pluginList = framework.getPluginList();
      //  expect()
    });
  });

  finalCleanup();

});

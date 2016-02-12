
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

  //////////////////////////////////////////////
  ///Plugin Validation Testing
  //////////////////////////////////////////////

  describe("Test Plugin Validator", function()
  {
    it('Test Undefined Plugin', function()
    {
      var badPlugin;
      expect(framework.validatePlugin(badPlugin)).toBe(false);
    });

    it('Test Null Plugin', function()
    {
      var nullPlugin = null;
      expect(framework.validatePlugin(nullPlugin)).toBe(false);
    });

    it('Test Empty Plugin', function()
    {
      var emptyObjectPlugin = {};
      expect(framework.validatePlugin(emptyObjectPlugin)).toBe(false);
    });

    it('Test String As Plugin', function()
    {
      var stringPlugin = "test";
      expect(framework.validatePlugin(stringPlugin)).toBe(false);
    });

    it('Test Factory Returns Plugin With Missing Required Function', function()
    {
      var i;
      for (i = 0; i < Analytics.REQUIRED_PLUGIN_FUNCTIONS.length; i++ )
      {
        var missingFunctionFactory = Utils.createMissingFunctionFactory(Analytics.REQUIRED_PLUGIN_FUNCTIONS[i]);
        var plugin = new missingFunctionFactory();
        expect(framework.validatePlugin(plugin)).toBe(false);
      }
    });

    it('Test Valid Factory', function()
    {
      var goodPluginFactory = Utils.createValidPluginFactory();
      var plugin = new goodPluginFactory();
      expect(framework.validatePlugin(plugin)).toBe(true);
    });

    it('Test Factory Returns Plugin With More Than Just Required Function', function()
    {
      var extraFunctionFactory = Utils.createExtraFunctionFactory("something");
      var plugin = new extraFunctionFactory();
      expect(framework.validatePlugin(plugin)).toBe(true);

      var extraFunctionFactory2 = Utils.createExtraFunctionFactory("somethingMore");
      var plugin2 = new extraFunctionFactory2();
      expect(framework.validatePlugin(plugin2)).toBe(true);

      //add a second extra function to the first plugin, as a sanity check.
      plugin["anotherExtraFunction"] = function() {};
      expect(framework.validatePlugin(plugin)).toBe(true);
    });

    it('Test Bad Return Value Types For getName()', function()
    {
      var wrongReturnPluginFactory = Utils.createWrongNameReturnTypeFactory();
      var plugin = new wrongReturnPluginFactory();
      expect(framework.validatePlugin(plugin)).toBe(false);
    });

    it('Test Bad Return Value Types For getVersion()', function()
    {
      var wrongReturnPluginFactory = Utils.createWrongVersionReturnTypeFactory();
      var plugin = new wrongReturnPluginFactory();
      expect(framework.validatePlugin(plugin)).toBe(false);
    });

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

    it('Test Registering Undefined Factory', function()
    {
      var badPluginFactory;
      expect(framework.registerPlugin(badPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);
    });

    it('Test Registering Null Factory', function()
    {
      var nullPluginFactory = null;
      expect(framework.registerPlugin(nullPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);
    });

    it('Test Registering Empty Object as Factory', function()
    {
      var emptyObjectPluginFactory = {};
      expect(framework.registerPlugin(emptyObjectPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);
    });

    it('Test Registering Factory Returning Empty Object', function()
    {
      var badEmptyPluginFactory = function() {};
      expect(framework.registerPlugin(badEmptyPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);
    });

    it('Test Registering Factory With Missing Required Function', function()
    {
      var i;
      for (i = 4; i < Analytics.REQUIRED_PLUGIN_FUNCTIONS.length; i++ )
      {
        var missingFunctionFactory = Utils.createMissingFunctionFactory(Analytics.REQUIRED_PLUGIN_FUNCTIONS[i]);
        expect(framework.registerPlugin(missingFunctionFactory)).toBeFalsy();
      }
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);
    });

    it('Test Registering Factory With Bad Return Value Types For getName()', function()
    {
      var wrongReturnPluginFactory = Utils.createWrongNameReturnTypeFactory();
      expect(framework.registerPlugin(wrongReturnPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);
    });

    it('Test Registering Factory With Bad Return Value Types For getVersion()', function()
    {
      var wrongReturnPluginFactory = Utils.createWrongVersionReturnTypeFactory();
      expect(framework.registerPlugin(wrongReturnPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);
    });

    it('Test Registering Good Factory', function()
    {
      var goodFactory = Utils.createValidPluginFactory();
      var pluginID = framework.registerPlugin(goodFactory);
      expect(pluginID).not.toBeFalsy();
      expect(typeof pluginID === 'string').toBe(true);
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(1);
    });

    it('Test Registering Same Good Factory Multiple Times', function()
    {
      var goodFactory = Utils.createValidPluginFactory();
      var pluginID1 = framework.registerPlugin(goodFactory);
      var pluginID2 = framework.registerPlugin(goodFactory);
      var pluginID3 = framework.registerPlugin(goodFactory);

      expect(pluginID1).not.toBeFalsy();
      expect(_.isString(pluginID1)).toBe(true);

      expect(pluginID2).not.toBeFalsy();
      expect(_.isString(pluginID2)).toBe(true);

      expect(pluginID3).not.toBeFalsy();
      expect(_.isString(pluginID3)).toBe(true);

      expect(_.isEqual(pluginID1, pluginID2)).not.toBe(true);
      expect(_.isEqual(pluginID2, pluginID3)).not.toBe(true);
      expect(_.isEqual(pluginID3, pluginID1)).not.toBe(true);

      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(3);

      expect(_.contains(pluginList, pluginID1)).toBe(true);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
      expect(_.contains(pluginList, pluginID3)).toBe(true);
    });
  });

  //////////////////////////////////////////////
  ///Template Testing
  //////////////////////////////////////////////

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
      expect(typeof pluginID === 'string').toBe(true);
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(1);
  });

  finalCleanup();

});

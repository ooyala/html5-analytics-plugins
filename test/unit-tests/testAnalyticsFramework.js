
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
      for (i = 0; i < Analytics.REQUIRED_PLUGIN_FUNCTIONS.length; i++ )
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

    it('Test Registering Multiple Good Factories With The Same Name', function()
    {
      var goodFactory1 = Utils.createValidPluginFactory();
      var goodFactory2 = Utils.createValidPluginFactory();

      var pluginID1 = framework.registerPlugin(goodFactory1);
      var pluginID2 = framework.registerPlugin(goodFactory2);

      expect(pluginID1).not.toBeFalsy();
      expect(_.isString(pluginID1)).toBe(true);

      expect(pluginID2).not.toBeFalsy();
      expect(_.isString(pluginID2)).toBe(true);


      expect(_.isEqual(pluginID1, pluginID2)).not.toBe(true);

      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(2);

      expect(_.contains(pluginList, pluginID1)).toBe(true);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
    });

    it('Test Registering Multiple Good Factories', function()
    {
      var goodFactory1 = Utils.createValidPluginFactory("test1");
      var goodFactory2 = Utils.createValidPluginFactory("test2");

      var pluginID1 = framework.registerPlugin(goodFactory1);
      var pluginID2 = framework.registerPlugin(goodFactory2);

      expect(pluginID1).not.toBeFalsy();
      expect(_.isString(pluginID1)).toBe(true);

      expect(pluginID2).not.toBeFalsy();
      expect(_.isString(pluginID2)).toBe(true);


      expect(_.isEqual(pluginID1, pluginID2)).not.toBe(true);

      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(2);

      expect(_.contains(pluginList, pluginID1)).toBe(true);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
    });

    it('Test Unregistering Factories', function()
    {
      var goodFactory1 = Utils.createValidPluginFactory("test1");
      var goodFactory2 = Utils.createValidPluginFactory("test2");

      var pluginID1 = framework.registerPlugin(goodFactory1);
      var pluginID2 = framework.registerPlugin(goodFactory2);
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(2);

      //test removing plugin1
      expect(framework.unregisterPlugin(pluginID1)).toBe(true);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(1);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      //test removing plugin2
      expect(framework.unregisterPlugin(pluginID2)).toBe(true);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(false);

      //test removing plugin2 even though list is empty.
      expect(framework.unregisterPlugin(pluginID2)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(false);
    });

    it('Test Unregistering Factory Without Registering First', function()
    {
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);

      //test removing plugin1
      expect(framework.unregisterPlugin("badID")).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);
    });

    it('Test Unregistering Factory Not using string', function()
    {
      var test;
      expect(framework.unregisterPlugin(test)).toBe(false);
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);

      test = {};
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);

      test = {test:"testdata"};
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);

      test = [];
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);

      test = [1,2,3];
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);

      test = 1;
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(0);
    });

    it('Test Reregistering An Unregistered Factory', function()
    {
      var goodFactory1 = Utils.createValidPluginFactory("test1");
      var goodFactory2 = Utils.createValidPluginFactory("test2");
      var pluginID1 = framework.registerPlugin(goodFactory1);
      var pluginID2 = framework.registerPlugin(goodFactory2);

      expect(framework.unregisterPlugin(pluginID1)).toBe(true);

      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(1);
      var pluginID3 = framework.registerPlugin(goodFactory1);
      expect(_.isEqual(pluginID1, pluginID3)).not.toBe(true);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(2);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
      expect(_.contains(pluginList, pluginID3)).toBe(true);
    });


    it('Test Registering and Unregistering Factories Mixed Test Cases', function()
    {
      var goodFactory1 = Utils.createValidPluginFactory("test1");
      var goodFactory2 = Utils.createValidPluginFactory("test2");

      var pluginID1 = framework.registerPlugin(goodFactory1);
      var pluginID2 = framework.registerPlugin(goodFactory2);
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(2);

      var badID = "badID";

      expect(framework.unregisterPlugin(badID)).toBe(false);
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(2);
      expect(_.contains(pluginList, pluginID1)).toBe(true);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      badID = {};
      expect(framework.unregisterPlugin(badID)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(2);
      expect(_.contains(pluginList, pluginID1)).toBe(true);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      expect(framework.unregisterPlugin(pluginID1)).toBe(true);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(1);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      var pluginID3 = framework.registerPlugin(goodFactory1);
      var pluginID4 = framework.registerPlugin(goodFactory1);
      var pluginID5 = framework.registerPlugin(goodFactory1);

      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(4);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
      expect(_.contains(pluginList, pluginID3)).toBe(true);
      expect(_.contains(pluginList, pluginID4)).toBe(true);
      expect(_.contains(pluginList, pluginID5)).toBe(true);

      expect(framework.unregisterPlugin(pluginID4)).toBe(true);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toBe(3);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
      expect(_.contains(pluginList, pluginID3)).toBe(true);
      expect(_.contains(pluginList, pluginID4)).toBe(false);
      expect(_.contains(pluginList, pluginID5)).toBe(true);
    });

    it('Test Registering Lots Of Plugins (should stop at some point)', function()
    {
      //There is an arbitrary limit here to test that we stop registering plugins after a while.
      var upperLimit = 1000;
      var goodFactory1 = Utils.createValidPluginFactory("test1");

      var errorHit = false;
      try
      {
        for(var i = 0; i < upperLimit; i++)
        {
          framework.registerPlugin(goodFactory1);
        }
      }
      catch (e)
      {
        errorHit = true;
      }

      expect(errorHit).toBe(true);
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

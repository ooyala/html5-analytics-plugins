
describe('Analytics Framework Unit Tests', function()
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
  describe('Test Factory Registration', function()
  {

    it('Test No Plugins Registered', function()
    {
      var pluginList = framework.getPluginList();
      expect(Array.isArray(pluginList)).toBe(true);
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Undefined Factory', function()
    {
      var badPluginFactory;
      expect(framework.registerPlugin(badPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Null Factory', function()
    {
      var nullPluginFactory = null;
      expect(framework.registerPlugin(nullPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Empty Object as Factory', function()
    {
      var emptyObjectPluginFactory = {};
      expect(framework.registerPlugin(emptyObjectPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Factory Returning Empty Object', function()
    {
      var badEmptyPluginFactory = function() {};
      expect(framework.registerPlugin(badEmptyPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);
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
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Factory With Bad Return Value Types For getName()', function()
    {
      var wrongReturnPluginFactory = Utils.createWrongNameReturnTypeFactory();
      expect(framework.registerPlugin(wrongReturnPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Factory With Bad Return Value Types For getVersion()', function()
    {
      var wrongReturnPluginFactory = Utils.createWrongVersionReturnTypeFactory();
      expect(framework.registerPlugin(wrongReturnPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Good Factory', function()
    {
      var goodFactory = Utils.createValidPluginFactory();
      var pluginID = framework.registerPlugin(goodFactory);
      expect(pluginID).not.toBeFalsy();
      expect(typeof pluginID === 'string').toBe(true);
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(1);
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
      expect(pluginList.length).toEqual(3);

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
      expect(pluginList.length).toEqual(2);

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
      expect(pluginList.length).toEqual(2);

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
      expect(pluginList.length).toEqual(2);

      //test removing plugin1
      expect(framework.unregisterPlugin(pluginID1)).toBe(true);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(1);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      //test removing plugin2
      expect(framework.unregisterPlugin(pluginID2)).toBe(true);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(false);

      //test removing plugin2 even though list is empty.
      expect(framework.unregisterPlugin(pluginID2)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(false);
    });

    it('Test Unregistering Factory Without Registering First', function()
    {
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);

      //test removing plugin1
      expect(framework.unregisterPlugin("badID")).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Unregistering Factory Not using string', function()
    {
      var test;
      expect(framework.unregisterPlugin(test)).toBe(false);
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);

      test = {};
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);

      test = {test:"testdata"};
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);

      test = [];
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);

      test = [1,2,3];
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);

      test = 1;
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Reregistering An Unregistered Factory', function()
    {
      var goodFactory1 = Utils.createValidPluginFactory("test1");
      var goodFactory2 = Utils.createValidPluginFactory("test2");
      var pluginID1 = framework.registerPlugin(goodFactory1);
      var pluginID2 = framework.registerPlugin(goodFactory2);

      expect(framework.unregisterPlugin(pluginID1)).toBe(true);

      var pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(1);
      var pluginID3 = framework.registerPlugin(goodFactory1);
      expect(_.isEqual(pluginID1, pluginID3)).not.toBe(true);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(2);
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
      expect(pluginList.length).toEqual(2);

      var badID = "badID";

      expect(framework.unregisterPlugin(badID)).toBe(false);
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(2);
      expect(_.contains(pluginList, pluginID1)).toBe(true);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      badID = {};
      expect(framework.unregisterPlugin(badID)).toBe(false);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(2);
      expect(_.contains(pluginList, pluginID1)).toBe(true);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      expect(framework.unregisterPlugin(pluginID1)).toBe(true);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(1);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      var pluginID3 = framework.registerPlugin(goodFactory1);
      var pluginID4 = framework.registerPlugin(goodFactory1);
      var pluginID5 = framework.registerPlugin(goodFactory1);

      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(4);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
      expect(_.contains(pluginList, pluginID3)).toBe(true);
      expect(_.contains(pluginList, pluginID4)).toBe(true);
      expect(_.contains(pluginList, pluginID5)).toBe(true);

      expect(framework.unregisterPlugin(pluginID4)).toBe(true);
      pluginList = framework.getPluginList();
      expect(pluginList.length).toEqual(3);
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
      //make sure it doesn't throw an error.
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

      expect(errorHit).toBe(false);
      var pluginList = framework.getPluginList();
      expect(pluginList.length).toBeGreaterThan(0);
      expect(pluginList.length).toBeLessThan(upperLimit);
    });

  });

  describe('Test Message Recording', function()
  {
    it('Test Recorded Messages On Start', function()
    {
      var recordedEvents = framework.getRecordedEvents();
      expect(_.isArray(recordedEvents)).toBe(true);
      expect(recordedEvents.length).toEqual(0);
    });

    //helper function for testing bad messages
    var testBadMessages = function(framework)
    {
      var test;
      var errorOccured = false;
      try
      {
        expect(framework.publishMessage(test)).toBe(false);
        expect(framework.publishMessage({})).toBe(false);
        expect(framework.publishMessage([])).toBe(false);
        expect(framework.publishMessage("")).toBe(false);
        expect(framework.publishMessage(null)).toBe(false);
        expect(framework.publishMessage(5)).toBe(false);
        expect(framework.publishMessage("unitTestBadMessage")).toBe(false);
      }
      catch(e)
      {
        errorOccured = true;
      }

      expect(errorOccured).toBe(false);
      var recordedEvents = framework.getRecordedEvents();
      expect(recordedEvents.length).toEqual(0);
    }

    var testGoodMessages = function(framework)
    {
      var recordedEvents = framework.getRecordedEvents();
      expect(recordedEvents.length).toEqual(0);

      var numMsgSent = 0;
      var msgName;
      var events = OO.Analytics.EVENTS;
      for(msgName in events)
      {
        expect(framework.publishMessage(msgName)).toBe(true);
        numMsgSent++;
        recordedEvents = framework.getRecordedEvents();
        expect(_.isArray(recordedEvents)).toBe(true);
        var length = recordedEvents.length;
        expect(length).toEqual(numMsgSent);
        var lastMsg = recordedEvents[length-1];
        expect(lastMsg.msgName).toEqual(msgName);
      }
    }

    var testGoodMessagesBadParams = function(framework)
    {
      var recordedEvents = framework.getRecordedEvents();
      expect(recordedEvents.length).toEqual(0);

      var msgSentObj = {count:0};
      var params;
      badParamsHelper(framework, params, msgSentObj);
      params = {};
      badParamsHelper(framework, params, msgSentObj);
      params = 5;
      badParamsHelper(framework, params, msgSentObj);
      params = "notAnArray";
      badParamsHelper(framework, params, msgSentObj);

      recordedEvents = framework.getRecordedEvents();
      expect(recordedEvents.length).toEqual(msgSentObj.count);
    }

    var badParamsHelper = function(framework, params, msgSentObj)
    {
      var msgName;
      for(msgName in OO.Analytics.EVENTS)
      {
        expect(framework.publishMessage(msgName)).toBe(true);
        msgSentObj.count++;
        recordedEvents = framework.getRecordedEvents();
        expect(_.isArray(recordedEvents)).toBe(true);
        var length = recordedEvents.length;
        expect(length).toEqual(msgSentObj.count);
        var lastMsg = recordedEvents[length-1];
        expect(lastMsg.msgName).toEqual(msgName);
      }
    };

    describe('Test Recording With No Plugins Registered', function()
    {
      it('Test Sending Invalid Messages', function()
      {
        testBadMessages(framework);
      });

      it('Test Sending Valid Messages', function()
      {
        testGoodMessages(framework);
      });

      it('Test Sending Valid Messages With Bad Params', function()
      {
        testGoodMessagesBadParams(framework);
      });
    });

    describe('Test Recording With Plugin Registered', function()
    {
      //setup for individual tests
      var testSetup = function()
      {
        var plugin = Utils.createValidPluginFactory();
        framework.registerPlugin(plugin);
      };

      beforeEach(testSetup);

      it('Test Sending Invalid Messages', function()
      {
        expect(framework.getPluginList().length).toEqual(1);
        testBadMessages(framework);
      });

      it('Test Sending Valid Messages', function()
      {
        expect(framework.getPluginList().length).toEqual(1);
        testGoodMessages(framework);
      });

      it('Test Sending Valid Messages With Bad Params', function()
      {
        expect(framework.getPluginList().length).toEqual(1);
        testGoodMessagesBadParams(framework);
      });
    });

  });

  describe('Test Plugin Initialization', function()
  {
    var testFactory;
    //setup for individual tests
    var testSetup = function()
    {

    };

    //cleanup for individual tests
    var testCleanup = function()
    {
      //Test factories
      if(OO.Analytics.Framework.TEST)
      {
        OO.Analytics.Framework.TEST = null;
      }
    };

    beforeEach(testSetup);
    afterEach(testCleanup);

    var testSinglePluginWithMetadata = function(metadata, isGoodMetadata)
    {
      var factory = Utils.createFactoryWithGlobalAccessToPluginInstance();
      expect(framework.setPluginMetadata(metadata)).toBe(isGoodMetadata);
      var pluginID = framework.registerPlugin(factory);

      expect(OO.Analytics.Framework.TEST.length).toEqual(1);
      var plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.getPluginID()).toEqual(pluginID);
    };

    it("Test Plugin Init with Undefined Metadata", function()
    {
      var metadata;
      testSinglePluginWithMetadata(metadata, false);

      var plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it("Test Plugin Init with Null Metadata", function()
    {
      var metadata = null;
      testSinglePluginWithMetadata(metadata, false);

      var plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it("Test Plugin Init with Empty String Metadata", function()
    {
      var metadata = "";
      testSinglePluginWithMetadata(metadata, false);

      var plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it("Test Plugin Init with String Metadata", function()
    {
      var metadata = "badMetadata";
      testSinglePluginWithMetadata(metadata, false);

      var plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it("Test Plugin Init with Empty Metadata", function()
    {
      var metadata = {};
      testSinglePluginWithMetadata(metadata, true);

      var plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it("Test Plugin Init with Array As Metadata", function()
    {
      var metadata = [];
      testSinglePluginWithMetadata(metadata, true);

      var plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it("Test Plugin Init with Metadata For Other Plugins", function()
    {
      var metadata = {};
      metadata.otherPlugin = {test1:1, test2:2};
      testSinglePluginWithMetadata(metadata, true);

      var plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it("Test Setting Framework Metadata Just For This Plugin", function()
    {
      var metadata = {};
      metadata.testName = {test1:1, test2:2};
      testSinglePluginWithMetadata(metadata, true);

      var plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeDefined();
      expect(plugin.metadata).toEqual(metadata.testName);
    });

    it("Test Setting Framework Metadata With Data For Multiple Plugins", function()
    {
      var metadata = {};
      metadata.testName = {test1:1, test2:2};
      metadata.otherTest = {test3:3, test4:4};
      testSinglePluginWithMetadata(metadata, true);

      var plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeDefined();
      expect(plugin.metadata).toEqual(metadata.testName);
    });
  });

  describe('Test Plugin Message Receiving', function()
  {
    it("Test Plugin Recieves Messages When Active", function()
    {

    });

    it("Test Plugin Doesn't Recieve Messages When Inactive", function()
    {

    });
  });

  finalCleanup();

});


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
  var EVENTS = OO.Analytics.EVENTS;
  var Utils = OO.Analytics.Utils;
  var _ = OO._;
  var framework;
  OO.DEBUG = true;
  //setup for individual tests
  var testSetup = function()
  {
    //mute the logging because there will be lots of error messages that are appearing for valid reasons.
    OO.log = function(){};
    framework = new Analytics.Framework();
  };

  //cleanup for individual tests
  var testCleanup = function()
  {
    OO.Analytics.PluginFactoryList = [];
    OO.Analytics.FrameworkInstanceList = [];
    OO.Analytics.Framework.TEST = undefined;
    //return log back to normal
    OO.log = console.log;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  describe('Test Factory Registration and Unregistration', function()
  {
    it('Test Unregistering Bad Framework', function()
    {
      var errorOccured = false;
      try
      {
        OO.Analytics.UnregisterFrameworkInstance(undefined);
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
        OO.Analytics.UnregisterFrameworkInstance(null);
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
        OO.Analytics.UnregisterFrameworkInstance("");
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
        OO.Analytics.UnregisterFrameworkInstance({});
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
        OO.Analytics.UnregisterFrameworkInstance([]);
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
      }
      catch(e)
      {
        errorOccured = true;
      }

      expect(errorOccured).toBe(false);
    });

    it('Test Unregistering Valid Framework', function()
    {
      var framework2 = new Analytics.Framework();
      expect(OO.Analytics.FrameworkInstanceList.length).toEqual(2);
      OO.Analytics.UnregisterFrameworkInstance(framework);
      expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
      OO.Analytics.UnregisterFrameworkInstance(framework2);
      expect(OO.Analytics.FrameworkInstanceList.length).toEqual(0);
    });
  });

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
      var pluginList = framework.getPluginIDList();
      expect(Array.isArray(pluginList)).toBe(true);
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Undefined Factory', function()
    {
      var badPluginFactory;
      expect(framework.registerPlugin(badPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Null Factory', function()
    {
      var nullPluginFactory = null;
      expect(framework.registerPlugin(nullPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Empty Object as Factory', function()
    {
      var emptyObjectPluginFactory = {};
      expect(framework.registerPlugin(emptyObjectPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Factory Returning Empty Object', function()
    {
      var badEmptyPluginFactory = function() {};
      expect(framework.registerPlugin(badEmptyPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginIDList();
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
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Factory With Bad Return Value Types For getName()', function()
    {
      var wrongReturnPluginFactory = Utils.createWrongNameReturnTypeFactory();
      expect(framework.registerPlugin(wrongReturnPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Factory With Bad Return Value Types For getVersion()', function()
    {
      var wrongReturnPluginFactory = Utils.createWrongVersionReturnTypeFactory();
      expect(framework.registerPlugin(wrongReturnPluginFactory)).toBeFalsy();
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Good Factory', function()
    {
      var goodFactory = Utils.createValidPluginFactory();
      var pluginID = framework.registerPlugin(goodFactory);
      expect(pluginID).not.toBeFalsy();
      expect(typeof pluginID === 'string').toBe(true);
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(1);
    });

    it('Test Factory Receives Framework Instance as param', function()
    {
      var goodFactory = Utils.createFactoryToTestConstructorParams();
      var pluginID = framework.registerPlugin(goodFactory);
      expect(OO.Analytics.Framework.TEST.frameworkParam).not.toBeNull();
      expect(OO.Analytics.Framework.TEST.frameworkParam.getRecordedEvents()).toEqual([]);
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

      var pluginList = framework.getPluginIDList();
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

      var pluginList = framework.getPluginIDList();
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

      var pluginList = framework.getPluginIDList();
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
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(2);

      //test removing plugin1
      expect(framework.unregisterPlugin(pluginID1)).toBe(true);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(1);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      //test removing plugin2
      expect(framework.unregisterPlugin(pluginID2)).toBe(true);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(false);

      //test removing plugin2 even though list is empty.
      expect(framework.unregisterPlugin(pluginID2)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(false);
    });

    it('Test Unregistering Factory Without Registering First', function()
    {
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);

      //test removing plugin1
      expect(framework.unregisterPlugin("badID")).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Unregistering Factory Not using string', function()
    {
      var test;
      expect(framework.unregisterPlugin(test)).toBe(false);
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);

      test = {};
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);

      test = {test:"testdata"};
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);

      test = [];
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);

      test = [1,2,3];
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);

      test = 1;
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Reregistering An Unregistered Factory', function()
    {
      var goodFactory1 = Utils.createValidPluginFactory("test1");
      var goodFactory2 = Utils.createValidPluginFactory("test2");
      var pluginID1 = framework.registerPlugin(goodFactory1);
      var pluginID2 = framework.registerPlugin(goodFactory2);

      expect(framework.unregisterPlugin(pluginID1)).toBe(true);

      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(1);
      var pluginID3 = framework.registerPlugin(goodFactory1);
      expect(_.isEqual(pluginID1, pluginID3)).not.toBe(true);
      pluginList = framework.getPluginIDList();
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
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(2);

      var badID = "badID";

      expect(framework.unregisterPlugin(badID)).toBe(false);
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(2);
      expect(_.contains(pluginList, pluginID1)).toBe(true);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      badID = {};
      expect(framework.unregisterPlugin(badID)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(2);
      expect(_.contains(pluginList, pluginID1)).toBe(true);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      expect(framework.unregisterPlugin(pluginID1)).toBe(true);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(1);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      var pluginID3 = framework.registerPlugin(goodFactory1);
      var pluginID4 = framework.registerPlugin(goodFactory1);
      var pluginID5 = framework.registerPlugin(goodFactory1);

      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(4);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
      expect(_.contains(pluginList, pluginID3)).toBe(true);
      expect(_.contains(pluginList, pluginID4)).toBe(true);
      expect(_.contains(pluginList, pluginID5)).toBe(true);

      expect(framework.unregisterPlugin(pluginID4)).toBe(true);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(3);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
      expect(_.contains(pluginList, pluginID3)).toBe(true);
      expect(_.contains(pluginList, pluginID4)).toBe(false);
      expect(_.contains(pluginList, pluginID5)).toBe(true);
    });

    it('Test Registering Lots Of Plugins', function()
    {
      //Test that the framework will not crash when registering lots of plugins.
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
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(1000);
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
        expect(framework.publishEvent(test)).toBe(false);
        expect(framework.publishEvent({})).toBe(false);
        expect(framework.publishEvent([])).toBe(false);
        expect(framework.publishEvent("")).toBe(false);
        expect(framework.publishEvent(null)).toBe(false);
        expect(framework.publishEvent(5)).toBe(false);
        expect(framework.publishEvent("unitTestBadMessage")).toBe(false);
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
        expect(framework.publishEvent(OO.Analytics.EVENTS[msgName])).toBe(true);
        numMsgSent++;
        recordedEvents = framework.getRecordedEvents();
        expect(_.isArray(recordedEvents)).toBe(true);
        var length = recordedEvents.length;
        expect(length).toEqual(numMsgSent);
        var lastMsg = recordedEvents[length-1];
        expect(lastMsg.eventName).toEqual(OO.Analytics.EVENTS[msgName]);
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
        expect(framework.publishEvent(OO.Analytics.EVENTS[msgName])).toBe(true);
        msgSentObj.count++;
        recordedEvents = framework.getRecordedEvents();
        expect(_.isArray(recordedEvents)).toBe(true);
        var length = recordedEvents.length;
        expect(length).toEqual(msgSentObj.count);
        var lastMsg = recordedEvents[length-1];
        expect(lastMsg.eventName).toEqual(OO.Analytics.EVENTS[msgName]);
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
        expect(framework.getPluginIDList().length).toEqual(1);
        testBadMessages(framework);
      });

      it('Test Sending Valid Messages', function()
      {
        expect(framework.getPluginIDList().length).toEqual(1);
        testGoodMessages(framework);
      });

      it('Test Sending Valid Messages With Bad Params', function()
      {
        expect(framework.getPluginIDList().length).toEqual(1);
        testGoodMessagesBadParams(framework);
      });
    });

    it('Test Max Messages Recorded', function()
    {
      for(var i = 0; i < 550; i++)
      {
        framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED);
      }

      var recordedEvents = framework.getRecordedEvents();
      expect(recordedEvents.length).toBeLessThan(550);
    });
  });

  describe('Test Plugin Initialization', function()
  {
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

    it("Test Plugin Receives Messages When Active", function()
    {
      var factory = Utils.createFactoryWithGlobalAccessToPluginInstance();
      var pluginID = framework.registerPlugin(factory);
      var plugin = OO.Analytics.Framework.TEST[0];
      var msg1 = EVENTS.INITIAL_PLAYBACK_REQUESTED;
      var msg2 = EVENTS.VIDEO_PLAY_REQUESTED;

      expect(framework.publishEvent(msg1)).toBe(true);
      expect(plugin.msgReceivedList.length).toEqual(1);
      expect(plugin.msgReceivedList[0]).toEqual(msg1);

      expect(framework.publishEvent(msg1)).toBe(true);
      expect(plugin.msgReceivedList.length).toEqual(2);
      expect(plugin.msgReceivedList[1]).toEqual(msg1);

      expect(framework.publishEvent(msg2)).toBe(true);
      expect(plugin.msgReceivedList.length).toEqual(3);
      expect(plugin.msgReceivedList[2]).toEqual(msg2);
    });

    it("Test Plugin Doesn't Receive Messages When Inactive", function()
    {
      var factory = Utils.createFactoryWithGlobalAccessToPluginInstance();
      var pluginID = framework.registerPlugin(factory);
      var plugin = OO.Analytics.Framework.TEST[0];
      var msg1 = EVENTS.INITIAL_PLAYBACK_REQUESTED;
      var msg2 = EVENTS.VIDEO_PLAY_REQUESTED;

      expect(framework.makePluginInactive(pluginID)).toBe(true);
      expect(framework.publishEvent(msg1)).toBe(true);
      expect(plugin.msgReceivedList.length).toEqual(0);

      expect(framework.publishEvent(msg1)).toBe(true);
      expect(plugin.msgReceivedList.length).toEqual(0);

      expect(framework.publishEvent(msg2)).toBe(true);
      expect(plugin.msgReceivedList.length).toEqual(0);

      expect(framework.publishEvent(msg2)).toBe(true);
      expect(plugin.msgReceivedList.length).toEqual(0);
    });

    it("Test Multiple Plugins Mixed Active and Inactive", function()
    {
      var factory = Utils.createFactoryWithGlobalAccessToPluginInstance();
      var pluginID1 = framework.registerPlugin(factory);
      var pluginID2 = framework.registerPlugin(factory);
      var plugin1 = OO.Analytics.Framework.TEST[0];
      var plugin2 = OO.Analytics.Framework.TEST[1];

      var msg1 = EVENTS.INITIAL_PLAYBACK_REQUESTED;
      var msg2 = EVENTS.VIDEO_PLAY_REQUESTED;

      //send first message successfully
      expect(framework.publishEvent(msg1)).toBe(true);
      expect(plugin1.msgReceivedList.length).toEqual(1);
      expect(plugin1.msgReceivedList[0]).toEqual(msg1);
      expect(plugin2.msgReceivedList.length).toEqual(1);
      expect(plugin2.msgReceivedList[0]).toEqual(msg1);

      //send second message successfully
      expect(framework.publishEvent(msg2)).toBe(true);
      expect(plugin1.msgReceivedList.length).toEqual(2);
      expect(plugin1.msgReceivedList[1]).toEqual(msg2);
      expect(plugin2.msgReceivedList.length).toEqual(2);
      expect(plugin2.msgReceivedList[1]).toEqual(msg2);

      //disable plugin1 and send message successfully
      framework.makePluginInactive(pluginID1);
      expect(framework.publishEvent(msg2)).toBe(true);
      expect(plugin1.msgReceivedList.length).toEqual(2);
      expect(plugin1.msgReceivedList[1]).toEqual(msg2);
      expect(plugin2.msgReceivedList.length).toEqual(3);
      expect(plugin2.msgReceivedList[2]).toEqual(msg2);

      //reenable plugin1 and send message again.
      framework.makePluginActive(pluginID1);
      expect(framework.publishEvent(msg2)).toBe(true);
      expect(plugin1.msgReceivedList.length).toEqual(3);
      expect(plugin1.msgReceivedList[2]).toEqual(msg2);
      expect(plugin2.msgReceivedList.length).toEqual(4);
      expect(plugin2.msgReceivedList[3]).toEqual(msg2);

    });

    it("Test Framework Handles Plugin That Throws Error On getName", function()
    {
      var factory = Utils.createFactoryThatThrowsErrorOn("getName");
      var errorOccured = false;
      var pluginID;
      try
      {
        pluginID = framework.registerPlugin(factory);
      }
      catch(e)
      {
        OO.log(e);
        errorOccured = true;
      }
      expect(errorOccured).toBe(false);
      expect(pluginID).toBeFalsy();
      expect(framework.getPluginIDList().length).toEqual(0);
    });

    it("Test Framework Handles Plugin That Throws Error On getVersion", function()
    {
      var factory = Utils.createFactoryThatThrowsErrorOn("getVersion");
      var errorOccured = false;
      var pluginID;
      try
      {
        pluginID = framework.registerPlugin(factory);
      }
      catch(e)
      {
        OO.log(e);
        errorOccured = true;
      }
      expect(errorOccured).toBe(false);
      expect(pluginID).toBeFalsy();
      expect(framework.getPluginIDList().length).toEqual(0);
    });

    it("Test Framework Handles Plugin That Throws Error On init", function()
    {
      var factory = Utils.createFactoryThatThrowsErrorOn("init");
      var errorOccured = false;
      var pluginID;
      try
      {
        pluginID = framework.registerPlugin(factory);
      }
      catch(e)
      {
        OO.log(e);
        errorOccured = true;
      }
      expect(errorOccured).toBe(false);
    });

    it("Test Framework Handles Plugin That Throws Error On setMetadata", function()
    {
      var factory = Utils.createFactoryThatThrowsErrorOn("setMetadata");
      var errorOccured = false;
      var pluginID;
      try
      {
        pluginID = framework.registerPlugin(factory);
        expect(framework.setPluginMetadata({}));
      }
      catch(e)
      {
        OO.log(e);
        errorOccured = true;
      }
      expect(errorOccured).toBe(false);
    });

    it("Test Framework Handles Plugin That Throws Error On setPluginID", function()
    {
      var factory = Utils.createFactoryThatThrowsErrorOn("setPluginID");
      var errorOccured = false;
      var pluginID;
      try
      {
        pluginID = framework.registerPlugin(factory);
      }
      catch(e)
      {
        OO.log(e);
        errorOccured = true;
      }
      //plugin should still be registered even if the function failed.
      expect(errorOccured).toBe(false);
      expect(framework.getPluginIDList().length).toEqual(1);
    });


    it("Test Framework Handles Plugin That Throws Error On processEvent", function()
    {
      var factory = Utils.createFactoryThatThrowsErrorOn("processEvent");
      var otherFactory  = Utils.createFactoryWithGlobalAccessToPluginInstance();
      var errorOccured = false;
      var pluginID1 = framework.registerPlugin(factory);
      expect(framework.getPluginIDList().length).toEqual(1);
      var pluginID2 = framework.registerPlugin(otherFactory);
      expect(framework.getPluginIDList().length).toEqual(2);
      try
      {
        expect(framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED)).toBe(true);
        expect(framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED)).toBe(true);
      }
      catch(e)
      {
        if (e)
        {
          OO.log(e);
        }
        errorOccured = true;
      }
      expect(framework.getRecordedEvents().length).toEqual(2);
      expect(OO.Analytics.Framework.TEST[0].msgReceivedList.length).toEqual(2);
      expect(errorOccured).toBe(false);
    });

    it("Test Framework Handles Plugin That Throws Error On destroy", function()
    {
      var factory = Utils.createFactoryThatThrowsErrorOn("destroy");
      var errorOccured = false;
      var pluginID;
      try
      {
        pluginID = framework.registerPlugin(factory);
        framework.unregisterPlugin(pluginID);
      }
      catch(e)
      {
        OO.log(e);
        errorOccured = true;
      }
      expect(errorOccured).toBe(false);
      expect(framework.getPluginIDList().length).toEqual(0);
    });
  });

  it('Test Framework Destroy', function()
  {
    var templatePluginFactory = require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
    var pluginList = framework.getPluginIDList();
    expect(pluginList.length).toEqual(1);
    expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
    expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
    framework.destroy();

    pluginList = framework.getPluginIDList();
    expect(pluginList.length).toEqual(0);
    expect(OO.Analytics.FrameworkInstanceList.length).toEqual(0);
    expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
  });

  it('Test Framework Destroy With Multi Frameworks', function()
  {
    var templatePluginFactory = require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
    var framework2 = new OO.Analytics.Framework();
    var pluginList = framework.getPluginIDList();
    var pluginList2 = framework2.getPluginIDList();

    expect(pluginList.length).toEqual(1);
    expect(pluginList2.length).toEqual(1);
    expect(OO.Analytics.FrameworkInstanceList.length).toEqual(2);
    expect(OO.Analytics.PluginFactoryList.length).toEqual(1);

    framework.destroy();

    pluginList = framework.getPluginIDList();
    pluginList2 = framework2.getPluginIDList();

    expect(pluginList.length).toEqual(0);
    expect(pluginList2.length).toEqual(1);
    expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
    expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
  });

  describe('Test Creation Of Message Data Objects', function()
  {

    it('Test VideoSourceData', function()
    {
      var metadata =
      {
        embedCode: "test1",
        metadata: {foo:"test2"}
      };

      var embedCode = "embedCodeTest";
      var data = new OO.Analytics.EVENT_DATA.VideoSourceData(embedCode, metadata);
      expect(data).toEqual({embedCode:embedCode,metadata:metadata});

      data = new OO.Analytics.EVENT_DATA.VideoSourceData(2,"test");
      expect(data).not.toEqual({embedCode:2,metadata:"test"});
      expect(data.embedCode).toEqual(undefined);
      expect(data.metadata).toEqual(undefined);
    });

    it('Test VideoContentMetadata', function()
    {
      var metadata =
      {
        title:"titleTest",
        description:"descTest",
        duration:2.3,
        closedCaptions: {foo:"test"},
        contentType: "contentTest",
        hostedAtURL: "urlTest"
      };

      var data = new OO.Analytics.EVENT_DATA.VideoContentMetadata(metadata.title,
                                                                  metadata.description,
                                                                  metadata.duration,
                                                                  metadata.closedCaptions,
                                                                  metadata.contentType,
                                                                  metadata.hostedAtURL);
      expect(data).toEqual(metadata);

      //check and see if numbers get parsed correctly.
      var temp = OO._.clone(metadata);
      temp.duration = "2.3";
      data = new OO.Analytics.EVENT_DATA.VideoContentMetadata(temp.title,
                                                              temp.description,
                                                              temp.duration,
                                                              temp.closedCaptions,
                                                              temp.contentType,
                                                              temp.hostedAtURL);
      expect(data).toEqual(metadata);

      temp.duration = "2";
      data = new OO.Analytics.EVENT_DATA.VideoContentMetadata(temp.title,
                                                              temp.description,
                                                              temp.duration,
                                                              temp.closedCaptions,
                                                              temp.contentType,
                                                              temp.hostedAtURL);
      expect(data.duration).toEqual(2);

      temp.duration = "asdf";
      data = new OO.Analytics.EVENT_DATA.VideoContentMetadata(temp.title,
                                                              temp.description,
                                                              temp.duration,
                                                              temp.closedCaptions,
                                                              temp.contentType,
                                                              temp.hostedAtURL);
      expect(data.duration).toBeUndefined();
    });

    it('Test VideoDownloadingMetadata', function()
    {
      var metadata =
      {
        currentTime:1,
        totalStreamDuration:2,
        streamBufferedUntilTime:2.3,
        seekableRangeStart: 4.4,
        seekableRangeEnd: 5.5
      };

      var data = new OO.Analytics.EVENT_DATA.VideoDownloadingMetadata(1, 2, 2.3, "4.4", "5.5");
      expect(data).toEqual(metadata);

      data = new OO.Analytics.EVENT_DATA.VideoDownloadingMetadata();
      expect(data).not.toEqual(metadata);
      expect(data.currentTime).toBeUndefined();
      expect(data.totalStreamDuration).toBeUndefined();
      expect(data.streamBufferedUntilTime).toBeUndefined();
      expect(data.seekableRangeStart).toBeUndefined();
      expect(data.seekableRangeEnd).toBeUndefined();
    });

    it('Test VideoBufferingStartedData', function()
    {
      var metadata =
      {
        streamUrl:"testUrl.com"
      };

      var data = new OO.Analytics.EVENT_DATA.VideoBufferingStartedData(metadata.streamUrl);
      expect(data).toEqual(metadata);
    });

    it('Test VideoBufferingEndedData', function()
    {
      var metadata =
      {
        streamUrl:"testUrl.com"
      };

      var data = new OO.Analytics.EVENT_DATA.VideoBufferingEndedData(metadata.streamUrl);
      expect(data).toEqual(metadata);
    });

    it('Test VideoSeekRequestedData', function()
    {
      var metadata =
      {
        seekingToTime:5.05
      };

      var data = new OO.Analytics.EVENT_DATA.VideoSeekRequestedData(metadata.seekingToTime);
      expect(data).toEqual(metadata);
    });

    it('Test VideoSeekCompletedData', function()
    {
      var metadata =
      {
        timeSeekedTo:5109293.9949
      };

      var data = new OO.Analytics.EVENT_DATA.VideoSeekCompletedData(metadata.timeSeekedTo);
      expect(data).toEqual(metadata);
    });

    it('Test VideoStreamPositionChangedData', function()
    {
      var metadata =
      {
        streamPosition:500,
        totalStreamDuration:1000,
      };

      var data = new OO.Analytics.EVENT_DATA.VideoStreamPositionChangedData(metadata.streamPosition,
                                                                            metadata.totalStreamDuration);
      expect(data).toEqual(metadata);
    });

    it('Test VideoStreamPositionChangedData with String Inputs', function()
    {
      var metadataIn =
      {
        streamPosition:"500",
        totalStreamDuration:"1000",
      };

      var metadataOut =
      {
        streamPosition:500,
        totalStreamDuration:1000,
      };

      var data = new OO.Analytics.EVENT_DATA.VideoStreamPositionChangedData(metadataIn.streamPosition,
                                                                            metadataIn.totalStreamDuration);
      expect(data).toEqual(metadataOut);
    });

    it('Test AdPodStartedData', function()
    {
      var metadataIn =
      {
        numberOfAds:3
      };

      var metadataOut =
      {
        numberOfAds:3
      };

      var data = new OO.Analytics.EVENT_DATA.AdPodStartedData(metadataIn.numberOfAds);
      expect(data).toEqual(metadataOut);

      metadataIn.numberOfAds = "3";
      data = new OO.Analytics.EVENT_DATA.AdPodStartedData(metadataIn.numberOfAds);
      expect(data).toEqual(metadataOut);

      metadataIn.numberOfAds = 0;
      metadataOut.numberOfAds = 0;
      data = new OO.Analytics.EVENT_DATA.AdPodStartedData(metadataIn.numberOfAds);
      expect(data).toEqual(metadataOut);

      metadataIn.numberOfAds = "2";
      metadataOut.numberOfAds = 2;
      data = new OO.Analytics.EVENT_DATA.AdPodStartedData(metadataIn.numberOfAds);
      expect(data).toEqual(metadataOut);

      metadataIn.numberOfAds = "asdf";
      data = new OO.Analytics.EVENT_DATA.AdPodStartedData(metadataIn.numberOfAds);
      expect(data.numberOfAds).toEqual(undefined);

      metadataIn.numberOfAds = true;
      data = new OO.Analytics.EVENT_DATA.AdPodStartedData(metadataIn.numberOfAds);
      expect(data.numberOfAds).toEqual(undefined);
    });

    it('Test AdPodEndedData', function()
    {
      var metadata =
      {
        adId:"adId"
      };

      var data = new OO.Analytics.EVENT_DATA.AdPodEndedData(metadata.adId);
      expect(data).toEqual(metadata);

      metadata = 1;
      data = new OO.Analytics.EVENT_DATA.AdPodEndedData(metadata.adId);
      expect(data.adId).toEqual(undefined);

      metadata = false;
      data = new OO.Analytics.EVENT_DATA.AdPodEndedData(metadata.adId);
      expect(data.adId).toEqual(undefined);

      metadata = {};
      data = new OO.Analytics.EVENT_DATA.AdPodEndedData(metadata.adId);
      expect(data.adId).toEqual(undefined);
    });

    it('Test FullscreenChangedData', function()
    {
      var metadataIn =
      {
        changingToFullscreen:true
      };
      var metadataOut =
      {
        changingToFullscreen:true
      };

      var data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataIn);

      metadataIn.changingToFullscreen = false;
      metadataOut.changingToFullscreen = false;
      data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataOut);

      metadataIn.changingToFullscreen = "true";
      metadataOut.changingToFullscreen = true;
      data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataOut);

      metadataIn.changingToFullscreen = "false";
      metadataOut.changingToFullscreen = false;
      data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataOut);

      metadataIn.changingToFullscreen = "banana";
      metadataOut.changingToFullscreen = undefined;
      data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataOut);

      metadataIn.changingToFullscreen = "";
      metadataOut.changingToFullscreen = undefined;
      data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataOut);

      metadataIn.changingToFullscreen = null;
      metadataOut.changingToFullscreen = undefined;
      data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataOut);

      metadataIn.changingToFullscreen = 1;
      metadataOut.changingToFullscreen = undefined;
      data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataOut);
    });

    it('Test VolumeChangedData', function()
    {
      var metadataIn =
      {
        currentVolume:100
      };

      var metadataOut =
      {
        currentVolume:100
      };

      var data = new OO.Analytics.EVENT_DATA.VolumeChangedData(metadataIn.currentVolume);
      expect(data).toEqual(metadataOut);

      metadataIn.currentVolume = 0;
      metadataOut.currentVolume = 0;
      data = new OO.Analytics.EVENT_DATA.VolumeChangedData(metadataIn.currentVolume);
      expect(data).toEqual(metadataOut);

      metadataIn.currentVolume = "100";
      metadataOut.currentVolume = 100;
      data = new OO.Analytics.EVENT_DATA.VolumeChangedData(metadataIn.currentVolume);
      expect(data).toEqual(metadataOut);

      metadataIn.currentVolume = "0";
      metadataOut.currentVolume = 0;
      data = new OO.Analytics.EVENT_DATA.VolumeChangedData(metadataIn.currentVolume);
      expect(data).toEqual(metadataOut);

      metadataIn.currentVolume = true;
      metadataOut.currentVolume = undefined;
      data = new OO.Analytics.EVENT_DATA.VolumeChangedData(metadataIn.currentVolume);
      expect(data).toEqual(metadataOut);
    });
  });
});

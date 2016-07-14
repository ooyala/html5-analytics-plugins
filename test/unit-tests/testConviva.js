describe('Analytics Framework Conviva Plugin Unit Tests', function() {
  jest.autoMockOff();
  //this file is the file that defines TEST_ROOT and SRC_ROOT
  require("../unit-test-helpers/test_env.js");
  require("../unit-test-helpers/mock_conviva.js");
  require(SRC_ROOT + "framework/AnalyticsFramework.js");
//  require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  require(TEST_ROOT + "unit-test-helpers/AnalyticsFrameworkTestUtils.js");
  require(COMMON_SRC_ROOT + "utils/InitModules/InitOOUnderscore.js");

  var Analytics = OO.Analytics;
  var Utils = OO.Analytics.Utils;
  var _ = OO._;
  var framework;

  var playerName = "Ooyala V4";

  //setup for individual tests
  var testSetup = function() {
    framework = new Analytics.Framework();
    //mute the logging becuase there will be lots of error messages
    OO.log = function() {
    };
  };

  //cleanup for individual tests
  var testCleanup = function() {
    OO.Analytics.PluginFactoryList = [];
    OO.Analytics.FrameworkInstanceList = [];
    Conviva.currentPlayerStateManager = null;
    //return log back to normal
//    OO.log = console.log;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  //helpers
  var createPlugin = function(framework, metadata) {
    var convivaPluginFactory = require(SRC_ROOT + "plugins/conviva.js");
    var plugin = new convivaPluginFactory(framework);
    plugin.init();
    plugin.setMetadata({
      "gatewayUrl":"testUrl",
      "customerKey":"testKey"
    });
    return plugin;
  };

  it('Test Conviva Plugin Validity', function() {
    var convivaPluginFactory = require(SRC_ROOT + "plugins/conviva.js");
    expect(convivaPluginFactory).not.toBeNull();
    var plugin = new convivaPluginFactory(framework);
    expect(framework.validatePlugin(plugin)).toBe(true);
  });

  it('Test Conviva Plugin Validity', function()
  {
    var convivaPluginFactory = require(SRC_ROOT + "plugins/conviva.js");
    var pluginID = framework.registerPlugin(convivaPluginFactory);
    expect(pluginID).toBeDefined();
    var pluginList = framework.getPluginIDList();
    expect(_.contains(pluginList, pluginID));
    expect(framework.makePluginInactive(pluginID)).toBe(true);
    expect(framework.makePluginActive(pluginID)).toBe(true);
  });

  it('Test Setting Metadata and Processing An Event', function()
  {
    var metadataReceived = null;
    var eventProcessed = null;
    var paramsReceived = null;
    var convivaPluginFactory = require(SRC_ROOT + "plugins/conviva.js");
    var newFactoryWithFunctionTracing = function()
    {
      var factory = new convivaPluginFactory();
      factory.setMetadata = function(metadata)
      {
        metadataReceived = metadata;
      };
      factory.processEvent = function(eventName, params)
      {
        eventProcessed = eventName;
        paramsReceived = params;
      };
      return factory;
    };
    framework.registerPlugin(newFactoryWithFunctionTracing);
    var metadata =
    {
      "conviva":
      {
        "data": "mydata"
      }
    };
    framework.setPluginMetadata(metadata);
    expect(metadataReceived).toEqual(metadata["conviva"]);
    framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PAUSED, [metadata]);
    expect(eventProcessed).toEqual(OO.Analytics.EVENTS.VIDEO_PAUSED);
    expect(paramsReceived).toEqual([metadata]);
  });

  it('Test Framework Destroy With Template', function()
  {
    var convivaPluginFactory = require(SRC_ROOT + "plugins/conviva.js");
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

  it('Test all functions', function()
  {
    var plugin = createPlugin(framework);
    var errorOccured = false;
    try
    {
      for (var key in plugin)
      {
        if(OO._.isFunction(plugin[key]))
        {
          plugin[key].apply();
        }
      }
    }
    catch(e)
    {
      errorOccured = true;
    }

    expect(errorOccured).toBe(false);
  });

  it('Conviva Plugin can track playing event',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
  });

  it('Conviva Plugin can track paused event',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    simulator.simulateVideoPause();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PAUSED);
  });
});
describe('Analytics Framework Omniture Plugin Unit Tests', function()
{
  jest.autoMockOff();
  //this file is the file that defines TEST_ROOT and SRC_ROOT
  require("../unit-test-helpers/test_env.js");
  require("../unit-test-helpers/mock_adobe.js");
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
  var testSetup = function()
  {
    framework = new Analytics.Framework();
    //mute the logging becuase there will be lots of error messages
    OO.log = function(){};
  };

  //cleanup for individual tests
  var testCleanup = function()
  {
    OO.Analytics.PluginFactoryList = [];
    OO.Analytics.FrameworkInstanceList = [];
    //return log back to normal
//    OO.log = console.log;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  //helpers
  var createPlugin = function(factory)
  {
    var plugin = new factory(framework);
    plugin.init();
    return plugin;
  };

  it('Test Omniture Plugin Validity', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    expect(omniturePluginFactory).not.toBeNull();
    var plugin = new omniturePluginFactory(omniturePluginFactory);
    expect(framework.validatePlugin(plugin)).toBe(true);
  });

  //it('Test Auto Registering Template', function()
  //{
  //  var templatePlugin = require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  //  var pluginList = framework.getPluginIDList();
  //  expect(pluginList.length).toBe(1);
  //
  //  var pluginID = pluginList[0];
  //  expect(pluginID).not.toBeFalsy();
  //  expect(pluginID && _.isString(pluginID)).toBe(true);
  //  expect(framework.isPluginActive(pluginID)).toBe(true);
  //
  //  //test registering it again
  //  pluginID2 = framework.registerPlugin(templatePlugin);
  //  expect(pluginID2).not.toBeFalsy();
  //  expect(pluginID2 && _.isString(pluginID2)).toBe(true);
  //  expect(framework.isPluginActive(pluginID2)).toBe(true);
  //  expect(pluginID).not.toEqual(pluginID2);
  //
  //  expect(framework.unregisterPlugin(pluginID)).toBe(true);
  //  expect(_.contains(framework.getPluginIDList(), pluginID)).toBe(false);
  //});
  //
  it('Test Omniture Plugin Validity', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var pluginID = framework.registerPlugin(omniturePluginFactory);
    expect(pluginID).toBeDefined();
    var pluginList = framework.getPluginIDList();
    expect(_.contains(pluginList, pluginID));
    expect(framework.makePluginInactive(pluginID)).toBe(true);
    expect(framework.makePluginActive(pluginID)).toBe(true);
  });
  //
  //
  //it('Test Template Mixed Loading Templates and Frameworks Delayed', function()
  //{
  //  var framework2 = new Analytics.Framework();
  //  expect(OO.Analytics.FrameworkInstanceList).toBeDefined();
  //  expect(OO.Analytics.FrameworkInstanceList.length).toEqual(2);
  //  var templatePluginFactory = require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  //  expect(OO.Analytics.PluginFactoryList).toBeDefined();
  //  expect(_.contains(OO.Analytics.PluginFactoryList, templatePluginFactory)).toBe(true);
  //
  //  var pluginList1 = framework.getPluginIDList();
  //  var pluginList2 = framework2.getPluginIDList();
  //  expect(pluginList1.length).toEqual(1);
  //  expect(pluginList2.length).toEqual(1);
  //
  //  var framework3 = new Analytics.Framework();
  //  pluginList1 = framework.getPluginIDList();
  //  pluginList2 = framework2.getPluginIDList();
  //  var pluginList3 = framework3.getPluginIDList();
  //  expect(pluginList1.length).toEqual(1);
  //  expect(pluginList2.length).toEqual(1);
  //  expect(pluginList3.length).toEqual(1);
  //});
  //
  //it('Test Template Created Before Framework', function()
  //{
  //  //erase the global references for the plugins and frameworks.
  //  OO.Analytics.PluginFactoryList = null;
  //  OO.Analytics.FrameworkInstanceList = null;
  //  var templatePluginFactory = require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  //  expect(OO.Analytics.PluginFactoryList).toBeTruthy();
  //  expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
  //  expect(OO.Analytics.FrameworkInstanceList).toBeTruthy();
  //  expect(OO.Analytics.FrameworkInstanceList.length).toEqual(0);
  //});
  //
  it('Test Setting Metadata and Processing An Event', function()
  {
    var metadataReceived;
    var eventProcessed;
    var paramsReceived;
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var newFactoryWithFunctionTracing = function()
    {
      var factory = new omniturePluginFactory();
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
      "Omniture":
      {
        "data": "mydata"
      }
    };
    framework.setPluginMetadata(metadata);
    expect(metadataReceived).toEqual(metadata["Omniture"]);
    framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PAUSED, [metadata]);
    expect(eventProcessed).toEqual(OO.Analytics.EVENTS.VIDEO_PAUSED);
    expect(paramsReceived).toEqual([metadata]);
  });

  it('Test Framework Destroy With Template', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
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
  //
  //it('Test Framework Destroy With Template And Multi Frameworks', function()
  //{
  //  var templatePluginFactory = require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  //  var framework2 = new OO.Analytics.Framework();
  //  var pluginList = framework.getPluginIDList();
  //  var pluginList2 = framework2.getPluginIDList();
  //
  //  expect(pluginList.length).toEqual(1);
  //  expect(pluginList2.length).toEqual(1);
  //  expect(OO.Analytics.FrameworkInstanceList.length).toEqual(2);
  //  expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
  //
  //  framework.destroy();
  //
  //  pluginList = framework.getPluginIDList();
  //  pluginList2 = framework2.getPluginIDList();
  //
  //  expect(pluginList.length).toEqual(0);
  //  expect(pluginList2.length).toEqual(1);
  //  expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
  //  expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
  //});

  it('Test all functions', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var errorOccured = false;
    try
    {
      for (var key in plugin)
      {
        if(OO._.isFunction(plugin[key]))
        {
          plugin[key].apply(plugin);
        }
      }
    }
    catch(e)
    {
      errorOccured = true;
    }

    expect(errorOccured).toBe(false);
  });

  //new
  it('Delegate can provide valid Video Info', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    Utils.simulatePlayerLoad(plugin, {
      embedCode : "abcde",
      title : "testTitle",
      duration : 20
    });
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
      streamPosition : 10
    }]);
    var delegate = plugin.getPlayerDelegate();
    var videoInfo = delegate.getVideoInfo();
    expect(videoInfo.id).toBe("abcde");
    expect(videoInfo.name).toBe("testTitle");
    expect(videoInfo.length).toBe(20);
    expect(videoInfo.playerName).toBe(playerName);
    expect(videoInfo.playhead).toBe(10);
  });

  it('Delegate can provide valid Ad Break Info', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
      streamPosition : 10
    }]);
    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
    var delegate = plugin.getPlayerDelegate();
    var adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(1);
    expect(adBreakInfo.startTime).toBe(10);
  });

  it('Delegate can provide valid Ad Info', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
      adId : "zyxw",
      adDuration : 15,
      adPodPosition : 1
    }]);
    var delegate = plugin.getPlayerDelegate();
    var adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe("zyxw");
    expect(adInfo.length).toBe(15);
    expect(adInfo.position).toBe(1);
  });

  it('Omniture Video Plugin can trackSessionStart', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackSessionStart = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED);
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackPlay', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackPlay = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackVideoLoad', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackVideoLoad = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED);
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin does not trackVideoLoad if we are resuming playback from a pause', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var videoLoadCalled = 0;
    var playCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackVideoLoad = function()
    {
      videoLoadCalled++;
    };
    plugin.omnitureVideoPlayerPlugin.trackPlay = function()
    {
      playCalled++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED);
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSED);
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
    expect(videoLoadCalled).toBe(1);
    expect(playCalled).toBe(2);
  });

  it('Omniture Video Plugin can trackPause', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackPause = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSED);
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackSeekStart', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackSeekStart = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED);
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackSeekStart', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackSeekStart = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED);
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackSeekComplete', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackSeekComplete = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
      streamPosition : 10
    }]);
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED);
    expect(called).toBe(1);
    var delegate = plugin.getPlayerDelegate();
    var videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(10);
  });

  it('Omniture Video Plugin can trackComplete', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackComplete = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_COMPLETED);
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackVideoUnload', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackVideoUnload = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_COMPLETED);
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackBufferStart', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackBufferStart = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED);
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackBufferComplete', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackBufferComplete = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED);
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackAdStart', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackAdStart = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
      adId : "zyxw",
      adDuration : 15,
      adPodPosition : 1
    }]);
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackAdComplete', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var called = 0;
    plugin.omnitureVideoPlayerPlugin.trackAdComplete = function()
    {
      called++;
    };
    plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can track all events in a typical playback', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var delegate = plugin.getPlayerDelegate();

    var adStartCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackAdStart = function()
    {
      adStartCalled++;
    };

    var adCompleteCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackAdComplete = function()
    {
      adCompleteCalled++;
    };

    var sessionStartCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackSessionStart = function()
    {
      sessionStartCalled++;
    };

    var videoLoadCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackVideoLoad = function()
    {
      videoLoadCalled++;
    };

    var bufferStartCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackBufferStart = function()
    {
      bufferStartCalled++;
    };

    var bufferCompleteCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackBufferComplete = function()
    {
      bufferCompleteCalled++;
    };

    var playCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackPlay = function()
    {
      playCalled++;
    };

    var pauseCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackPause = function()
    {
      pauseCalled++;
    };

    var seekStartCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackSeekStart = function()
    {
      seekStartCalled++;
    };

    var seekCompleteCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackSeekComplete = function()
    {
      seekCompleteCalled++;
    };

    var completeCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackComplete = function()
    {
      completeCalled++;
    };

    var videoUnloadCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackVideoUnload = function()
    {
      videoUnloadCalled++;
    };

    var videoInfo, adBreakInfo, adInfo;

    //initialization
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED, [{
      title : "testTitle",
      duration : 20
    }]);
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.name).toBe("testTitle");
    expect(videoInfo.length).toBe(20);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
      embedCode : "abcde"
    }]);
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.id).toBe("abcde");

    //user clicks play
    plugin.processEvent(OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED);
    expect(sessionStartCalled).toBe(1);

    //preroll
    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
    adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(1);
    expect(adBreakInfo.startTime).toBe(0);

    plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
      adId : "preroll",
      adDuration : 15,
      adPodPosition : 1
    }]);
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe("preroll");
    expect(adInfo.length).toBe(15);
    expect(adInfo.position).toBe(1);
    expect(adStartCalled).toBe(1);

    plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
    expect(adCompleteCalled).toBe(1);
    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);

    //main content
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED);
    expect(bufferStartCalled).toBe(1);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED);
    expect(bufferCompleteCalled).toBe(1);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
    expect(videoLoadCalled).toBe(1);
    expect(playCalled).toBe(1);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSED);
    expect(pauseCalled).toBe(1);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
    expect(videoLoadCalled).toBe(1);
    expect(playCalled).toBe(2);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED);
    expect(seekStartCalled).toBe(1);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
      streamPosition : 9
    }]);
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED);
    expect(seekCompleteCalled).toBe(1);
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(9);

    //midroll - podded of 2
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
      streamPosition : 10
    }]);
    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
    adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(1);
    expect(adBreakInfo.startTime).toBe(10);

    plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
      adId : "midroll",
      adDuration : 15,
      adPodPosition : 1
    }]);
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe("midroll");
    expect(adInfo.length).toBe(15);
    expect(adInfo.position).toBe(1);
    expect(adStartCalled).toBe(2);

    plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
    expect(adCompleteCalled).toBe(2);

    plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
      adId : "midroll2",
      adDuration : 5,
      adPodPosition : 2
    }]);
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe("midroll2");
    expect(adInfo.length).toBe(5);
    expect(adInfo.position).toBe(2);
    expect(adStartCalled).toBe(3);

    plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
    expect(adCompleteCalled).toBe(3);
    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);

    //main content resumes
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
    expect(videoLoadCalled).toBe(1);
    expect(playCalled).toBe(3);

    //TODO: Should completed message go before postroll?
    //postroll
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
      streamPosition : 60
    }]);
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(60);

    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
    adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(1);
    expect(adBreakInfo.startTime).toBe(60);

    plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
      adId : "postroll",
      adDuration : 30,
      adPodPosition : 1
    }]);
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe("postroll");
    expect(adInfo.length).toBe(30);
    expect(adInfo.position).toBe(1);
    expect(adStartCalled).toBe(4);

    plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
    expect(adCompleteCalled).toBe(4);
    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);

    //main video ends
    plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_COMPLETED);
    expect(completeCalled).toBe(1);
    expect(videoUnloadCalled).toBe(1);

    //replay
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED);
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(0);
  });

  //TODO: This only tests for function coverage of the Fake Video Plugin
  it('Omniture Video Plugin can track all events in a typical playback without mocks', function()
  {
    var omniturePluginFactory = require(SRC_ROOT + "plugins/Omniture.js");
    var plugin = createPlugin(omniturePluginFactory);
    var delegate = plugin.getPlayerDelegate();

    var videoInfo, adBreakInfo, adInfo;

    //initialization
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED, [{
      title : "testTitle",
      duration : 20
    }]);
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.name).toBe("testTitle");
    expect(videoInfo.length).toBe(20);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
      embedCode : "abcde"
    }]);
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.id).toBe("abcde");

    //user clicks play
    plugin.processEvent(OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED);

    //preroll
    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
    adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(1);
    expect(adBreakInfo.startTime).toBe(0);

    plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
      adId : "preroll",
      adDuration : 15,
      adPodPosition : 1
    }]);
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe("preroll");
    expect(adInfo.length).toBe(15);
    expect(adInfo.position).toBe(1);

    plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);

    //main content
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSED);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED);

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
      streamPosition : 9
    }]);
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED);
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(9);

    //midroll - podded of 2
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
      streamPosition : 10
    }]);
    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
    adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(1);
    expect(adBreakInfo.startTime).toBe(10);

    plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
      adId : "midroll",
      adDuration : 15,
      adPodPosition : 1
    }]);
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe("midroll");
    expect(adInfo.length).toBe(15);
    expect(adInfo.position).toBe(1);

    plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);

    plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
      adId : "midroll2",
      adDuration : 5,
      adPodPosition : 2
    }]);
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe("midroll2");
    expect(adInfo.length).toBe(5);
    expect(adInfo.position).toBe(2);

    plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);

    //main content resumes
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);

    //TODO: Should completed message go before postroll?
    //postroll
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
      streamPosition : 60
    }]);
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(60);

    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
    adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(1);
    expect(adBreakInfo.startTime).toBe(60);

    plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
      adId : "postroll",
      adDuration : 30,
      adPodPosition : 1
    }]);
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe("postroll");
    expect(adInfo.length).toBe(30);
    expect(adInfo.position).toBe(1);

    plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
    plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);

    //main video ends
    plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_COMPLETED);

    //replay
    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED);
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(0);
  });
});

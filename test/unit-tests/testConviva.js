describe('Analytics Framework Conviva Plugin Unit Tests', function()
{
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
  var testSetup = function()
  {
    framework = new Analytics.Framework();
    //mute the logging becuase there will be lots of error messages
    OO.log = function() {};
  };

  //cleanup for individual tests
  var testCleanup = function()
  {
    OO.Analytics.PluginFactoryList = [];
    OO.Analytics.FrameworkInstanceList = [];
    Conviva.currentPlayerStateManager = null;
    Conviva.currentClient = null;
    Conviva.currentSystemFactory = null;
    Conviva.currentContentMetadata = null;
    //return log back to normal
    //OO.log = console.log;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  //helpers
  var createPlugin = function(framework, metadata)
  {
    var convivaPluginFactory = require(SRC_ROOT + "plugins/conviva.js");
    var plugin = new convivaPluginFactory(framework);
    plugin.init();
    metadata = metadata ? metadata : {
      "gatewayUrl":"testUrl",
      "customerKey":"testKey"
    };
    plugin.setMetadata(metadata);
    return plugin;
  };

  var startPlayer = function(simulator, streamUrl)
  {
    streamUrl = streamUrl ? streamUrl : "http://testStreamUrl";
    simulator.simulateVideoElementCreated(streamUrl);
    simulator.simulatePlayerStart();
  };

  var createErrorString = function(errorCode, errorMessage)
  {
    return "Error Code: " + errorCode + ", Error Message: " + errorMessage;
  };

  it('Test Conviva Plugin Validity', function()
  {
    var convivaPluginFactory = require(SRC_ROOT + "plugins/conviva.js");
    expect(convivaPluginFactory).not.toBeNull();
    expect(convivaPluginFactory).toBeDefined();
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
          var testFunction = _.bind(plugin[key], plugin);
          testFunction.apply();
        }
      }
    }
    catch(e)
    {
      errorOccured = true;
    }

    expect(errorOccured).toBe(false);
  });

  it('Conviva Plugin can provide content metadata to Conviva',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000
    });
    startPlayer(simulator);
    //asset name format is defined as "[" + embedCode + "] " + title in conviva.js and Conviva's sample app
    expect(Conviva.currentContentMetadata.assetName).toBe("[" + embedCode + "] " + title);
    //default to VOD
    expect(Conviva.currentContentMetadata.streamType).toBe(Conviva.ContentMetadata.StreamType.VOD);
    expect(Conviva.currentContentMetadata.duration).toBe(60);
  });

  it('Conviva Plugin can provide content metadata to Conviva with explicit VOD stream type',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000,
      streamType: OO.Analytics.STREAM_TYPE.VOD
    });
    startPlayer(simulator);
    //asset name format is defined as "[" + embedCode + "] " + title in conviva.js and Conviva's sample app
    expect(Conviva.currentContentMetadata.assetName).toBe("[" + embedCode + "] " + title);
    expect(Conviva.currentContentMetadata.streamType).toBe(Conviva.ContentMetadata.StreamType.VOD);
    expect(Conviva.currentContentMetadata.duration).toBe(60);
  });

  it('Conviva Plugin can provide live content metadata to Conviva',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000,
      streamType: OO.Analytics.STREAM_TYPE.LIVE_STREAM
    });
    startPlayer(simulator);
    //asset name format is defined as "[" + embedCode + "] " + title in conviva.js and Conviva's sample app
    expect(Conviva.currentContentMetadata.assetName).toBe("[" + embedCode + "] " + title);
    expect(Conviva.currentContentMetadata.streamType).toBe(Conviva.ContentMetadata.StreamType.LIVE);
    expect(Conviva.currentContentMetadata.duration).toBe(60);
  });

  it('Conviva Plugin can provide new content metadata to Conviva on embed code change',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000
    });
    startPlayer(simulator);
    //asset name format is defined as "[" + embedCode + "] " + title in conviva.js and Conviva's sample app
    expect(Conviva.currentContentMetadata.assetName).toBe("[" + embedCode + "] " + title);
    expect(Conviva.currentContentMetadata.streamType).toBe(Conviva.ContentMetadata.StreamType.VOD);
    expect(Conviva.currentContentMetadata.duration).toBe(60);

    var newEmbedCode = "newTestEmbedCode";
    var newTitle = "newTestTitle";
    simulator.simulatePlayerLoad({
      embedCode: newEmbedCode,
      title: newTitle,
      duration: 30000
    });
    startPlayer(simulator);
    expect(Conviva.currentContentMetadata.assetName).toBe("[" + newEmbedCode + "] " + newTitle);
    expect(Conviva.currentContentMetadata.streamType).toBe(Conviva.ContentMetadata.StreamType.VOD);
    expect(Conviva.currentContentMetadata.duration).toBe(30);
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
    startPlayer(simulator);
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
    startPlayer(simulator);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    simulator.simulateVideoPause();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PAUSED);
  });

  it('Conviva Plugin can track stopped event',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    simulator.simulatePlaybackComplete();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.STOPPED);
  });

  it('Conviva Plugin can track buffering event',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    simulator.simulateVideoBufferingStarted();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.BUFFERING);
    simulator.simulateVideoBufferingEnded();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
  });

  it('Conviva Plugin can track PAUSED after buffering finishes when content is PAUSED',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    simulator.simulateVideoPause();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PAUSED);

    simulator.simulateVideoBufferingStarted();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.BUFFERING);
    simulator.simulateVideoBufferingEnded();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PAUSED);
  });

  it('Conviva Plugin can track bitrate changes',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    simulator.simulateBitrateChange({
      bitrate: 120000,
      width: 640,
      height: 480,
      id: "id"
    });
    expect(Conviva.currentPlayerStateManager.currentBitrate).toBe(120); //120000/1000 = 120
  });

  it('Conviva Plugin does not track bitrate changes when provided an invalid bitrate',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    simulator.simulateBitrateChange({
      bitrate: "ABCD",
      width: 640,
      height: 480,
      id: "id"
    });
    expect(Conviva.currentPlayerStateManager.currentBitrate).toBe(-1); //-1 is default in mock_conviva.js
    simulator.simulateBitrateChange({
      bitrate: null,
      width: 640,
      height: 480,
      id: "id"
    });
    expect(Conviva.currentPlayerStateManager.currentBitrate).toBe(-1); //-1 is default in mock_conviva.js
    //bitrate undefined
    simulator.simulateBitrateChange({
      width: 640,
      height: 480,
      id: "id"
    });
    expect(Conviva.currentPlayerStateManager.currentBitrate).toBe(-1); //-1 is default in mock_conviva.js

    //let a correct bitrate go through
    simulator.simulateBitrateChange({
      bitrate: 120000,
      width: 640,
      height: 480,
      id: "id"
    });
    expect(Conviva.currentPlayerStateManager.currentBitrate).toBe(120); //120000/1000 = 120

    simulator.simulateBitrateChange({
      bitrate: "ABCD",
      width: 640,
      height: 480,
      id: "id"
    });
    expect(Conviva.currentPlayerStateManager.currentBitrate).toBe(120);
    simulator.simulateBitrateChange({
      bitrate: null,
      width: 640,
      height: 480,
      id: "id"
    });
    expect(Conviva.currentPlayerStateManager.currentBitrate).toBe(120);
    //bitrate undefined
    simulator.simulateBitrateChange({
      width: 640,
      height: 480,
      id: "id"
    });
    expect(Conviva.currentPlayerStateManager.currentBitrate).toBe(120);
  });

  it('Conviva Plugin does not track bitrate changes during ad playback',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    //preroll
    simulator.simulateAdBreakStarted();
    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId : "zyxw",
        adDuration : 15,
        adPodPosition : 1
      }
    });

    simulator.simulateBitrateChange({
      bitrate: 120000,
      width: 640,
      height: 480,
      id: "id"
    });
    expect(Conviva.currentPlayerStateManager.currentBitrate).toBe(-1); //-1 is default in mock_conviva.js

    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: "adId"
    });
    simulator.simulateAdBreakEnded();

    simulator.simulateContentPlayback();
    simulator.simulateBitrateChange({
      bitrate: 120000,
      width: 640,
      height: 480,
      id: "id"
    });
    expect(Conviva.currentPlayerStateManager.currentBitrate).toBe(120); //120000/1000 = 120

    //midroll
    simulator.simulateAdBreakStarted();
    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId : "zyxw",
        adDuration : 15,
        adPodPosition : 1
      }
    });

    simulator.simulateBitrateChange({
      bitrate: 180000,
      width: 640,
      height: 480,
      id: "id"
    });
    expect(Conviva.currentPlayerStateManager.currentBitrate).toBe(120); //unchanged from last content bitrate change
  });

  it('Conviva Plugin can track preroll ad playback',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    simulator.simulateAdBreakStarted();
    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId : "zyxw",
        adDuration : 15,
        adPodPosition : 1
      }
    });
    var sessionId = Conviva.currentClient.sessionId;
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.NOT_MONITORED);
    expect(Conviva.currentClient.adPlaying).toBe(true);
    expect(Conviva.currentClient.adStartSessionId).toBe(sessionId);
    expect(Conviva.currentClient.adStream).toBe(Conviva.Client.AdStream.SEPARATE);
    expect(Conviva.currentClient.adPlayer).toBe(Conviva.Client.AdPlayer.SEPARATE);
    expect(Conviva.currentClient.adPosition).toBe(Conviva.Client.AdPosition.PREROLL);

    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: "adId"
    });
    simulator.simulateAdBreakEnded();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.STOPPED);
    expect(Conviva.currentClient.adPlaying).toBe(false);
    expect(Conviva.currentClient.adEndSessionId).toBe(sessionId);

    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
  });

  it('Conviva Plugin can track midroll ad playback',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    expect(Conviva.currentClient.adPlaying).toBe(false);

    simulator.simulateVideoProgress({
      playheads: [10]
    });

    simulator.simulateAdBreakStarted();
    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId : "zyxw",
        adDuration : 15,
        adPodPosition : 1
      }
    });
    var sessionId = Conviva.currentClient.sessionId;
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.NOT_MONITORED);
    expect(Conviva.currentClient.adPlaying).toBe(true);
    expect(Conviva.currentClient.adStartSessionId).toBe(sessionId);
    expect(Conviva.currentClient.adStream).toBe(Conviva.Client.AdStream.SEPARATE);
    expect(Conviva.currentClient.adPlayer).toBe(Conviva.Client.AdPlayer.SEPARATE);
    expect(Conviva.currentClient.adPosition).toBe(Conviva.Client.AdPosition.MIDROLL);

    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: "adId"
    });
    simulator.simulateAdBreakEnded();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.STOPPED);
    expect(Conviva.currentClient.adPlaying).toBe(false);
    expect(Conviva.currentClient.adEndSessionId).toBe(sessionId);
  });

  it('Conviva Plugin can track postroll ad playback',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    expect(Conviva.currentClient.adPlaying).toBe(false);

    simulator.simulateContentComplete({
      streamPosition: 60
    });
    expect(Conviva.currentClient.adPlaying).toBe(false);

    simulator.simulateAdBreakStarted();
    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId : "zyxw",
        adDuration : 15,
        adPodPosition : 1
      }
    });
    var sessionId = Conviva.currentClient.sessionId;
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.NOT_MONITORED);
    expect(Conviva.currentClient.adPlaying).toBe(true);
    expect(Conviva.currentClient.adStartSessionId).toBe(sessionId);
    expect(Conviva.currentClient.adStream).toBe(Conviva.Client.AdStream.SEPARATE);
    expect(Conviva.currentClient.adPlayer).toBe(Conviva.Client.AdPlayer.SEPARATE);
    expect(Conviva.currentClient.adPosition).toBe(Conviva.Client.AdPosition.POSTROLL);

    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: "adId"
    });
    simulator.simulateAdBreakEnded();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.STOPPED);
    expect(Conviva.currentClient.adPlaying).toBe(false);
    expect(Conviva.currentClient.adEndSessionId).toBe(sessionId);
  });
  
  //new sessions: replay, embed code change, etc
  it('Conviva Plugin can start new session on replay',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var firstSessionId = Conviva.currentClient.sessionId;
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    simulator.simulatePlaybackComplete();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.STOPPED);

    //when playback completes, session will end
    expect(Conviva.currentClient.sessionsCleanedUp).toBe(1);
    simulator.simulateReplay();
    //there is no session to clean up, so this will remain at 1
    expect(Conviva.currentClient.sessionsCleanedUp).toBe(1);
    var secondSessionId = Conviva.currentClient.sessionId;
    expect(secondSessionId).toNotBe(firstSessionId);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    simulator.simulatePlaybackComplete();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.STOPPED);
    simulator.simulateReplay();
    expect(Conviva.currentClient.sessionId).toNotBe(firstSessionId);
    expect(Conviva.currentClient.sessionId).toNotBe(secondSessionId);
  });

  it('Conviva Plugin can start new session on embed code change',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var firstSessionId = Conviva.currentClient.sessionId;
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    expect(Conviva.currentContentMetadata.streamUrl).toBe("http://testStreamUrl");
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    simulator.simulatePlaybackComplete();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.STOPPED);

    //when playback completes, session will end
    expect(Conviva.currentClient.sessionsCleanedUp).toBe(1);
    simulator.simulatePlayerLoad({
      embedCode: "newTestEmbedCode",
      title: "newTestTitle",
      duration: 60000
    });
    startPlayer(simulator, "http://testStreamUrlTwo");
    expect(Conviva.currentContentMetadata.streamUrl).toBe("http://testStreamUrlTwo");
    //there is no session to clean up, so this will remain at 1
    expect(Conviva.currentClient.sessionsCleanedUp).toBe(1);
    var secondSessionId = Conviva.currentClient.sessionId;
    expect(secondSessionId).toNotBe(firstSessionId);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);

    //simulate discovery
    expect(Conviva.currentClient.sessionsCleanedUp).toBe(1);
    simulator.simulatePlayerLoad({
      embedCode: "newTestEmbedCode",
      title: "newTestTitle",
      duration: 60000
    });
    startPlayer(simulator, "http://testStreamUrlThree");
    expect(Conviva.currentContentMetadata.streamUrl).toBe("http://testStreamUrlThree");
    expect(Conviva.currentClient.sessionsCleanedUp).toBe(2);
    expect(Conviva.currentClient.sessionId).toNotBe(firstSessionId);
    expect(Conviva.currentClient.sessionId).toNotBe(secondSessionId);
  });
  
  //destroy
  it('Conviva Plugin can clean up on destroy',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var firstSessionId = Conviva.currentClient.sessionId;
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);
    simulator.simulatePlaybackComplete();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.STOPPED);
    plugin.destroy();
    expect(Conviva.currentClient).toBe(null);
    expect(Conviva.currentSystemFactory).toBe(null);
  });

  it('Conviva Plugin calls destroy on beforeunload after content has started',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var firstSessionId = Conviva.currentClient.sessionId;
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    simulator.simulateContentPlayback();
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.PLAYING);

    var beforeUnloadEvent = document.createEvent("Event");
    beforeUnloadEvent.initEvent("beforeunload", true, true);
    window.document.dispatchEvent(beforeUnloadEvent);

    expect(Conviva.currentClient).toBe(null);
    expect(Conviva.currentSystemFactory).toBe(null);
  });

  it('Conviva Plugin calls destroy on beforeunload before content has started',function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var firstSessionId = Conviva.currentClient.sessionId;
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    startPlayer(simulator);
    expect(Conviva.currentPlayerStateManager.currentPlayerState).toBe(Conviva.PlayerStateManager.PlayerState.STOPPED);

    var beforeUnloadEvent = document.createEvent("Event");
    beforeUnloadEvent.initEvent("beforeunload", true, true);
    window.document.dispatchEvent(beforeUnloadEvent);

    expect(Conviva.currentClient).toBe(null);
    expect(Conviva.currentSystemFactory).toBe(null);
  });

  //negative cases
  it('Conviva Plugin will not track if player state manager was not created due to missing page level metadata',function()
  {
    var plugin = createPlugin(framework, {});
    var simulator = Utils.createPlaybackSimulator(plugin);
    expect(Conviva.currentPlayerStateManager).toBe(null);
    expect(Conviva.currentClient).toBe(null);
  });

  it('Conviva Plugin will not track if streamUrl was not received',function()
  {
    var plugin = createPlugin(framework, {
      "gatewayUrl":"testUrl",
      "customerKey":"testKey"
    });
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    expect(Conviva.currentContentMetadata).toBe(null);
  });

  it('Conviva Plugin will not start session until we receive INITIAL_PLAYBACK_REQUESTED event',function()
  {
    var plugin = createPlugin(framework, {
      "gatewayUrl":"testUrl",
      "customerKey":"testKey"
    });
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    simulator.simulateVideoElementCreated("http://testStreamUrl");
    //no INITIAL_PLAYBACK_REQUESTED
    expect(Conviva.currentClient.sessionId).toBe(Conviva.Client.NO_SESSION_KEY);
    //INITIAL_PLAYBACK_REQUESTED
    simulator.simulatePlayerStart();
    expect(Conviva.currentClient.sessionId).toNotBe(Conviva.Client.NO_SESSION_KEY);
  });

  //custom metadata
  it('Conviva Plugin can send custom metadata', function()
  {
    var customMetadata = {
      "testKey": "testValue",
      "testAccount": "testAccountName"
    };
    var plugin = createPlugin(framework, {
      "gatewayUrl":"testUrl",
      "customerKey":"testKey",
      "customMetadata": customMetadata
    });
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000
    });
    startPlayer(simulator);
    //asset name format is defined as "[" + embedCode + "] " + title in conviva.js and Conviva's sample app
    expect(Conviva.currentContentMetadata.assetName).toBe("[" + embedCode + "] " + title);
    //default to VOD
    expect(Conviva.currentContentMetadata.streamType).toBe(Conviva.ContentMetadata.StreamType.VOD);
    expect(Conviva.currentContentMetadata.duration).toBe(60);

    //custom metadata
    expect(Conviva.currentContentMetadata.custom['testKey']).toBe('testValue');
    expect(Conviva.currentContentMetadata.custom['testAccount']).toBe('testAccountName');
    //custom metadata should still include player vendor and version
    expect(_.has(Conviva.currentContentMetadata.custom, 'playerVendor')).toBe(true);
    expect(_.has(Conviva.currentContentMetadata.custom, 'playerVersion')).toBe(true);
  });

  it('Conviva Plugin will ignore null custom metadata', function()
  {
    var plugin = createPlugin(framework, {
      "gatewayUrl":"testUrl",
      "customerKey":"testKey",
      "customMetadata": null
    });
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000
    });
    startPlayer(simulator);
    //asset name format is defined as "[" + embedCode + "] " + title in conviva.js and Conviva's sample app
    expect(Conviva.currentContentMetadata.assetName).toBe("[" + embedCode + "] " + title);
    //default to VOD
    expect(Conviva.currentContentMetadata.streamType).toBe(Conviva.ContentMetadata.StreamType.VOD);
    expect(Conviva.currentContentMetadata.duration).toBe(60);

    //custom metadata should still include player vendor and version
    expect(_.has(Conviva.currentContentMetadata.custom, 'playerVendor')).toBe(true);
    expect(_.has(Conviva.currentContentMetadata.custom, 'playerVersion')).toBe(true);
  });

  it('Conviva Plugin can send application name', function()
  {
    var plugin = createPlugin(framework, {
      "gatewayUrl":"testUrl",
      "customerKey":"testKey",
      "applicationName": "testAppName"
    });
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000
    });
    startPlayer(simulator);
    expect(Conviva.currentContentMetadata.applicationName).toBe("testAppName");
  });

  it('Conviva Plugin will not send application name if it is not a string', function()
  {
    var plugin = createPlugin(framework, {
      "gatewayUrl":"testUrl",
      "customerKey":"testKey",
      "applicationName": {}
    });
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000
    });
    startPlayer(simulator);
    expect(Conviva.currentContentMetadata.applicationName).toBe(undefined);
  });

  it('Conviva Plugin should report ad errors', function()
  {
    var plugin = createPlugin(framework, {
      "gatewayUrl":"testUrl",
      "customerKey":"testKey",
      "applicationName": {}
    });
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000
    });
    startPlayer(simulator, "http://testStreamUrl");

    var error = "adError";
    simulator.simulateAdError(error);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(error);
  });

  it('Conviva Plugin should report general errors', function()
  {
    var plugin = createPlugin(framework, {
      "gatewayUrl":"testUrl",
      "customerKey":"testKey",
      "applicationName": {}
    });
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000
    });
    startPlayer(simulator, "http://testStreamUrl");

    var errorCode = "generalErrorCode";
    var errorMessage = "generalErrorMessage";
    var errorString = createErrorString(errorCode, errorMessage);
    simulator.simulateGeneralError(errorCode, errorMessage);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);

    // test bad errorMessage;
    errorString = "Error Code: " + errorCode;
    simulator.simulateGeneralError(errorCode, "");
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);

    simulator.simulateGeneralError(errorCode, null);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);

    simulator.simulateGeneralError(errorCode, undefined);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);
  });

  it('Conviva Plugin should report metadata loading errors', function()
  {
    var plugin = createPlugin(framework, {
      "gatewayUrl":"testUrl",
      "customerKey":"testKey",
      "applicationName": {}
    });
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000
    });
    startPlayer(simulator, "http://testStreamUrl");

    var errorCode = "metadataLoadingErrorCode";
    var errorMessage = "metadataLoadingErrorMessage";
    var errorString = createErrorString(errorCode, errorMessage);
    simulator.simulateMetadataLoadingError(errorCode, errorMessage);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);

    // test bad errorMessage;
    errorString = "Error Code: " + errorCode;
    simulator.simulateMetadataLoadingError(errorCode, "");
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);

    simulator.simulateMetadataLoadingError(errorCode, null);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);

    simulator.simulateMetadataLoadingError(errorCode, undefined);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);
  });

  it('Conviva Plugin should report video playback errors', function()
  {
    var plugin = createPlugin(framework, {
      "gatewayUrl":"testUrl",
      "customerKey":"testKey",
      "applicationName": {}
    });
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000
    });
    startPlayer(simulator, "http://testStreamUrl");

    var errorCode = "videoPlaybackErrorCode";
    var errorMessage = "videoPlaybackErrorMessage";
    var errorString = createErrorString(errorCode, errorMessage);
    simulator.simulateVideoPlaybackError(errorCode, errorMessage);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);

    // test bad errorMessage;
    errorString = "Error Code: " + errorCode;
    simulator.simulateVideoPlaybackError(errorCode, "");
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);

    simulator.simulateVideoPlaybackError(errorCode, null);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);

    simulator.simulateVideoPlaybackError(errorCode, undefined);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);
  });

  it('Conviva Plugin should report authorization errors', function()
  {
    var plugin = createPlugin(framework, {
      "gatewayUrl":"testUrl",
      "customerKey":"testKey",
      "applicationName": {}
    });
    var simulator = Utils.createPlaybackSimulator(plugin);
    var embedCode = "testEmbedCode";
    var title = "testTitle";
    simulator.simulatePlayerLoad({
      embedCode: embedCode,
      title: title,
      duration: 60000
    });
    startPlayer(simulator, "http://testStreamUrl");

    var errorCode = "authorizationErrorCode";
    var errorMessage = "authorizationErrorMessage";
    var errorString = createErrorString(errorCode, errorMessage);
    simulator.simulateAuthorizationError(errorCode, errorMessage);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);
    
    // test bad errorMessage;
    errorString = "Error Code: " + errorCode;
    simulator.simulateAuthorizationError(errorCode, "");
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);

    simulator.simulateAuthorizationError(errorCode, null);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);

    simulator.simulateAuthorizationError(errorCode, undefined);
    expect(Conviva.currentPlayerStateManager.errorSent).toBe(errorString);
  });
});

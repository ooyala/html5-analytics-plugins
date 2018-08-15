describe('Analytics Framework Template Unit Tests', function()
{
  jest.autoMockOff();
  require(SRC_ROOT + "framework/AnalyticsFramework.js");
  //  require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  require(TEST_ROOT + "unit-test-helpers/AnalyticsFrameworkTestUtils.js");
  require(COMMON_SRC_ROOT + "utils/InitModules/InitOOUnderscore.js");
  var iqPluginFactory = require(SRC_ROOT + "plugins/iq.js");

  var Analytics = OO.Analytics;
  var Utils = OO.Analytics.Utils;
  var _ = OO._;
  var framework;

  //setup for individual tests
  var testSetup = function()
  {
    framework = new Analytics.Framework();
    //mute the logging becuase there will be lots of error messages
    OO.log = function(){};
    OO.VERSION = { core : { releaseVersion : "v4"} };

    window.Ooyala = {
      Analytics : {
        Reporter: function() {
          return {
            _base: {},

            // defined strictly for unit testing states
            unitTestState: {
              mediaId: null,
              contentType: null,
              setDeviceInfoCalled: 0,
              doNotTrack: null,
              setPlayerInfoCalled: 0,
              seekedPlayheadPosition: null,
              currentPlayheadPosition: null,
              initializeMediaCalled: 0,
              setMediaDurationCalled: 0,
              reportPlayerLoadCalled: 0,
              reportPlayRequestedCalled: 0,
              reportPauseCalled: 0,
              reportResumeCalled: 0,
              reportPlayHeadUpdateCalled: 0,
              reportSeekCalled: 0,
              reportCompleteCalled: 0,
              reportReplayCalled: 0,
              reportPlaybackStartedCalled: 0,
              reportCustomEventCalled: 0,
              reportAssetImpressionCalled: 0,
              reportAssetClickCalled: 0
            },

            setDeviceInfo: function(deviceId, deviceInfo, userAgent, doNotTrack) {
              this.unitTestState.setDeviceInfoCalled++;
              this.unitTestState.doNotTrack = doNotTrack;
            },
            setPlayerInfo: function() {
              this.unitTestState.setPlayerInfoCalled++;
            },
            initializeMedia: function(mediaId, contentType) {
              this.unitTestState.initializeMediaCalled++;
              this.unitTestState.mediaId = mediaId;
              this.unitTestState.contentType = contentType;
            },
            setMediaDuration: function(duration) {
              this.unitTestState.setMediaDurationCalled++;
              this.unitTestState.duration = duration;
            },
            reportPlayerLoad: function() {
              this.unitTestState.reportPlayerLoadCalled++;
            },
            reportPlaybackStarted: function() {
              this.unitTestState.reportPlaybackStartedCalled++;
            },
            reportPlayRequested: function() {
              this.unitTestState.reportPlayRequestedCalled++;
            },
            reportPause: function() {
              this.unitTestState.reportPauseCalled++;
            },
            reportResume: function() {
              this.unitTestState.reportResumeCalled++;
            },
            reportPlayHeadUpdate: function(currentPlayheadPosition) {
              this.unitTestState.currentPlayheadPosition = currentPlayheadPosition;
              this.unitTestState.reportPlayHeadUpdateCalled++;
            },
            reportSeek: function(currentPlayheadPosition, seekedPlayheadPosition) {
              this.unitTestState.seekedPlayheadPosition = seekedPlayheadPosition;
              this.unitTestState.reportSeekCalled++;
            },
            reportComplete: function() {
              this.unitTestState.reportCompleteCalled++;
            },
            reportReplay: function() {
              this.unitTestState.reportReplayCalled++;
            },
            reportCustomEvent: function(eventName, eventMetadata) {
              this.unitTestState.eventName = eventName;
              this.unitTestState.eventMetadata = eventMetadata;
              this.unitTestState.reportCustomEventCalled++;
            },
            reportAssetImpression: function(asset, customData, uiTag, contentSource, pageSize, assetPosition) {
              this.unitTestState.asset = asset;
              this.unitTestState.customData = customData;
              this.unitTestState.uiTag = uiTag;
              this.unitTestState.contentSource = contentSource;
              this.unitTestState.pageSize = pageSize;
              this.unitTestState.assetPosition = assetPosition;
              this.unitTestState.reportAssetImpressionCalled++;
            },
            reportAssetClick: function(asset, customData, uiTag, contentSource, pageSize, assetPosition) {
              this.unitTestState.asset = asset;
              this.unitTestState.customData = customData;
              this.unitTestState.uiTag = uiTag;
              this.unitTestState.contentSource = contentSource;
              this.unitTestState.pageSize = pageSize;
              this.unitTestState.assetPosition = assetPosition;
              this.unitTestState.reportAssetClickCalled++;
            },
          };
        }
      }
    };
  };

  //cleanup for individual tests
  var testCleanup = function()
  {
    OO.Analytics.PluginFactoryList = [];
    OO.Analytics.FrameworkInstanceList = [];
    //return log back to normal
    //    OO.log = console.log;
    window.Ooyala = null;
  };

  var createPlugin = function(framework)
  {
    var plugin = new iqPluginFactory(framework);

    //enable iq reporting in plugin for testing
    var metadata = {
      "metadata":
      {
        "enabled": true
      }
    };

    plugin.testMode = true;
    plugin.init();
    plugin.setMetadata(metadata);
    return plugin;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  it('Test IQ Plugin Validity', function()
  {
    expect(iqPluginFactory).not.toBeNull();
    var plugin = new iqPluginFactory();
    expect(framework.validatePlugin(plugin)).toBe(true);
  });

  it('Test IQ Plugin Validity', function()
  {
    var pluginID = framework.registerPlugin(iqPluginFactory);
    expect(pluginID).toBeDefined();
    var pluginList = framework.getPluginIDList();
    expect(_.contains(pluginList, pluginID));
    expect(framework.makePluginInactive(pluginID)).toBe(true);
    expect(framework.makePluginActive(pluginID)).toBe(true);
  });

  it('Test Auto Registering IQ Plugin', function()
  {
    OO.Analytics.RegisterPluginFactory(iqPluginFactory);
    var pluginList = framework.getPluginIDList();
    expect(pluginList.length).toBe(1);

    var pluginID = pluginList[0];
    expect(pluginID).not.toBeFalsy();
    expect(pluginID && _.isString(pluginID)).toBe(true);
    expect(framework.isPluginActive(pluginID)).toBe(true);

    //test registering it again
    var pluginID2 = framework.registerPlugin(iqPluginFactory);
    expect(pluginID2).not.toBeFalsy();
    expect(pluginID2 && _.isString(pluginID2)).toBe(true);
    expect(framework.isPluginActive(pluginID2)).toBe(true);
    expect(pluginID).not.toEqual(pluginID2);

    expect(framework.unregisterPlugin(pluginID)).toBe(true);
    expect(_.contains(framework.getPluginIDList(), pluginID)).toBe(false);
  });

  it('Test IQ Plugin Mixed Loading Plugins and Frameworks Delayed', function()
  {
    var framework2 = new Analytics.Framework();
    expect(OO.Analytics.FrameworkInstanceList).toBeDefined();
    expect(OO.Analytics.FrameworkInstanceList.length).toEqual(2);
    OO.Analytics.RegisterPluginFactory(iqPluginFactory);
    expect(OO.Analytics.PluginFactoryList).toBeDefined();
    expect(_.contains(OO.Analytics.PluginFactoryList, iqPluginFactory)).toBe(true);

    var pluginList1 = framework.getPluginIDList();
    var pluginList2 = framework2.getPluginIDList();
    expect(pluginList1.length).toEqual(1);
    expect(pluginList2.length).toEqual(1);

    var framework3 = new Analytics.Framework();
    pluginList1 = framework.getPluginIDList();
    pluginList2 = framework2.getPluginIDList();
    var pluginList3 = framework3.getPluginIDList();
    expect(pluginList1.length).toEqual(1);
    expect(pluginList2.length).toEqual(1);
    expect(pluginList3.length).toEqual(1);
  });

  //TODO: This test as is cannot be run now since requirejs does not reload the script.
  //However, the things tested in this test could be covered by the other tests, since
  //the other tests require the modules to be loaded properly
  //it('Test IQ Plugin Created Before Framework', function()
  //{
  //  //erase the global references for the plugins and frameworks.
  //  OO.Analytics.PluginFactoryList = null;
  //  OO.Analytics.FrameworkInstanceList = null;
  //  expect(OO.Analytics.PluginFactoryList).toBeTruthy();
  //  expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
  //  expect(OO.Analytics.FrameworkInstanceList).toBeTruthy();
  //  expect(OO.Analytics.FrameworkInstanceList.length).toEqual(0);
  //});

  it('Test Setting Metadata and Processing An Event', function()
  {
    var metadataReceived = null;
    var eventProcessed = null;
    var paramsReceived = null;
    var newFactoryWithFunctionTracing = function()
    {
        var factory = new iqPluginFactory();
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
      "iq":
      {
        "data": "mydata"
      }
    };
    framework.setPluginMetadata(metadata);
    expect(metadataReceived).toEqual(metadata["iq"]);
    framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PAUSED, [metadata]);
    expect(eventProcessed).toEqual(OO.Analytics.EVENTS.VIDEO_PAUSED);
    expect(paramsReceived).toEqual([metadata]);
  });

  it('Test Framework Destroy With IQ Plugin', function()
  {
    OO.Analytics.RegisterPluginFactory(iqPluginFactory);
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

  it('Test Framework Destroy With IQ Plugin And Multi Frameworks', function()
  {
    OO.Analytics.RegisterPluginFactory(iqPluginFactory);
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

  it('Test all functions', function()
  {
    var plugin = new iqPluginFactory(framework);
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
      console.log(e);
      errorOccured = true;
    }

    expect(errorOccured).toBe(false);
  });

  it('IQ Plugin can initialize and set device and player info', function()
  {
    var plugin = createPlugin(framework);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.setDeviceInfoCalled).toBe(1);
    expect(unitTestState.setPlayerInfoCalled).toBe(1);
    expect(unitTestState.doNotTrack).toBe(false);
  });

  it('IQ Plugin can initialize and set device and player info when tracking level is set to ANONYMOUS', function()
  {
    OO.trackingLevel = OO.TRACKING_LEVEL.ANONYMOUS;
    var plugin = createPlugin(framework);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.setDeviceInfoCalled).toBe(1);
    expect(unitTestState.setPlayerInfoCalled).toBe(1);
    expect(unitTestState.doNotTrack).toBe(true);
  });

  it('IQ Plugin can initialize and set device and player info when tracking level is set to DISABLED', function()
  {
    OO.trackingLevel = OO.TRACKING_LEVEL.DISABLED;
    var plugin = createPlugin(framework);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.setDeviceInfoCalled).toBe(1);
    expect(unitTestState.setPlayerInfoCalled).toBe(1);
    expect(unitTestState.doNotTrack).toBe(true);
  });

  it('IQ Plugin should initialize media metadata and report player loaded', function()
  {

    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000,
      contentType: "Video",
      playerUrl: "http://ooyala.com/test",
      pcode: "testPcode",
      playerBrandingId: "testPlayerBrandingId",
      metadata: {
        autoPlay: false
      }
    });

    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportPlayerLoadCalled).toBe(1);
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.initializeMediaCalled).toBe(1);
    expect(unitTestState.setMediaDurationCalled).toBe(1);
    expect(unitTestState.mediaId).toBe("testEmbedCode");
    expect(unitTestState.contentType).toBe("ooyala");
    expect(unitTestState.duration).toBe(60000);
    expect(plugin.ooyalaReporter._base.pcode).toBe("testPcode");
  });

  it ('IQ Plugin should report pause', function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateVideoPause();

    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportPauseCalled).toBe(1);
  });

  it ('IQ Plugin should report resume', function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateContentPlayback();

    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportResumeCalled).toBe(1);
  });

  it ('IQ Plugin should report playback completed', function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulatePlaybackComplete();

    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCompleteCalled).toBe(1);
  });

  it ('IQ Plugin should report replay', function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateReplay();

    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportReplayCalled).toBe(1);
  });

  it ('IQ Plugin should report playhead updates', function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateVideoProgress({
      playheads : [1, 2, 3, 4, 5, 7.5, 10]
    });

    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportPlayHeadUpdateCalled).toBe(7);
  });

  it ('IQ Plugin should report ad quartiles', function()
  {
    var plugin = createPlugin(framework);
  
    var simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateAdBreakStarted();
    simulator.simulateVideoProgress({
      playheads : [15], totalStreamDuration: 60
    });

    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.eventMetadata.percent).toBe(0.25);
    expect(unitTestState.reportCustomEventCalled).toBe(2);

    simulator.simulateVideoProgress({
      playheads : [30], totalStreamDuration: 60
    });
    expect(unitTestState.eventMetadata.percent).toBe(0.50);
    expect(unitTestState.reportCustomEventCalled).toBe(3);

    simulator.simulateVideoProgress({
      playheads : [45], totalStreamDuration: 60
    });    
    expect(unitTestState.eventMetadata.percent).toBe(0.75);
    expect(unitTestState.reportCustomEventCalled).toBe(4);

    simulator.simulateVideoProgress({
      playheads : [60], totalStreamDuration: 60
    });
    expect(unitTestState.eventMetadata.percent).toBe(1.00);
    expect(unitTestState.reportCustomEventCalled).toBe(5);
  });

  it ('IQ Plugin should report plyback started updates', function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateWillPlayFromBeginning();

    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportPlaybackStartedCalled).toBe(1);
  });

  it ('IQ Plugin should report video buffering started updates', function()
  {
    var eventName = OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);

    var testPosition = 0;
    simulator.simulateVideoBufferingStarted({position : testPosition});

    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.position).toBe(testPosition);
  });

  it ('IQ Plugin should report initial play starting updates', function()
  {
    var eventName = OO.Analytics.EVENTS.INITIAL_PLAY_STARTING;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      playerCoreVersion : "v4", 
      timeSinceInitialPlay : 200, 
      autoplayed : false,
      hadPreroll : false,
      position : 0,
      plugin : "TestVideoPlugin",
      technology : "html5",
      encoding : "hls",
      streamUrl : "http://ooyala.test_stream_url.com",
      drm : "none",
      isLive : false
    };
    simulator.simulateInitialPlayStarting(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.playerCoreVersion).toBe(metadata.playerCoreVersion);
    expect(unitTestState.eventMetadata.timeSinceInitialPlay).toBe(metadata.timeSinceInitialPlay);
    expect(unitTestState.eventMetadata.autoplayed).toBe(metadata.autoplayed);
    expect(unitTestState.eventMetadata.hadPreroll).toBe(metadata.hadPreroll);
    expect(unitTestState.eventMetadata.position).toBe(metadata.position);
    expect(unitTestState.eventMetadata.plugin).toBe(metadata.plugin);
    expect(unitTestState.eventMetadata.technology).toBe(metadata.technology);
    expect(unitTestState.eventMetadata.encoding).toBe(metadata.encoding);
    expect(unitTestState.eventMetadata.streamUrl).toBe(metadata.streamUrl);
    expect(unitTestState.eventMetadata.drm).toBe(metadata.drm);
    expect(unitTestState.eventMetadata.isLive).toBe(metadata.isLive);
  });

  it ('IQ Plugin should report playback ready updates', function()
  {
    var eventName = OO.Analytics.EVENTS.PLAYBACK_READY;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      playerCoreVersion : "v4", 
      timeSincePlayerCreated : 100, 
      pluginList : ["Plugin1", "Plugin2"]
    };
    simulator.simulatePlaybackReady(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.playerCoreVersion).toBe(metadata.playerCoreVersion);
    expect(unitTestState.eventMetadata.timeSincePlayerCreated).toBe(metadata.timeSincePlayerCreated);
    expect(unitTestState.eventMetadata.pluginList).toBe(metadata.pluginList);
  });

  it ('IQ Plugin should report api rerrors', function()
  {
    var eventName = OO.Analytics.EVENTS.API_ERROR;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      playerCoreVersion : "v4", 
      errorCode : 100, 
      errorMessage : "Api Error Message",
      url : "http://ooyala.test"
    };
    simulator.simulateApiError(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.playerCoreVersion).toBe(metadata.playerCoreVersion);
    expect(unitTestState.eventMetadata.errorCode).toBe(metadata.errorCode);
    expect(unitTestState.eventMetadata.errorMessage).toBe(metadata.errorMessage);
    expect(unitTestState.eventMetadata.url).toBe(metadata.url);
  });

  it ('IQ Plugin should report initial bitrate update', function()
  {
    var eventName = OO.Analytics.EVENTS.BITRATE_INITIAL;
    var testBitrate = 1000;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateBitrateInitial({bitrate : testBitrate});
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.bitrate).toBe(testBitrate);
  });

  it ('IQ Plugin should report five second bitrate update', function()
  {
    var eventName = OO.Analytics.EVENTS.BITRATE_FIVE_SEC;
    var testBitrate = 2000;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateBitrateFiveSec({bitrate : testBitrate});
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.bitrate).toBe(testBitrate);
  });

  it ('IQ Plugin should report stable bitrate update', function()
  {
    var eventName = OO.Analytics.EVENTS.BITRATE_STABLE;
    var testBitrate = 4000;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateBitrateStable({bitrate : testBitrate});
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.bitrate).toBe(testBitrate);
  });

  it ('IQ Plugin should report playback start errors', function()
  {
    var eventName = OO.Analytics.EVENTS.PLAYBACK_START_ERROR;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      errorCodes : { ooyalaErrorCode: 1}, 
      errorMessages : { ooyalaErrorMessage : "ErrorMessage"}, 
      drm: {}
    };
    simulator.simulatePlaybackStartError(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.errorCodes).toBe(metadata.errorCodes);
    expect(unitTestState.eventMetadata.errorMessages).toBe(metadata.errorMessages);
    expect(unitTestState.eventMetadata.drm).toBe(metadata.drm);
  });

    it ('IQ Plugin should report playback midstream errors', function()
  {
    var eventName = OO.Analytics.EVENTS.PLAYBACK_MIDSTREAM_ERROR;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      errorCodes : { ooyalaErrorCode: 1}, 
      errorMessages : { ooyalaErrorMessage: "ErrorMessage"}, 
      position : 20
    };
    simulator.simulatePlaybackMidstreamError(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.errorCodes).toBe(metadata.errorCodes);
    expect(unitTestState.eventMetadata.errorMessages).toBe(metadata.errorMessages);
    expect(unitTestState.eventMetadata.position).toBe(metadata.position);
  });

  it ('IQ Plugin should report plugin loaded update', function()
  {
    var eventName = OO.Analytics.EVENTS.PLUGIN_LOADED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      playerCoreVersion : "v4", 
      pluginType : "Video", 
      pluginName : "TestPlugin",
      loadTime : 120
    };
    simulator.simulatePluginLoaded(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.playerCoreVersion).toBe(metadata.playerCoreVersion);
    expect(unitTestState.eventMetadata.pluginType).toBe(metadata.pluginType);
    expect(unitTestState.eventMetadata.pluginName).toBe(metadata.pluginName);
    expect(unitTestState.eventMetadata.loadTime).toBe(metadata.loadTime);
  });

  it ('IQ Plugin should report ad request update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_REQUEST;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      adPosition : 0, 
      adPluginName : "google-ima"
    };
    simulator.simulateAdRequest(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adPosition).toBe(metadata.adPosition);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
  });

  it ('IQ Plugin should report ad request success update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_REQUEST_SUCCESS;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      adPosition : 0, 
      adPluginName : "google-ima",
      responseTime : 100,
      timeSinceInitialPlay : 200
    };
    simulator.simulateAdRequestSuccess(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adPosition).toBe(metadata.adPosition);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.responseTime).toBe(metadata.responseTime);
    expect(unitTestState.eventMetadata.timeSinceInitialPlay).toBe(metadata.timeSinceInitialPlay);
  });

  it ('IQ Plugin should report ad sdk loaded update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_SDK_LOADED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      playerCoreVersion : "v4", 
      adPluginName : "google-ima"
    };
    simulator.simulateAdSdkLoaded(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.playerCoreVersion).toBe(metadata.playerCoreVersion);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
  });

  it ('IQ Plugin should report ad sdk load error', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_SDK_LOAD_FAILURE;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      playerCoreVersion : "v4", 
      adPluginName : "google-ima",
      errorMessage : "Test Errror"
    };
    simulator.simulateAdSdkLoadFailure(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.playerCoreVersion).toBe(metadata.playerCoreVersion);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.errorMessage).toBe(metadata.errorMessage);
  });

  it ('IQ Plugin should report ad break started update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_BREAK_STARTED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateAdBreakStarted();
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
  });

  it ('IQ Plugin should report ad break ended update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_BREAK_ENDED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateAdBreakEnded();
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
  });

  it ('IQ Plugin should report ad pod started update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_POD_STARTED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      numberOfAds : 3
    };
    simulator.simulateAdPodStarted(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.numberOfAds).toBe(metadata.numberOfAds);
  });

  it ('IQ Plugin should report ad pod ended update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_POD_ENDED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      adId : "Google IMA"
    };
    simulator.simulateAdPodEnded(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adId).toBe(metadata.adId);
  });

  it ('IQ Plugin should report ad started update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_STARTED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = 
                  { adType : "linearOverlay", 
                    adMetadata : 
                    { adId : "Google IMA",
                      adDuration : 30,
                      adPodPosition : 0
                    } 
                  };
    simulator.simulateAdPlayback(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adType).toBe(metadata.adType);
    expect(unitTestState.eventMetadata.adMetadata.adId).toBe(metadata.adMetadata.adId);
    expect(unitTestState.eventMetadata.adMetadata.adDuration).toBe(metadata.adMetadata.adDuration);
    expect(unitTestState.eventMetadata.adMetadata.adPodPosition).toBe(metadata.adMetadata.adPodPosition);
  });

  it ('IQ Plugin should report ad ended update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_ENDED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = { adType : "linearOverlay", 
                     adId : "Google IMA"
                   };
    simulator.simulateAdComplete(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adType).toBe(metadata.adType);
    expect(unitTestState.eventMetadata.adId).toBe(metadata.adId);
  });

  it ('IQ Plugin should report ad skipped update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_SKIPPED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {};
    simulator.simulateAdSkipped(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
  });

  it ('IQ Plugin should report ad error', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_ERROR;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {error : "Test Error"};
    simulator.simulateAdError(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.error.error).toBe(metadata.error);
  });

  it ('IQ Plugin should report ad request empty', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_REQUEST_EMPTY;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      adPosition : 0, 
      adPluginName : "google-ima",
      adTagUrl : "http://test_ad_tag_url.com",
      errorCodes : {vastErrorCode : 1000,
                    errorCode : 400
                   },
      errorMessage : "Test Error"
    };
    simulator.simulateAdRequestEmpty(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adPosition).toBe(metadata.adPosition);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.adTagUrl).toBe(metadata.adTagUrl);
    expect(unitTestState.eventMetadata.errorCodes.errorCode).toBe(metadata.errorCodes.errorCode);
    expect(unitTestState.eventMetadata.errorCodes.vastErrorCode).toBe(metadata.errorCodes.vastErrorCode);
    expect(unitTestState.eventMetadata.errorMessage).toBe(metadata.errorMessage);
  });

  it ('IQ Plugin should report ad request error', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_REQUEST_ERROR;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      adPosition : 0, 
      adPluginName : "google-ima",
      adTagUrl : "http://test_ad_tag_url.com",
      errorCodes : {vastErrorCode : 1000,
                    errorCode : 400
                   },
      errorMessage : "Test Error",
      isTimeout : false
    };
    simulator.simulateAdRequestError(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adPosition).toBe(metadata.adPosition);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.adTagUrl).toBe(metadata.adTagUrl);
    expect(unitTestState.eventMetadata.errorCodes.errorCode).toBe(metadata.errorCodes.errorCode);
    expect(unitTestState.eventMetadata.errorCodes.vastErrorCode).toBe(metadata.errorCodes.vastErrorCode);
    expect(unitTestState.eventMetadata.errorMessage).toBe(metadata.errorMessage);
    expect(unitTestState.eventMetadata.isTimeout).toBe(metadata.isTimeout);
  });

  it ('IQ Plugin should report ad playback error', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_PLAYBACK_ERROR;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      adPosition : 0, 
      adPluginName : "google-ima",
      adTagUrl : "http://test_ad_tag_url.com",
      errorCodes : {vastErrorCode : 1000,
                    errorCode : 400
                   },
      errorMessage : "Test Error",
      videoPluginList : ["bitwrapper", "main"],
      mediaFileUrl : "http://test_media_url.com"
    };
    simulator.simulateAdPlayBackError(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adPosition).toBe(metadata.adPosition);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.adTagUrl).toBe(metadata.adTagUrl);
    expect(unitTestState.eventMetadata.errorCodes.errorCode).toBe(metadata.errorCodes.errorCode);
    expect(unitTestState.eventMetadata.errorCodes.vastErrorCode).toBe(metadata.errorCodes.vastErrorCode);
    expect(unitTestState.eventMetadata.errorMessage).toBe(metadata.errorMessage);
    expect(unitTestState.eventMetadata.videoPluginList).toBe(metadata.videoPluginList);
    expect(unitTestState.eventMetadata.mediaFileUrl).toBe(metadata.mediaFileUrl);
  });

  it ('IQ Plugin should report ad impression update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_IMPRESSION;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateAdImpression();
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
  });

  it ('IQ Plugin should report ad sdk impression update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_SDK_IMPRESSION;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      adPosition : 0, 
      adPluginName : "google-ima",
      adLoadTime : 100,
      adProtocol : "VAST",
      adType : "linearOverlay"
    };
    simulator.simulateAdSdkImpression(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adPosition).toBe(metadata.adPosition);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.adLoadTime).toBe(metadata.adLoadTime);
    expect(unitTestState.eventMetadata.adProtocol).toBe(metadata.adProtocol);
    expect(unitTestState.eventMetadata.adType).toBe(metadata.adType);
  });

  it ('IQ Plugin should report ad completed update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_COMPLETED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      adPluginName : "google-ima",
      timeSinceImpression : 100,
      skipped : false,
      adTagUrl : "http://test_ad_tag_url.com"
    };
    simulator.simulateAdCompleted(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.timeSinceImpression).toBe(metadata.timeSinceImpression);
    expect(unitTestState.eventMetadata.skipped).toBe(metadata.skipped);
    expect(unitTestState.eventMetadata.adTagUrl).toBe(metadata.adTagUrl);
  });

  it ('IQ Plugin should report ad clickthrough opened update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_CLICKTHROUGH_OPENED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateAdClickthroughOpened();
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
  });

  it ('IQ Plugin should report ad clicked update', function()
  {
    var eventName = OO.Analytics.EVENTS.AD_CLICKED;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateAdClicked();
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
  });

  it ('IQ Plugin should report sdk ad event update', function()
  {
    var eventName = OO.Analytics.EVENTS.SDK_AD_EVENT;
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var imaEvent = "ima-event";
    var metadata = {
      adPluginName : "google-ima",
      adEventName : imaEvent,
      adEventData : { adId : "1234567"},
    };
    simulator.simulateSdkAdEvent(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName + ":" + imaEvent);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.adEventData.adId).toBe(metadata.adEventData.adId);
  });

  it ('IQ Plugin should report discovery asset impression update', function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      "asset" : {"id" : "abcd", "idType": "ooyala", "ooyalaDiscoveryContext":"/abcdefg/"},
      "pageSize" : 1,
      "assetPosition" : 1,
      "uiTag" : "test",
      "contentSource" : "discovery",
      "customData": {}
    };
    simulator.simulateDiscoveryAssetImpression(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;

    expect(unitTestState.reportAssetImpressionCalled).toBe(1);
    expect(unitTestState.asset).toBe(metadata.asset);
    expect(unitTestState.pageSize).toBe(metadata.pageSize);
    expect(unitTestState.assetPosition).toBe(metadata.assetPosition);
    expect(unitTestState.uiTag).toBe(metadata.uiTag);
    expect(unitTestState.contentSource).toBe(metadata.contentSource);
    expect(unitTestState.customData).toBe(metadata.customData);
  });

  it ('IQ Plugin should report discovery asset click update', function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var metadata = {
      "asset" : {"id" : "abcd", "idType": "ooyala", "ooyalaDiscoveryContext":"/abcdefg/"},
      "pageSize" : 1,
      "assetPosition" : 1,
      "uiTag" : "test",
      "contentSource" : "discovery",
      "customData": {"autoplay":false}
    };
    simulator.simulateDiscoveryAssetClick(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;

    expect(unitTestState.reportAssetClickCalled).toBe(1);
    expect(unitTestState.asset).toBe(metadata.asset);
    expect(unitTestState.pageSize).toBe(metadata.pageSize);
    expect(unitTestState.assetPosition).toBe(metadata.assetPosition);
    expect(unitTestState.uiTag).toBe(metadata.uiTag);
    expect(unitTestState.contentSource).toBe(metadata.contentSource);
    expect(unitTestState.customData).toBe(metadata.customData);
  });

  it ('IQ Plugin should report seek', function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateVideoProgress({
      playheads: [1]
    });

    simulator.simulateVideoSeek({
      timeSeekedTo: 10
    });

    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportPlayHeadUpdateCalled).toBe(1);
    expect(unitTestState.reportSeekCalled).toBe(1);
    expect(unitTestState.currentPlayheadPosition).toBe(1000);
    expect(unitTestState.seekedPlayheadPosition).toBe(10000);
  });

  it ('IQ Plugin should report play requested', function()
  {
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000,
      contentType: "Video",
      pcode: "testPcode",
      playerBrandingId: "testPlayerBrandingId",
      metadata: {
        autoPlay: false
      }
    });
    simulator.simulatePlayerStart();

    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportPlayRequestedCalled).toBe(1);
    expect(plugin.getAutoPlay()).toBe(false);
  });

  it('IQ Plugin should enable iq reporting when provider metadata is received', function()
  {
    var oldMetadata = {
      "metadata":
      {
        "enabled": false
      }
    };
    var newMetadata = {
      "modules": 
      {
        "iq": 
        {
          "metadata": 
          {
            "enabled" : true
          }
        }
      }
    };

    var plugin = createPlugin(framework);
    plugin.setMetadata(oldMetadata);
    var simulator = Utils.createPlaybackSimulator(plugin);

    expect(plugin.getIqEnabled()).toBe(false);
    simulator.simulateStreamMetadataUpdated(newMetadata);
    expect(plugin.getIqEnabled()).toBe(true);
  });

  it('IQ Plugin should not report events if disabled', function()
  {
    var metadata = {
      "metadata":
      {
        "enabled": false
      }
    };
    var plugin = createPlugin(framework);
    plugin.setMetadata(metadata);
    expect(plugin.getIqEnabled()).toBe(false);
    var simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateVideoPause();
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportPauseCalled).toBe(0);
  });

  it('IQ Plugin should not report duplicate events if allowThrift is true', function()
  {
    var metadata = {
      "metadata":
      {
        "allowThrift" : true,
        "enabled" : true
      }
    };
    var plugin = createPlugin(framework);
    plugin.setMetadata(metadata);
    expect(plugin.getIqEnabled()).toBe(true);
    expect(plugin.getAllowThrift()).toBe(true);
    var simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateReplay();
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000,
      contentType: "Video",
      pcode: "testPcode",
      playerBrandingId: "testPlayerBrandingId",
      metadata: {
        autoPlay: false
      }
    });
    simulator.simulateWillPlayFromBeginning();
    simulator.simulatePlayerStart();
    simulator.simulateVideoProgress({
      playheads : [1, 2, 3, 4, 5, 7.5, 10]
    });
    var metadata = {
      "asset" : {"id" : "abcd", "idType": "ooyala", "ooyalaDiscoveryContext":"/abcdefg/"},
      "pageSize" : 1,
      "assetPosition" : 1,
      "uiTag" : "test",
      "contentSource" : "discovery",
      "customData": {"autoplay":false}
    };

    simulator.simulateDiscoveryAssetClick(metadata);
    simulator.simulateDiscoveryAssetImpression(metadata);
    var unitTestState = plugin.ooyalaReporter.unitTestState;
    expect(unitTestState.reportReplayCalled).toBe(0);
    expect(unitTestState.reportPlayerLoadCalled).toBe(0);
    expect(unitTestState.reportPlayRequestedCalled).toBe(0);
    expect(unitTestState.reportPlaybackStartedCalled).toBe(0);
    expect(unitTestState.reportPlayHeadUpdateCalled).toBe(0);
    expect(unitTestState.reportAssetImpressionCalled).toBe(0);
    expect(unitTestState.reportAssetClickCalled).toBe(0);
  });
});

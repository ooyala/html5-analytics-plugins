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
              setPlayerInfoCalled: 0,
              seekedPlayheadPosition: null,
              currentPlayheadPosition: null,
              initializeMediaCalled: 0,
              setMediaDurationCalled: 0,
              reportPlayerLoadCalled: 0,
              reportPlayRequestedCalled: 0,
              reportPauseCalled: 0,
              reportPlayHeadUpdateCalled: 0,
              reportSeekCalled: 0,
              reportCompleteCalled: 0,
              reportReplayCalled: 0,
            },

            setDeviceInfo: function() {
              this.unitTestState.setDeviceInfoCalled++;
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
            reportPlayRequested: function() {
              this.unitTestState.reportPlayRequestedCalled++;
            },
            reportPause: function() {
              this.unitTestState.reportPauseCalled++;
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
            reportCustomEvent: function() {
              this.unitTestState.reportCustomEventCalled++;
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
    var iqPluginFactory = require(SRC_ROOT + "plugins/iq.js");
    var plugin = new iqPluginFactory(framework);
    plugin.testMode = true;
    plugin.init();
    //plugin.setMetadata({});
    return plugin;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  it('Test IQ Plugin Validity', function()
  {
    var iqPluginFactory = require(SRC_ROOT + "plugins/iq.js");
    expect(iqPluginFactory).not.toBeNull();
    var plugin = new iqPluginFactory();
    expect(framework.validatePlugin(plugin)).toBe(true);
  });

  it('Test IQ Plugin Validity', function()
  {
    var iqPluginFactory = require(SRC_ROOT + "plugins/iq.js");
    var pluginID = framework.registerPlugin(iqPluginFactory);
    expect(pluginID).toBeDefined();
    var pluginList = framework.getPluginIDList();
    expect(_.contains(pluginList, pluginID));
    expect(framework.makePluginInactive(pluginID)).toBe(true);
    expect(framework.makePluginActive(pluginID)).toBe(true);
  });

  it('Test Auto Registering IQ Plugin', function()
  {
      var iqPlugin = require(SRC_ROOT + "plugins/iq.js");
      var pluginList = framework.getPluginIDList();
      expect(pluginList.length).toBe(1);

      var pluginID = pluginList[0];
      expect(pluginID).not.toBeFalsy();
      expect(pluginID && _.isString(pluginID)).toBe(true);
      expect(framework.isPluginActive(pluginID)).toBe(true);

      //test registering it again
      pluginID2 = framework.registerPlugin(iqPlugin);
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
    var iqPluginFactory = require(SRC_ROOT + "plugins/iq.js");
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

  it('Test IQ Plugin Created Before Framework', function()
  {
    //erase the global references for the plugins and frameworks.
    OO.Analytics.PluginFactoryList = null;
    OO.Analytics.FrameworkInstanceList = null;
    var iqPluginFactory = require(SRC_ROOT + "plugins/iq.js");
    expect(OO.Analytics.PluginFactoryList).toBeTruthy();
    expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
    expect(OO.Analytics.FrameworkInstanceList).toBeTruthy();
    expect(OO.Analytics.FrameworkInstanceList.length).toEqual(0);
  });

  it('Test Setting Metadata and Processing An Event', function()
  {
    var metadataRecieved = null;
    var eventProcessed = null;
    var paramsReceived = null;
    var iqPluginFactory = require(SRC_ROOT + "plugins/iq.js");
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
    var iqPluginFactory = require(SRC_ROOT + "plugins/iq.js");
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
    var iqPluginFactory = require(SRC_ROOT + "plugins/iq.js");
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
    var iqPluginFactory = require(SRC_ROOT + "plugins/iq.js");
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
    //expect(unitTestState.reportPlayerLoadCalled).toBe(1);
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
      playheads: [1, 2, 3, 4, 5, 7.5, 10]
    });

    var unitTestState = plugin.ooyalaReporter.unitTestState;
    // Temporarily disable this check
    //expect(unitTestState.reportPlayHeadUpdateCalled).toBe(7);
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
    // Temporarily disable this check
    //expect(unitTestState.reportPlayHeadUpdateCalled).toBe(1);
    expect(unitTestState.reportSeekCalled).toBe(1);
    // Temporarily disable this check
    //expect(unitTestState.currentPlayheadPosition).toBe(1000);
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
    // Temporarily disable this check
    //expect(unitTestState.reportPlayRequestedCalled).toBe(1);
    // Temporarily disable this check until we resolve autoplay
    //expect(plugin.getAutoPlay()).toBe(false);
  });

});

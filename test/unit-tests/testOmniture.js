/* eslint-disable global-require,require-jsdoc,import/no-dynamic-require */
describe('Analytics Framework Omniture Plugin Unit Tests', () => {
  jest.autoMockOff();
  require('../unit-test-helpers/mock_adobe.js');
  require(`${SRC_ROOT}framework/AnalyticsFramework.js`);
  //  require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  require(`${TEST_ROOT}unit-test-helpers/AnalyticsFrameworkTestUtils.js`);
  require(`${COMMON_SRC_ROOT}utils/InitModules/InitOOUnderscore.js`);
  const OmniturePluginFactory = require(`${SRC_ROOT}plugins/omniture.js`);

  const { Analytics } = OO;
  const { Utils } = OO.Analytics;
  const { _ } = OO;
  let framework;

  const playerName = 'Ooyala V4';


  /**
   * Setup for individual tests.
   */
  const testSetup = function () {
    framework = new Analytics.Framework();
    // mute the logging because there will be lots of error messages
    OO.log = function () {};
  };

  /**
   * Cleanup for individual tests.
   */
  const testCleanup = function () {
    OO.Analytics.PluginFactoryList = [];
    OO.Analytics.FrameworkInstanceList = [];
    resetGlobalInstances();
    // return log back to normal
    //    OO.log = console.log;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  // helpers
  // eslint-disable-next-line
  const createPlugin = function (framework, metadata) {
    let metadataNew = metadata;
    if (!metadata) {
      metadataNew = {
        marketingCloudOrgId: '2A5D3BC75244638C0A490D4D@AdobeOrg',
        visitorTrackingServer: 'ovppartners.sc.omtrdc.net',
        appMeasurementTrackingServer: 'ovppartners.sc.omtrdc.net',
        reportSuiteId: 'ovppooyala',
        pageName: 'Test Page Name',
        visitorId: 'test-vid',
        debug: true,
        channel: 'Test Heartbeat Channel', // optional
        heartbeatTrackingServer: 'ovppartners.hb.omtrdc.net',
        heartbeatSSL: false,
        publisherId: 'ooyalatester',
        props: {
          prop1: 'espn',
          prop25: 'football',
        },
        eVars: {
          eVar9: 'en',
        },
      };
    }
    const plugin = new OmniturePluginFactory(framework);
    plugin.init();
    plugin.setMetadata(metadataNew);
    return plugin;
  };

  it('Test Omniture Plugin Validity', () => {
    expect(OmniturePluginFactory).not.toBeNull();
    const plugin = new OmniturePluginFactory(framework);
    expect(framework.validatePlugin(plugin)).toBe(true);
  });

  // it('Test Auto Registering Template', function()
  // {
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
  // });
  //
  it('Test Omniture Plugin Validity', () => {
    const pluginID = framework.registerPlugin(OmniturePluginFactory);
    expect(pluginID).toBeDefined();
    const pluginList = framework.getPluginIDList();
    expect(_.contains(pluginList, pluginID));
    expect(framework.makePluginInactive(pluginID)).toBe(true);
    expect(framework.makePluginActive(pluginID)).toBe(true);
  });
  //
  //
  // it('Test Template Mixed Loading Templates and Frameworks Delayed', function()
  // {
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
  // });
  //
  // it('Test Template Created Before Framework', function()
  // {
  //  //erase the global references for the plugins and frameworks.
  //  OO.Analytics.PluginFactoryList = null;
  //  OO.Analytics.FrameworkInstanceList = null;
  //  var templatePluginFactory = require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  //  expect(OO.Analytics.PluginFactoryList).toBeTruthy();
  //  expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
  //  expect(OO.Analytics.FrameworkInstanceList).toBeTruthy();
  //  expect(OO.Analytics.FrameworkInstanceList.length).toEqual(0);
  // });
  //
  it('Test Setting Metadata and Processing An Event', () => {
    let metadataReceived = null;
    let eventProcessed = null;
    let paramsReceived = null;
    const newFactoryWithFunctionTracing = function () {
      const factory = new OmniturePluginFactory();
      factory.setMetadata = function (metadata) {
        metadataReceived = metadata;
      };
      factory.processEvent = function (eventName, params) {
        eventProcessed = eventName;
        paramsReceived = params;
      };
      return factory;
    };
    framework.registerPlugin(newFactoryWithFunctionTracing);
    const metadata = {
      omniture:
      {
        data: 'mydata',
      },
    };
    framework.setPluginMetadata(metadata);
    expect(metadataReceived).toEqual(metadata.omniture);
    framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PAUSED, [metadata]);
    expect(eventProcessed).toEqual(OO.Analytics.EVENTS.VIDEO_PAUSED);
    expect(paramsReceived).toEqual([metadata]);
  });

  it('Test Framework Destroy With Template', () => {
    OO.Analytics.RegisterPluginFactory(OmniturePluginFactory);
    let pluginList = framework.getPluginIDList();
    expect(pluginList.length).toEqual(1);
    expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
    expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
    framework.destroy();

    pluginList = framework.getPluginIDList();
    expect(pluginList.length).toEqual(0);
    expect(OO.Analytics.FrameworkInstanceList.length).toEqual(0);
    expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
  });

  // it('Test Framework Destroy With Template And Multi Frameworks', function()
  // {
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
  // });

  it('Test all functions', () => {
    const plugin = createPlugin(framework);
    let errorOccured = false;
    try {
      Object
        .entries(plugin)
        .forEach(([, key]) => {
          if (OO._.isFunction(plugin[key])) {
            plugin[key].apply();
          }
        });
    } catch (e) {
      errorOccured = true;
    }

    expect(errorOccured).toBe(false);
  });

  // new
  it('Delegate can provide valid Video Info', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'abcde',
      title: 'testTitle',
      duration: 20000,
    });
    simulator.simulateVideoProgress({
      playheads: [10],
    });
    const delegate = plugin.getPlayerDelegate();
    const videoInfo = delegate.getVideoInfo();
    expect(videoInfo.id).toBe('abcde');
    expect(videoInfo.name).toBe('testTitle');
    expect(videoInfo.length).toBe(20);
    expect(videoInfo.playerName).toBe(playerName);
    expect(videoInfo.playhead).toBe(10);
  });
  it('Delegate can provide Video Info with VOD as the default streamType', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'abcde',
      title: 'testTitle',
      duration: 20000,
    });
    simulator.simulateVideoProgress({
      playheads: [10],
    });
    const delegate = plugin.getPlayerDelegate();
    const videoInfo = delegate.getVideoInfo();
    expect(videoInfo.id).toBe('abcde');
    expect(videoInfo.name).toBe('testTitle');
    expect(videoInfo.streamType).toBe(ADB.va.plugins.videoplayer.AssetType.ASSET_TYPE_VOD);
    expect(videoInfo.length).toBe(20);
    expect(videoInfo.playerName).toBe(playerName);
    expect(videoInfo.playhead).toBe(10);
  });
  it('Delegate can provide Video Info with VOD as the streamType', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'abcde',
      title: 'testTitle',
      streamType: OO.Analytics.STREAM_TYPE.VOD,
      duration: 20000,
    });
    simulator.simulateVideoProgress({
      playheads: [10],
    });
    const delegate = plugin.getPlayerDelegate();
    const videoInfo = delegate.getVideoInfo();
    expect(videoInfo.id).toBe('abcde');
    expect(videoInfo.name).toBe('testTitle');
    expect(videoInfo.streamType).toBe(ADB.va.plugins.videoplayer.AssetType.ASSET_TYPE_VOD);
    expect(videoInfo.length).toBe(20);
    expect(videoInfo.playerName).toBe(playerName);
    expect(videoInfo.playhead).toBe(10);
  });

  it('Delegate can provide Video Info with LIVE as the streamType', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'abcde',
      title: 'testTitle',
      streamType: OO.Analytics.STREAM_TYPE.LIVE_STREAM,
      duration: 20000,
    });
    simulator.simulateVideoProgress({
      playheads: [10],
    });
    const delegate = plugin.getPlayerDelegate();
    const videoInfo = delegate.getVideoInfo();
    expect(videoInfo.id).toBe('abcde');
    expect(videoInfo.name).toBe('testTitle');
    expect(videoInfo.streamType).toBe(ADB.va.plugins.videoplayer.AssetType.ASSET_TYPE_LIVE);
    expect(videoInfo.length).toBe(20);
    expect(videoInfo.playerName).toBe(playerName);
    expect(videoInfo.playhead).toBe(10);
  });

  it('Delegate can provide valid Ad Break Info', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateVideoProgress({
      playheads: [10],
    });
    simulator.simulateAdBreakStarted();
    const delegate = plugin.getPlayerDelegate();
    const adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(1);
    expect(adBreakInfo.startTime).toBe(10);
  });

  it('Delegate can provide valid Ad Info', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'zyxw',
        adDuration: 15,
        adPodPosition: 1,
      },
    });
    const delegate = plugin.getPlayerDelegate();
    const adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe('zyxw');
    expect(adInfo.length).toBe(15);
    expect(adInfo.position).toBe(1);
  });

  it('Delegate does not provide ad info if not in ad playback', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'zyxw',
        adDuration: 15,
        adPodPosition: 1,
      },
    });
    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'adId',
    });
    const delegate = plugin.getPlayerDelegate();
    const adInfo = delegate.getAdInfo();
    expect(adInfo).toBe(null);
  });

  it('Delegate does not provide ad break info if not in ad break', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateVideoProgress({
      playheads: [10],
    });
    simulator.simulateAdBreakStarted();
    simulator.simulateAdBreakEnded();
    const delegate = plugin.getPlayerDelegate();
    const adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo).toBe(null);
  });


  it('Omniture Video Plugin can trackSessionStart', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    let called = 0;
    plugin.omnitureVideoPlayerPlugin.trackSessionStart = function () {
      called += 1;
    };
    simulator.simulatePlayerStart();
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackPlay', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    let called = 0;
    plugin.omnitureVideoPlayerPlugin.trackPlay = function () {
      called += 1;
    };
    simulator.simulateContentPlayback();
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackVideoLoad', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    let called = 0;
    plugin.omnitureVideoPlayerPlugin.trackVideoLoad = function () {
      called += 1;
    };
    simulator.simulatePlayerStart();
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin does not trackVideoLoad if we are resuming playback from a pause', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    let videoLoadCalled = 0;
    let playCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackVideoLoad = function () {
      videoLoadCalled += 1;
    };
    plugin.omnitureVideoPlayerPlugin.trackPlay = function () {
      playCalled += 1;
    };
    simulator.simulatePlayerStart();
    simulator.simulateContentPlayback();
    simulator.simulateVideoPause();
    simulator.simulateContentPlayback();
    expect(videoLoadCalled).toBe(1);
    expect(playCalled).toBe(2);
  });

  it('Omniture Video Plugin can trackPause', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    let called = 0;
    plugin.omnitureVideoPlayerPlugin.trackPause = function () {
      called += 1;
    };
    simulator.simulateVideoPause();
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackSeekStart', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    let called = 0;
    plugin.omnitureVideoPlayerPlugin.trackSeekStart = function () {
      called += 1;
    };
    simulator.simulateContentPlayback();
    simulator.simulateVideoSeek();
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackSeekComplete', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    let called = 0;
    plugin.omnitureVideoPlayerPlugin.trackSeekComplete = function () {
      called += 1;
    };
    simulator.simulateContentPlayback();
    simulator.simulateVideoSeek();
    simulator.simulateVideoProgress({
      playheads: [10],
    });
    expect(called).toBe(1);
    const delegate = plugin.getPlayerDelegate();
    const videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(10);
  });

  it('Omniture Video Plugin can trackComplete', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    let called = 0;
    plugin.omnitureVideoPlayerPlugin.trackComplete = function () {
      called += 1;
    };
    simulator.simulateContentComplete({
      streamPosition: 60,
    });
    simulator.simulatePlaybackComplete();
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackVideoUnload', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    let called = 0;
    plugin.omnitureVideoPlayerPlugin.trackVideoUnload = function () {
      called += 1;
    };
    simulator.simulateContentComplete({
      streamPosition: 60,
    });
    simulator.simulatePlaybackComplete();
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackAdStart', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    let called = 0;
    plugin.omnitureVideoPlayerPlugin.trackAdStart = function () {
      called += 1;
    };
    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'zyxw',
        adDuration: 15,
        adPodPosition: 1,
      },
    });
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can trackAdComplete', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    let called = 0;
    plugin.omnitureVideoPlayerPlugin.trackAdComplete = function () {
      called += 1;
    };
    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'adId',
    });
    expect(called).toBe(1);
  });

  it('Omniture Video Plugin can track all events in a typical playback', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const delegate = plugin.getPlayerDelegate();

    let adStartCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackAdStart = function () {
      adStartCalled += 1;
    };

    let adCompleteCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackAdComplete = function () {
      adCompleteCalled += 1;
    };

    let sessionStartCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackSessionStart = function () {
      sessionStartCalled += 1;
    };

    let videoLoadCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackVideoLoad = function () {
      videoLoadCalled += 1;
    };

    let playCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackPlay = function () {
      playCalled += 1;
    };

    let pauseCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackPause = function () {
      pauseCalled += 1;
    };

    let seekStartCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackSeekStart = function () {
      seekStartCalled += 1;
    };

    let seekCompleteCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackSeekComplete = function () {
      seekCompleteCalled += 1;
    };

    let completeCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackComplete = function () {
      completeCalled += 1;
    };

    let videoUnloadCalled = 0;
    plugin.omnitureVideoPlayerPlugin.trackVideoUnload = function () {
      videoUnloadCalled += 1;
    };

    const clearCounts = function () {
      videoUnloadCalled = 0;
      completeCalled = 0;
      seekCompleteCalled = 0;
      seekStartCalled = 0;
      pauseCalled = 0;
      playCalled = 0;
      sessionStartCalled = 0;
      videoLoadCalled = 0;
      adCompleteCalled = 0;
      adStartCalled = 0;
    };

    simulator.addPreSimulateCallback(clearCounts);

    let videoInfo; let adBreakInfo; let
      adInfo;

    // initialization
    simulator.simulatePlayerLoad({
      embedCode: 'abcde',
      title: 'testTitle',
      duration: 20000,
    });
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.name).toBe('testTitle');
    expect(videoInfo.length).toBe(20);
    expect(videoInfo.id).toBe('abcde');

    // user clicks play
    simulator.simulatePlayerStart();
    expect(videoLoadCalled).toBe(1);
    expect(sessionStartCalled).toBe(1);

    // preroll
    simulator.simulateAdBreakStarted();
    adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(1);
    expect(adBreakInfo.startTime).toBe(0);

    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'preroll',
        adDuration: 15,
        adPodPosition: 1,
      },
    });
    // the preroll adds another trackPlay call
    expect(playCalled).toBe(1);

    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe('preroll');
    expect(adInfo.length).toBe(15);
    expect(adInfo.position).toBe(1);
    expect(adStartCalled).toBe(1);

    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'preroll',
    });
    expect(adCompleteCalled).toBe(1);
    simulator.simulateAdBreakEnded();

    // main content

    simulator.simulateContentPlayback();
    expect(playCalled).toBe(1);

    simulator.simulateVideoPause();
    expect(pauseCalled).toBe(1);

    simulator.simulateContentPlayback();
    expect(playCalled).toBe(1);

    simulator.simulateVideoSeek();
    expect(seekStartCalled).toBe(1);
    expect(seekCompleteCalled).toBe(1);

    simulator.simulateVideoProgress({
      playheads: [9],
    });
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(9);

    // midroll - podded of 2
    simulator.simulateVideoProgress({
      playheads: [10],
    });
    simulator.simulateAdBreakStarted();
    adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(2);
    expect(adBreakInfo.startTime).toBe(10);

    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'midroll',
        adDuration: 15,
        adPodPosition: 1,
      },
    });
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe('midroll');
    expect(adInfo.length).toBe(15);
    expect(adInfo.position).toBe(1);
    expect(adStartCalled).toBe(1);

    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'midroll',
    });
    expect(adCompleteCalled).toBe(1);

    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'midroll2',
        adDuration: 5,
        adPodPosition: 2,
      },
    });
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe('midroll2');
    expect(adInfo.length).toBe(5);
    expect(adInfo.position).toBe(2);
    expect(adStartCalled).toBe(1);

    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'midroll2',
    });
    expect(adCompleteCalled).toBe(1);
    simulator.simulateAdBreakEnded();

    // main content resumes
    simulator.simulateContentPlayback();
    expect(playCalled).toBe(1);

    // TODO: Should completed message go before postroll?
    // postroll
    simulator.simulateContentComplete({
      streamPosition: 60,
    });
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(60);

    simulator.simulateAdBreakStarted();
    adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(3);
    expect(adBreakInfo.startTime).toBe(60);

    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'postroll',
        adDuration: 30,
        adPodPosition: 1,
      },
    });
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe('postroll');
    expect(adInfo.length).toBe(30);
    expect(adInfo.position).toBe(1);
    expect(adStartCalled).toBe(1);

    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'postroll',
    });
    expect(adCompleteCalled).toBe(1);
    simulator.simulateAdBreakEnded();

    // main video ends
    simulator.simulateContentComplete({
      streamPosition: 60,
    });
    simulator.simulatePlaybackComplete();
    expect(completeCalled).toBe(1);
    expect(videoUnloadCalled).toBe(1);

    // replay
    simulator.simulateReplay();
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(0);

    expect(videoLoadCalled).toBe(1);
    expect(sessionStartCalled).toBe(1);
  });

  // TODO: This only tests for function coverage of the Fake Video Plugin
  it('Omniture Video Plugin can track all events in a typical playback without mocks', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const delegate = plugin.getPlayerDelegate();

    let videoInfo; let adBreakInfo; let
      adInfo;

    // initialization
    simulator.simulatePlayerLoad({
      embedCode: 'abcde',
      title: 'testTitle',
      duration: 20000,
    });
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.name).toBe('testTitle');
    expect(videoInfo.length).toBe(20);
    expect(videoInfo.id).toBe('abcde');

    // user clicks play
    simulator.simulatePlayerStart();

    // preroll
    simulator.simulateAdBreakStarted();
    adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(1);
    expect(adBreakInfo.startTime).toBe(0);

    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'preroll',
        adDuration: 15,
        adPodPosition: 1,
      },
    });
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe('preroll');
    expect(adInfo.length).toBe(15);
    expect(adInfo.position).toBe(1);

    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'preroll',
    });
    simulator.simulateAdBreakEnded();

    // main content

    simulator.simulateContentPlayback();

    simulator.simulateVideoPause();

    simulator.simulateContentPlayback();

    simulator.simulateVideoSeek();

    simulator.simulateVideoProgress({
      playheads: [9],
    });
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(9);

    // midroll - podded of 2
    simulator.simulateVideoProgress({
      playheads: [10],
    });
    simulator.simulateAdBreakStarted();
    adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(2);
    expect(adBreakInfo.startTime).toBe(10);

    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'midroll',
        adDuration: 15,
        adPodPosition: 1,
      },
    });
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe('midroll');
    expect(adInfo.length).toBe(15);
    expect(adInfo.position).toBe(1);

    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'midroll',
    });

    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'midroll2',
        adDuration: 5,
        adPodPosition: 2,
      },
    });
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe('midroll2');
    expect(adInfo.length).toBe(5);
    expect(adInfo.position).toBe(2);

    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'midroll2',
    });
    simulator.simulateAdBreakEnded();

    // main content resumes
    simulator.simulateContentPlayback();

    // TODO: Should completed message go before postroll?
    // postroll
    simulator.simulateContentComplete({
      streamPosition: 60,
    });
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(60);

    simulator.simulateAdBreakStarted();
    adBreakInfo = delegate.getAdBreakInfo();
    expect(adBreakInfo.playerName).toBe(playerName);
    expect(adBreakInfo.position).toBe(3);
    expect(adBreakInfo.startTime).toBe(60);

    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'postroll',
        adDuration: 30,
        adPodPosition: 1,
      },
    });
    adInfo = delegate.getAdInfo();
    expect(adInfo.id).toBe('postroll');
    expect(adInfo.length).toBe(30);
    expect(adInfo.position).toBe(1);

    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'postroll',
    });
    simulator.simulateAdBreakEnded();

    // main video ends
    simulator.simulatePlaybackComplete();

    // replay
    simulator.simulateReplay();
    videoInfo = delegate.getVideoInfo();
    expect(videoInfo.playhead).toBe(0);
  });

  // evars and props
  it('Omniture Video Plugin can parse eVars and props', () => {
    // eslint-disable-next-line no-unused-vars
    const plugin = createPlugin(framework,
      {
        marketingCloudOrgId: '2A5D3BC75244638C0A490D4D@AdobeOrg',
        visitorTrackingServer: 'ovppartners.sc.omtrdc.net',
        appMeasurementTrackingServer: 'ovppartners.sc.omtrdc.net',
        reportSuiteId: 'ovppooyala',
        pageName: 'Test Page Name',
        visitorId: 'test-vid',
        debug: true,
        channel: 'Test Heartbeat Channel', // optional
        heartbeatTrackingServer: 'ovppartners.hb.omtrdc.net',
        publisherId: 'ooyalatester',
        props: {
          prop2: 'testProp2',
          prop15: 'testProp15',
        },
        eVars: {
          eVar10: 'testEVar10',
          eVar20: 'testEVar20',
        },
      });
    expect(ADB.OO.AppMeasurement.prop2).toBe('testProp2');
    expect(ADB.OO.AppMeasurement.prop15).toBe('testProp15');
    expect(ADB.OO.AppMeasurement.eVar10).toBe('testEVar10');
    expect(ADB.OO.AppMeasurement.eVar20).toBe('testEVar20');
  });

  it('Omniture can update eVars and props on video source change', () => {
    const plugin = createPlugin(framework,
      {
        marketingCloudOrgId: '2A5D3BC75244638C0A490D4D@AdobeOrg',
        visitorTrackingServer: 'ovppartners.sc.omtrdc.net',
        appMeasurementTrackingServer: 'ovppartners.sc.omtrdc.net',
        reportSuiteId: 'ovppooyala',
        pageName: 'Test Page Name',
        visitorId: 'test-vid',
        debug: true,
        channel: 'Test Heartbeat Channel', // optional
        heartbeatTrackingServer: 'ovppartners.hb.omtrdc.net',
        publisherId: 'ooyalatester',
        props: {
          prop2: 'testProp2',
          prop15: 'testProp15',
        },
        eVars: {
          eVar10: 'testEVar10',
          eVar20: 'testEVar20',
        },
      });

    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'abcde',
      title: 'testTitle',
      duration: 20000,
    });

    expect(ADB.OO.AppMeasurement.prop2).toBe('testProp2');
    expect(ADB.OO.AppMeasurement.prop15).toBe('testProp15');
    expect(ADB.OO.AppMeasurement.eVar10).toBe('testEVar10');
    expect(ADB.OO.AppMeasurement.eVar20).toBe('testEVar20');

    simulator.simulateVideoSourceChanged('newEmbedCode', {
      omniture: {
        props: {
          prop2: 'newTestProp2',
        },
        eVars: {
          eVar10: 'newTestEVar10',
        },
      },
    });

    expect(ADB.OO.AppMeasurement.prop2).toBe('newTestProp2');
    expect(typeof ADB.OO.AppMeasurement.prop15).toBe('undefined');
    expect(ADB.OO.AppMeasurement.eVar10).toBe('newTestEVar10');
    expect(typeof ADB.OO.AppMeasurement.eVar20).toBe('undefined');
  });

  // Adobe Plugin Setup
  it('Omniture Video Plugin can instantiate Adobe Plugins', () => {
    // eslint-disable-next-line no-unused-vars
    const plugin = createPlugin(framework,
      {
        marketingCloudOrgId: '2A5D3BC75244638C0A490D4D@AdobeOrg',
        visitorTrackingServer: 'ovppartners.sc.omtrdc.net',
        appMeasurementTrackingServer: 'ovppartners.sc.omtrdc.net',
        reportSuiteId: 'ovppooyala',
        pageName: 'Test Page Name',
        visitorId: 'test-vid',
        debug: false,
        channel: 'Test Heartbeat Channel', // optional
        heartbeatTrackingServer: 'ovppartners.hb.omtrdc.net',
        heartbeatSSL: false,
        publisherId: 'ooyalatester',
        props: {
          prop2: 'testProp2',
          prop15: 'testProp15',
        },
        eVars: {
          eVar10: 'testEVar10',
        },
      });

    expect(ADB.OO.Visitor.trackingServer).toBe('ovppartners.sc.omtrdc.net');

    expect(ADB.OO.AppMeasurement.trackingServer).toBe('ovppartners.sc.omtrdc.net');
    expect(ADB.OO.AppMeasurement.account).toBe('ovppooyala');
    expect(ADB.OO.AppMeasurement.pageName).toBe('Test Page Name');
    expect(ADB.OO.AppMeasurement.visitorID).toBe('test-vid');

    expect(ADB.OO.VideoPlayerPluginConfig.debugLogging).toBe(false);

    expect(ADB.OO.AdobeAnalyticsPluginConfig.channel).toBe('Test Heartbeat Channel');
    expect(ADB.OO.AdobeAnalyticsPluginConfig.debugLogging).toBe(false);

    expect(ADB.OO.AdobeHeartbeatPluginConfig.heartbeatTrackingServer).toBe('ovppartners.hb.omtrdc.net');
    expect(ADB.OO.AdobeHeartbeatPluginConfig.publisherId).toBe('ooyalatester');
    expect(ADB.OO.AdobeHeartbeatPluginConfig.debugLogging).toBe(false);
    expect(ADB.OO.AdobeHeartbeatPluginConfig.ssl).toBe(undefined);

    expect(ADB.OO.HeartbeatConfig.debugLogging).toBe(false);
  });

  it('Omniture Video Plugin turn on debug logging', () => {
    // eslint-disable-next-line no-unused-vars
    const plugin = createPlugin(framework,
      {
        marketingCloudOrgId: '2A5D3BC75244638C0A490D4D@AdobeOrg',
        visitorTrackingServer: 'ovppartners.sc.omtrdc.net',
        appMeasurementTrackingServer: 'ovppartners.sc.omtrdc.net',
        reportSuiteId: 'ovppooyala',
        pageName: 'Test Page Name',
        visitorId: 'test-vid',
        debug: true,
        channel: 'Test Heartbeat Channel', // optional
        heartbeatTrackingServer: 'ovppartners.hb.omtrdc.net',
        heartbeatSSL: false,
        publisherId: 'ooyalatester',
        props: {
          prop2: 'testProp2',
          prop15: 'testProp15',
        },
        eVars: {
          eVar10: 'testEVar10',
        },
      });

    expect(ADB.OO.Visitor.trackingServer).toBe('ovppartners.sc.omtrdc.net');

    expect(ADB.OO.AppMeasurement.trackingServer).toBe('ovppartners.sc.omtrdc.net');
    expect(ADB.OO.AppMeasurement.account).toBe('ovppooyala');
    expect(ADB.OO.AppMeasurement.pageName).toBe('Test Page Name');
    expect(ADB.OO.AppMeasurement.visitorID).toBe('test-vid');

    expect(ADB.OO.VideoPlayerPluginConfig.debugLogging).toBe(true);

    expect(ADB.OO.AdobeAnalyticsPluginConfig.channel).toBe('Test Heartbeat Channel');
    expect(ADB.OO.AdobeAnalyticsPluginConfig.debugLogging).toBe(true);

    expect(ADB.OO.AdobeHeartbeatPluginConfig.heartbeatTrackingServer).toBe('ovppartners.hb.omtrdc.net');
    expect(ADB.OO.AdobeHeartbeatPluginConfig.publisherId).toBe('ooyalatester');
    expect(ADB.OO.AdobeHeartbeatPluginConfig.debugLogging).toBe(true);
    expect(ADB.OO.AdobeHeartbeatPluginConfig.ssl).toBe(undefined);

    expect(ADB.OO.HeartbeatConfig.debugLogging).toBe(true);
  });

  it('Omniture Video Plugin can turn on SSL mode', () => {
    // eslint-disable-next-line no-unused-vars
    const plugin = createPlugin(framework,
      {
        marketingCloudOrgId: '2A5D3BC75244638C0A490D4D@AdobeOrg',
        visitorTrackingServer: 'ovppartners.sc.omtrdc.net',
        appMeasurementTrackingServer: 'ovppartners.sc.omtrdc.net',
        reportSuiteId: 'ovppooyala',
        pageName: 'Test Page Name',
        visitorId: 'test-vid',
        debug: false,
        channel: 'Test Heartbeat Channel', // optional
        heartbeatTrackingServer: 'ovppartners.hb.omtrdc.net',
        heartbeatSSL: true,
        publisherId: 'ooyalatester',
        props: {
          prop2: 'testProp2',
          prop15: 'testProp15',
        },
        eVars: {
          eVar10: 'testEVar10',
        },
      });

    expect(ADB.OO.Visitor.trackingServer).toBe('ovppartners.sc.omtrdc.net');

    expect(ADB.OO.AppMeasurement.trackingServer).toBe('ovppartners.sc.omtrdc.net');
    expect(ADB.OO.AppMeasurement.account).toBe('ovppooyala');
    expect(ADB.OO.AppMeasurement.pageName).toBe('Test Page Name');
    expect(ADB.OO.AppMeasurement.visitorID).toBe('test-vid');

    expect(ADB.OO.VideoPlayerPluginConfig.debugLogging).toBe(false);

    expect(ADB.OO.AdobeAnalyticsPluginConfig.channel).toBe('Test Heartbeat Channel');
    expect(ADB.OO.AdobeAnalyticsPluginConfig.debugLogging).toBe(false);

    expect(ADB.OO.AdobeHeartbeatPluginConfig.heartbeatTrackingServer).toBe('ovppartners.hb.omtrdc.net');
    expect(ADB.OO.AdobeHeartbeatPluginConfig.publisherId).toBe('ooyalatester');
    expect(ADB.OO.AdobeHeartbeatPluginConfig.debugLogging).toBe(false);
    expect(ADB.OO.AdobeHeartbeatPluginConfig.ssl).toBe(true);

    expect(ADB.OO.HeartbeatConfig.debugLogging).toBe(false);
  });
});

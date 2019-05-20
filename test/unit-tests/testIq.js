describe('Analytics Framework Template Unit Tests', () => {
  jest.autoMockOff();
  require(`${SRC_ROOT}framework/AnalyticsFramework.js`);
  //  require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  require(`${TEST_ROOT}unit-test-helpers/AnalyticsFrameworkTestUtils.js`);
  require(`${COMMON_SRC_ROOT}utils/InitModules/InitOOUnderscore.js`);
  const iqPluginFactory = require(`${SRC_ROOT}plugins/iq.js`);

  const { Analytics } = OO;
  const { Utils } = OO.Analytics;
  const { _ } = OO;
  let framework;

  // setup for individual tests
  const testSetup = function () {
    // mute the logging becuase there will be lots of error messages
    // @TODO: muting errors is inacceptable; errors throwing strategy should be reconsidered
    OO.log = () => {};
    framework = new Analytics.Framework();
    OO.VERSION = { core: { releaseVersion: 'v4' } };

    window.Ooyala = {
      Analytics: {
        Reporter() {
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
              reportAssetClickCalled: 0,
            },

            setDeviceInfo(deviceId, deviceInfo, userAgent, doNotTrack) {
              this.unitTestState.setDeviceInfoCalled++;
              this.unitTestState.doNotTrack = doNotTrack;
            },
            setPlayerInfo() {
              this.unitTestState.setPlayerInfoCalled++;
            },
            initializeMedia(mediaId, contentType) {
              this.unitTestState.initializeMediaCalled++;
              this.unitTestState.mediaId = mediaId;
              this.unitTestState.contentType = contentType;
            },
            setMediaDuration(duration) {
              this.unitTestState.setMediaDurationCalled++;
              this.unitTestState.duration = duration;
            },
            reportPlayerLoad() {
              this.unitTestState.reportPlayerLoadCalled++;
            },
            reportPlaybackStarted() {
              this.unitTestState.reportPlaybackStartedCalled++;
            },
            reportPlayRequested() {
              this.unitTestState.reportPlayRequestedCalled++;
            },
            reportPause() {
              this.unitTestState.reportPauseCalled++;
            },
            reportResume() {
              this.unitTestState.reportResumeCalled++;
            },
            reportPlayHeadUpdate(currentPlayheadPosition) {
              this.unitTestState.currentPlayheadPosition = currentPlayheadPosition;
              this.unitTestState.reportPlayHeadUpdateCalled++;
            },
            reportSeek(currentPlayheadPosition, seekedPlayheadPosition) {
              this.unitTestState.seekedPlayheadPosition = seekedPlayheadPosition;
              this.unitTestState.reportSeekCalled++;
            },
            reportComplete() {
              this.unitTestState.reportCompleteCalled++;
            },
            reportReplay() {
              this.unitTestState.reportReplayCalled++;
            },
            reportCustomEvent(eventName, eventMetadata) {
              this.unitTestState.eventName = eventName;
              this.unitTestState.eventMetadata = eventMetadata;
              this.unitTestState.reportCustomEventCalled++;
            },
            reportAssetImpression(asset, customData, uiTag, contentSource, pageSize, assetPosition) {
              this.unitTestState.asset = asset;
              this.unitTestState.customData = customData;
              this.unitTestState.uiTag = uiTag;
              this.unitTestState.contentSource = contentSource;
              this.unitTestState.pageSize = pageSize;
              this.unitTestState.assetPosition = assetPosition;
              this.unitTestState.reportAssetImpressionCalled++;
            },
            reportAssetClick(asset, customData, uiTag, contentSource, pageSize, assetPosition) {
              this.unitTestState.asset = asset;
              this.unitTestState.customData = customData;
              this.unitTestState.uiTag = uiTag;
              this.unitTestState.contentSource = contentSource;
              this.unitTestState.pageSize = pageSize;
              this.unitTestState.assetPosition = assetPosition;
              this.unitTestState.reportAssetClickCalled++;
            },
          };
        },
      },
    };
  };

  // cleanup for individual tests
  const testCleanup = function () {
    OO.Analytics.PluginFactoryList = [];
    OO.Analytics.FrameworkInstanceList = [];
    // return log back to normal
    //    OO.log = console.log;
    window.Ooyala = null;
  };

  const createPlugin = function (framework) {
    const plugin = new iqPluginFactory(framework);

    // enable iq reporting in plugin for testing
    const metadata = {
      metadata:
      {
        enabled: true,
      },
    };

    plugin.testMode = true;
    plugin.init();
    plugin.setMetadata(metadata);
    return plugin;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  it('Test IQ Plugin Validity', () => {
    expect(iqPluginFactory).not.toBeNull();
    const plugin = new iqPluginFactory();
    expect(framework.validatePlugin(plugin)).toBe(true);
  });

  it('Test IQ Plugin Validity', () => {
    const pluginID = framework.registerPlugin(iqPluginFactory);
    expect(pluginID).toBeDefined();
    const pluginList = framework.getPluginIDList();
    expect(_.contains(pluginList, pluginID));
    expect(framework.makePluginInactive(pluginID)).toBe(true);
    expect(framework.makePluginActive(pluginID)).toBe(true);
  });

  it('Test Auto Registering IQ Plugin', () => {
    OO.Analytics.RegisterPluginFactory(iqPluginFactory);
    const pluginList = framework.getPluginIDList();
    expect(pluginList.length).toBe(1);

    const pluginID = pluginList[0];
    expect(pluginID).not.toBeFalsy();
    expect(pluginID && _.isString(pluginID)).toBe(true);
    expect(framework.isPluginActive(pluginID)).toBe(true);

    // test registering it again
    const pluginID2 = framework.registerPlugin(iqPluginFactory);
    expect(pluginID2).not.toBeFalsy();
    expect(pluginID2 && _.isString(pluginID2)).toBe(true);
    expect(framework.isPluginActive(pluginID2)).toBe(true);
    expect(pluginID).not.toEqual(pluginID2);

    expect(framework.unregisterPlugin(pluginID)).toBe(true);
    expect(_.contains(framework.getPluginIDList(), pluginID)).toBe(false);
  });

  it('Test IQ Plugin Mixed Loading Plugins and Frameworks Delayed', () => {
    const framework2 = new Analytics.Framework();
    expect(OO.Analytics.FrameworkInstanceList).toBeDefined();
    expect(OO.Analytics.FrameworkInstanceList.length).toEqual(2);
    OO.Analytics.RegisterPluginFactory(iqPluginFactory);
    expect(OO.Analytics.PluginFactoryList).toBeDefined();
    expect(_.contains(OO.Analytics.PluginFactoryList, iqPluginFactory)).toBe(true);

    let pluginList1 = framework.getPluginIDList();
    let pluginList2 = framework2.getPluginIDList();
    expect(pluginList1.length).toEqual(1);
    expect(pluginList2.length).toEqual(1);

    const framework3 = new Analytics.Framework();
    pluginList1 = framework.getPluginIDList();
    pluginList2 = framework2.getPluginIDList();
    const pluginList3 = framework3.getPluginIDList();
    expect(pluginList1.length).toEqual(1);
    expect(pluginList2.length).toEqual(1);
    expect(pluginList3.length).toEqual(1);
  });

  // TODO: This test as is cannot be run now since requirejs does not reload the script.
  // However, the things tested in this test could be covered by the other tests, since
  // the other tests require the modules to be loaded properly
  // it('Test IQ Plugin Created Before Framework', function()
  // {
  //  //erase the global references for the plugins and frameworks.
  //  OO.Analytics.PluginFactoryList = null;
  //  OO.Analytics.FrameworkInstanceList = null;
  //  expect(OO.Analytics.PluginFactoryList).toBeTruthy();
  //  expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
  //  expect(OO.Analytics.FrameworkInstanceList).toBeTruthy();
  //  expect(OO.Analytics.FrameworkInstanceList.length).toEqual(0);
  // });

  it('Test Setting Metadata and Processing An Event', () => {
    let metadataReceived = null;
    let eventProcessed = null;
    let paramsReceived = null;
    const newFactoryWithFunctionTracing = function () {
      const factory = new iqPluginFactory();
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
      iq:
      {
        data: 'mydata',
      },
    };
    framework.setPluginMetadata(metadata);
    expect(metadataReceived).toEqual(metadata.iq);
    framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PAUSED, [metadata]);
    expect(eventProcessed).toEqual(OO.Analytics.EVENTS.VIDEO_PAUSED);
    expect(paramsReceived).toEqual([metadata]);
  });

  it('Test Framework Destroy With IQ Plugin', () => {
    OO.Analytics.RegisterPluginFactory(iqPluginFactory);
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

  it('Test Framework Destroy With IQ Plugin And Multi Frameworks', () => {
    OO.Analytics.RegisterPluginFactory(iqPluginFactory);
    const framework2 = new OO.Analytics.Framework();
    let pluginList = framework.getPluginIDList();
    let pluginList2 = framework2.getPluginIDList();

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

  it('Test all functions', () => {
    const plugin = new iqPluginFactory(framework);
    let errorOccured = false;
    try {
      for (const key in plugin) {
        if (OO._.isFunction(plugin[key])) {
          plugin[key].apply(plugin);
        }
      }
    } catch (e) {
      console.log(e);
      errorOccured = true;
    }

    expect(errorOccured).toBe(false);
  });

  it('IQ Plugin can initialize and set device and player info', () => {
    const plugin = createPlugin(framework);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.setDeviceInfoCalled).toBe(1);
    expect(unitTestState.setPlayerInfoCalled).toBe(1);
    expect(unitTestState.doNotTrack).toBe(false);
  });

  it('IQ Plugin can initialize and set device and player info when tracking level is set to ANONYMOUS', () => {
    OO.trackingLevel = OO.TRACKING_LEVEL.ANONYMOUS;
    const plugin = createPlugin(framework);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.setDeviceInfoCalled).toBe(1);
    expect(unitTestState.setPlayerInfoCalled).toBe(1);
    expect(unitTestState.doNotTrack).toBe(true);
  });

  it('IQ Plugin can initialize and set device and player info when tracking level is set to DISABLED', () => {
    OO.trackingLevel = OO.TRACKING_LEVEL.DISABLED;
    const plugin = createPlugin(framework);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.setDeviceInfoCalled).toBe(1);
    expect(unitTestState.setPlayerInfoCalled).toBe(1);
    expect(unitTestState.doNotTrack).toBe(true);
  });

  it('IQ Plugin should initialize media metadata and report player loaded', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
      contentType: 'Video',
      playerUrl: 'http://ooyala.com/test',
      pcode: 'testPcode',
      playerBrandingId: 'testPlayerBrandingId',
      metadata: {
        autoPlay: false,
      },
    });

    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportPlayerLoadCalled).toBe(1);
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.initializeMediaCalled).toBe(1);
    expect(unitTestState.setMediaDurationCalled).toBe(1);
    expect(unitTestState.mediaId).toBe('testEmbedCode');
    expect(unitTestState.contentType).toBe('ooyala');
    expect(unitTestState.duration).toBe(60000);
    expect(plugin.ooyalaReporter._base.pcode).toBe('testPcode');
  });

  it('IQ Plugin should report pause', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateVideoPause();

    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportPauseCalled).toBe(1);
  });

  it('IQ Plugin should report resume', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateContentPlayback();
    simulator.simulateVideoPause();
    simulator.simulateContentPlayback();

    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportResumeCalled).toBe(1);
  });

  it('IQ Plugin should report playback completed', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulatePlaybackComplete();

    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCompleteCalled).toBe(1);
  });

  it('IQ Plugin should report replay', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateContentPlayback();
    simulator.simulateReplay();
    simulator.simulateWillPlayFromBeginning();
    simulator.simulateContentPlayback();

    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportReplayCalled).toBe(1);
  });

  it('IQ Plugin should report playhead updates', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateVideoProgress({
      playheads: [1, 2, 3, 4, 5, 7.5, 10],
    });

    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportPlayHeadUpdateCalled).toBe(7);
  });

  it('IQ Plugin should report ad quartiles', () => {
    const plugin = createPlugin(framework);

    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateAdBreakStarted();
    simulator.simulateVideoProgress({
      playheads: [15], totalStreamDuration: 60,
    });

    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.eventMetadata.percent).toBe(0.25);
    expect(unitTestState.reportCustomEventCalled).toBe(2);

    simulator.simulateVideoProgress({
      playheads: [30], totalStreamDuration: 60,
    });
    expect(unitTestState.eventMetadata.percent).toBe(0.50);
    expect(unitTestState.reportCustomEventCalled).toBe(3);

    simulator.simulateVideoProgress({
      playheads: [45], totalStreamDuration: 60,
    });
    expect(unitTestState.eventMetadata.percent).toBe(0.75);
    expect(unitTestState.reportCustomEventCalled).toBe(4);

    simulator.simulateVideoProgress({
      playheads: [60], totalStreamDuration: 60,
    });
    expect(unitTestState.eventMetadata.percent).toBe(1.00);
    expect(unitTestState.reportCustomEventCalled).toBe(5);
  });

  it('IQ Plugin should report plyback started updates', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateWillPlayFromBeginning();
    simulator.simulateContentPlayback();

    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportPlaybackStartedCalled).toBe(1);
  });

  it('IQ Plugin should report video buffering started updates', () => {
    const eventName = OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    const testPosition = 0;
    simulator.simulateVideoBufferingStarted({ position: testPosition });

    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.position).toBe(testPosition);
  });

  it('IQ Plugin should report video buffering ended', () => {
    const eventName = OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateVideoBufferingEnded();

    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
  });

  it('IQ Plugin should report initial play starting updates', () => {
    const eventName = OO.Analytics.EVENTS.INITIAL_PLAY_STARTING;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      playerCoreVersion: 'v4',
      timeSinceInitialPlay: 200,
      autoplayed: false,
      hadPreroll: false,
      position: 0,
      plugin: 'TestVideoPlugin',
      technology: 'html5',
      encoding: 'hls',
      streamUrl: 'http://ooyala.test_stream_url.com',
      drm: 'none',
      isLive: false,
    };
    simulator.simulateInitialPlayStarting(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
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

  it('IQ Plugin should report playback ready updates', () => {
    const eventName = OO.Analytics.EVENTS.PLAYBACK_READY;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      playerCoreVersion: 'v4',
      timeSincePlayerCreated: 100,
      pluginList: ['Plugin1', 'Plugin2'],
    };
    simulator.simulatePlaybackReady(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.playerCoreVersion).toBe(metadata.playerCoreVersion);
    expect(unitTestState.eventMetadata.timeSincePlayerCreated).toBe(metadata.timeSincePlayerCreated);
    expect(unitTestState.eventMetadata.pluginList).toBe(metadata.pluginList);
  });

  it('IQ Plugin should report api rerrors', () => {
    const eventName = OO.Analytics.EVENTS.API_ERROR;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      playerCoreVersion: 'v4',
      errorCode: 100,
      errorMessage: 'Api Error Message',
      url: 'http://ooyala.test',
    };
    simulator.simulateApiError(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.playerCoreVersion).toBe(metadata.playerCoreVersion);
    expect(unitTestState.eventMetadata.errorCode).toBe(metadata.errorCode);
    expect(unitTestState.eventMetadata.errorMessage).toBe(metadata.errorMessage);
    expect(unitTestState.eventMetadata.url).toBe(metadata.url);
  });

  it('IQ Plugin should report initial bitrate update', () => {
    const eventName = OO.Analytics.EVENTS.BITRATE_INITIAL;
    const testBitrate = 1000;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateBitrateInitial({ bitrate: testBitrate });
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.bitrate).toBe(testBitrate);
  });

  it('IQ Plugin should report five second bitrate update', () => {
    const eventName = OO.Analytics.EVENTS.BITRATE_FIVE_SEC;
    const testBitrate = 2000;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateBitrateFiveSec({ bitrate: testBitrate });
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.bitrate).toBe(testBitrate);
  });

  it('IQ Plugin should report stable bitrate update', () => {
    const eventName = OO.Analytics.EVENTS.BITRATE_STABLE;
    const testBitrate = 4000;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateBitrateStable({ bitrate: testBitrate });
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.bitrate).toBe(testBitrate);
  });

  it('IQ Plugin should report playback start errors', () => {
    const eventName = OO.Analytics.EVENTS.PLAYBACK_START_ERROR;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      errorCodes: { ooyalaErrorCode: 1 },
      errorMessages: { ooyalaErrorMessage: 'ErrorMessage' },
      drm: {},
    };
    simulator.simulatePlaybackStartError(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.errorCodes).toBe(metadata.errorCodes);
    expect(unitTestState.eventMetadata.errorMessages).toBe(metadata.errorMessages);
    expect(unitTestState.eventMetadata.drm).toBe(metadata.drm);
  });

  it('IQ Plugin should report playback midstream errors', () => {
    const eventName = OO.Analytics.EVENTS.PLAYBACK_MIDSTREAM_ERROR;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      errorCodes: { ooyalaErrorCode: 1 },
      errorMessages: { ooyalaErrorMessage: 'ErrorMessage' },
      position: 20,
    };
    simulator.simulatePlaybackMidstreamError(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.errorCodes).toBe(metadata.errorCodes);
    expect(unitTestState.eventMetadata.errorMessages).toBe(metadata.errorMessages);
    expect(unitTestState.eventMetadata.position).toBe(metadata.position);
  });

  it('IQ Plugin should report plugin loaded update', () => {
    const eventName = OO.Analytics.EVENTS.PLUGIN_LOADED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      playerCoreVersion: 'v4',
      pluginType: 'Video',
      pluginName: 'TestPlugin',
      loadTime: 120,
    };
    simulator.simulatePluginLoaded(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.qosEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.playerCoreVersion).toBe(metadata.playerCoreVersion);
    expect(unitTestState.eventMetadata.pluginType).toBe(metadata.pluginType);
    expect(unitTestState.eventMetadata.pluginName).toBe(metadata.pluginName);
    expect(unitTestState.eventMetadata.loadTime).toBe(metadata.loadTime);
  });

  it('IQ Plugin should report ad request update', () => {
    const eventName = OO.Analytics.EVENTS.AD_REQUEST;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      adPosition: 0,
      adPluginName: 'google-ima',
    };
    simulator.simulateAdRequest(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adPosition).toBe(metadata.adPosition);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
  });

  it('IQ Plugin should report ad request success update', () => {
    const eventName = OO.Analytics.EVENTS.AD_REQUEST_SUCCESS;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      adPosition: 0,
      adPluginName: 'google-ima',
      responseTime: 100,
      timeSinceInitialPlay: 200,
    };
    simulator.simulateAdRequestSuccess(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adPosition).toBe(metadata.adPosition);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.responseTime).toBe(metadata.responseTime);
    expect(unitTestState.eventMetadata.timeSinceInitialPlay).toBe(metadata.timeSinceInitialPlay);
  });

  it('IQ Plugin should report ad sdk loaded update', () => {
    const eventName = OO.Analytics.EVENTS.AD_SDK_LOADED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      playerCoreVersion: 'v4',
      adPluginName: 'google-ima',
    };
    simulator.simulateAdSdkLoaded(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.playerCoreVersion).toBe(metadata.playerCoreVersion);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
  });

  it('IQ Plugin should report ad sdk load error', () => {
    const eventName = OO.Analytics.EVENTS.AD_SDK_LOAD_FAILURE;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      playerCoreVersion: 'v4',
      adPluginName: 'google-ima',
      errorMessage: 'Test Errror',
    };
    simulator.simulateAdSdkLoadFailure(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.playerCoreVersion).toBe(metadata.playerCoreVersion);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.errorMessage).toBe(metadata.errorMessage);
  });

  it('IQ Plugin should report ad break started update', () => {
    const eventName = OO.Analytics.EVENTS.AD_BREAK_STARTED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateAdBreakStarted();
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
  });

  it('IQ Plugin should report ad break ended update', () => {
    const eventName = OO.Analytics.EVENTS.AD_BREAK_ENDED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateAdBreakEnded();
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
  });

  it('IQ Plugin should report ad pod started update', () => {
    const eventName = OO.Analytics.EVENTS.AD_POD_STARTED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      numberOfAds: 3,
    };
    simulator.simulateAdPodStarted(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.numberOfAds).toBe(metadata.numberOfAds);
  });

  it('IQ Plugin should report ad pod ended update', () => {
    const eventName = OO.Analytics.EVENTS.AD_POD_ENDED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      adId: 'Google IMA',
    };
    simulator.simulateAdPodEnded(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adId).toBe(metadata.adId);
  });

  it('IQ Plugin should report ad started update', () => {
    const eventName = OO.Analytics.EVENTS.AD_STARTED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      adType: 'linearOverlay',
      adMetadata:
                    {
                      adId: 'Google IMA',
                      adDuration: 30,
                      adPodPosition: 0,
                    },
    };
    simulator.simulateAdPlayback(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adType).toBe(metadata.adType);
    expect(unitTestState.eventMetadata.adMetadata.adId).toBe(metadata.adMetadata.adId);
    expect(unitTestState.eventMetadata.adMetadata.adDuration).toBe(metadata.adMetadata.adDuration);
    expect(unitTestState.eventMetadata.adMetadata.adPodPosition).toBe(metadata.adMetadata.adPodPosition);
  });

  it('IQ Plugin should report ad ended update', () => {
    const eventName = OO.Analytics.EVENTS.AD_ENDED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      adType: 'linearOverlay',
      adId: 'Google IMA',
    };
    simulator.simulateAdComplete(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adType).toBe(metadata.adType);
    expect(unitTestState.eventMetadata.adId).toBe(metadata.adId);
  });

  it('IQ Plugin should report ad skipped update', () => {
    const eventName = OO.Analytics.EVENTS.AD_SKIPPED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {};
    simulator.simulateAdSkipped(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
  });

  it('IQ Plugin should report ad error', () => {
    const eventName = OO.Analytics.EVENTS.AD_ERROR;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = { error: 'Test Error' };
    simulator.simulateAdError(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.error.error).toBe(metadata.error);
  });

  it('IQ Plugin should report ad request empty', () => {
    const eventName = OO.Analytics.EVENTS.AD_REQUEST_EMPTY;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      adPosition: 0,
      adPluginName: 'google-ima',
      adTagUrl: 'http://test_ad_tag_url.com',
      errorCodes: {
        vastErrorCode: 1000,
        errorCode: 400,
      },
      errorMessage: 'Test Error',
    };
    simulator.simulateAdRequestEmpty(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
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

  it('IQ Plugin should report ad request error', () => {
    const eventName = OO.Analytics.EVENTS.AD_REQUEST_ERROR;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      adPosition: 0,
      adPluginName: 'google-ima',
      adTagUrl: 'http://test_ad_tag_url.com',
      errorCodes: {
        vastErrorCode: 1000,
        errorCode: 400,
      },
      errorMessage: 'Test Error',
      isTimeout: false,
    };
    simulator.simulateAdRequestError(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
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

  it('IQ Plugin should report ad playback error', () => {
    const eventName = OO.Analytics.EVENTS.AD_PLAYBACK_ERROR;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      adPosition: 0,
      adPluginName: 'google-ima',
      adTagUrl: 'http://test_ad_tag_url.com',
      errorCodes: {
        vastErrorCode: 1000,
        errorCode: 400,
      },
      errorMessage: 'Test Error',
      videoPluginList: ['bitwrapper', 'main'],
      mediaFileUrl: 'http://test_media_url.com',
    };
    simulator.simulateAdPlayBackError(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
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

  it('IQ Plugin should report ad impression update', () => {
    const eventName = OO.Analytics.EVENTS.AD_IMPRESSION;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateAdImpression();
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
  });

  it('IQ Plugin should report ad sdk impression update', () => {
    const eventName = OO.Analytics.EVENTS.AD_SDK_IMPRESSION;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      adPosition: 0,
      adPluginName: 'google-ima',
      adLoadTime: 100,
      adProtocol: 'VAST',
      adType: 'linearOverlay',
    };
    simulator.simulateAdSdkImpression(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adPosition).toBe(metadata.adPosition);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.adLoadTime).toBe(metadata.adLoadTime);
    expect(unitTestState.eventMetadata.adProtocol).toBe(metadata.adProtocol);
    expect(unitTestState.eventMetadata.adType).toBe(metadata.adType);
  });

  it('IQ Plugin should report ad completed update', () => {
    const eventName = OO.Analytics.EVENTS.AD_COMPLETED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      adPluginName: 'google-ima',
      timeSinceImpression: 100,
      skipped: false,
      adTagUrl: 'http://test_ad_tag_url.com',
    };
    simulator.simulateAdCompleted(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.timeSinceImpression).toBe(metadata.timeSinceImpression);
    expect(unitTestState.eventMetadata.skipped).toBe(metadata.skipped);
    expect(unitTestState.eventMetadata.adTagUrl).toBe(metadata.adTagUrl);
  });

  it('IQ Plugin should report ad clickthrough opened update', () => {
    const eventName = OO.Analytics.EVENTS.AD_CLICKTHROUGH_OPENED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateAdClickthroughOpened();
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
  });

  it('IQ Plugin should report ad clicked update', () => {
    const eventName = OO.Analytics.EVENTS.AD_CLICKED;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulateAdClicked();
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(eventName);
  });

  it('IQ Plugin should report sdk ad event update', () => {
    const eventName = OO.Analytics.EVENTS.SDK_AD_EVENT;
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const imaEvent = 'ima-event';
    const metadata = {
      adPluginName: 'google-ima',
      adEventName: imaEvent,
      adEventData: { adId: '1234567' },
    };
    simulator.simulateSdkAdEvent(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportCustomEventCalled).toBe(1);
    expect(unitTestState.eventName).toBe(eventName);
    expect(unitTestState.eventMetadata.adEventName).toBe(`${eventName}:${imaEvent}`);
    expect(unitTestState.eventMetadata.adPluginName).toBe(metadata.adPluginName);
    expect(unitTestState.eventMetadata.adEventData.adId).toBe(metadata.adEventData.adId);
  });

  it('IQ Plugin should report discovery asset impression update', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      asset: { id: 'abcd', idType: 'ooyala', ooyalaDiscoveryContext: '/abcdefg/' },
      pageSize: 1,
      assetPosition: 1,
      uiTag: 'test',
      contentSource: 'discovery',
      customData: {},
    };
    simulator.simulateDiscoveryAssetImpression(metadata);
    const { unitTestState } = plugin.ooyalaReporter;

    expect(unitTestState.reportAssetImpressionCalled).toBe(1);
    expect(unitTestState.asset).toBe(metadata.asset);
    expect(unitTestState.pageSize).toBe(metadata.pageSize);
    expect(unitTestState.assetPosition).toBe(metadata.assetPosition);
    expect(unitTestState.uiTag).toBe(metadata.uiTag);
    expect(unitTestState.contentSource).toBe(metadata.contentSource);
    expect(unitTestState.customData).toBe(metadata.customData);
  });

  it('IQ Plugin should report discovery asset click update', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const metadata = {
      asset: { id: 'abcd', idType: 'ooyala', ooyalaDiscoveryContext: '/abcdefg/' },
      pageSize: 1,
      assetPosition: 1,
      uiTag: 'test',
      contentSource: 'discovery',
      customData: { autoplay: false },
    };
    simulator.simulateDiscoveryAssetClick(metadata);
    const { unitTestState } = plugin.ooyalaReporter;

    expect(unitTestState.reportAssetClickCalled).toBe(1);
    expect(unitTestState.asset).toBe(metadata.asset);
    expect(unitTestState.pageSize).toBe(metadata.pageSize);
    expect(unitTestState.assetPosition).toBe(metadata.assetPosition);
    expect(unitTestState.uiTag).toBe(metadata.uiTag);
    expect(unitTestState.contentSource).toBe(metadata.contentSource);
    expect(unitTestState.customData).toBe(metadata.customData);
  });

  it('IQ Plugin should report seek', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateVideoProgress({
      playheads: [1],
    });

    simulator.simulateVideoSeek({
      timeSeekedTo: 10,
    });

    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportPlayHeadUpdateCalled).toBe(1);
    expect(unitTestState.reportSeekCalled).toBe(1);
    expect(unitTestState.currentPlayheadPosition).toBe(1000);
    expect(unitTestState.seekedPlayheadPosition).toBe(10000);
  });

  it('IQ Plugin should report play requested', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
      contentType: 'Video',
      pcode: 'testPcode',
      playerBrandingId: 'testPlayerBrandingId',
      metadata: {
        autoPlay: false,
      },
    });
    simulator.simulatePlayerStart();

    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportPlayRequestedCalled).toBe(1);
    expect(plugin.getAutoPlay()).toBe(false);
  });

  it('IQ Plugin should enable iq reporting when provider metadata is received', () => {
    const oldMetadata = {
      metadata:
      {
        enabled: false,
      },
    };
    const newMetadata = {
      modules:
      {
        iq:
        {
          metadata:
          {
            enabled: true,
          },
        },
      },
    };

    const plugin = createPlugin(framework);
    plugin.setMetadata(oldMetadata);
    const simulator = Utils.createPlaybackSimulator(plugin);

    expect(plugin.getIqEnabled()).toBe(false);
    simulator.simulateStreamMetadataUpdated(newMetadata);
    expect(plugin.getIqEnabled()).toBe(true);
  });

  it('IQ Plugin should not report events if disabled', () => {
    const metadata = {
      metadata:
      {
        enabled: false,
      },
    };
    const plugin = createPlugin(framework);
    plugin.setMetadata(metadata);
    expect(plugin.getIqEnabled()).toBe(false);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateVideoPause();
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportPauseCalled).toBe(0);
  });

  it('IQ Plugin should not report duplicate events if allowThrift is true', () => {
    var metadata = {
      metadata:
      {
        allowThrift: true,
        enabled: true,
      },
    };
    const plugin = createPlugin(framework);
    plugin.setMetadata(metadata);
    expect(plugin.getIqEnabled()).toBe(true);
    expect(plugin.getAllowThrift()).toBe(true);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateReplay();
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
      contentType: 'Video',
      pcode: 'testPcode',
      playerBrandingId: 'testPlayerBrandingId',
      metadata: {
        autoPlay: false,
      },
    });
    simulator.simulateWillPlayFromBeginning();
    simulator.simulatePlayerStart();
    simulator.simulateVideoProgress({
      playheads: [1, 2, 3, 4, 5, 7.5, 10],
    });
    var metadata = {
      asset: { id: 'abcd', idType: 'ooyala', ooyalaDiscoveryContext: '/abcdefg/' },
      pageSize: 1,
      assetPosition: 1,
      uiTag: 'test',
      contentSource: 'discovery',
      customData: { autoplay: false },
    };

    simulator.simulateDiscoveryAssetClick(metadata);
    simulator.simulateDiscoveryAssetImpression(metadata);
    const { unitTestState } = plugin.ooyalaReporter;
    expect(unitTestState.reportReplayCalled).toBe(0);
    expect(unitTestState.reportPlayerLoadCalled).toBe(0);
    expect(unitTestState.reportPlayRequestedCalled).toBe(0);
    expect(unitTestState.reportPlaybackStartedCalled).toBe(0);
    expect(unitTestState.reportPlayHeadUpdateCalled).toBe(0);
    expect(unitTestState.reportAssetImpressionCalled).toBe(0);
    expect(unitTestState.reportAssetClickCalled).toBe(0);
  });
});

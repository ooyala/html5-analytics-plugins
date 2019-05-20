describe('Analytics Framework Nielsen Plugin Unit Tests', () => {
  jest.autoMockOff();
  require(`${SRC_ROOT}framework/AnalyticsFramework.js`);
  //  require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  require(`${TEST_ROOT}unit-test-helpers/AnalyticsFrameworkTestUtils.js`);
  require(`${COMMON_SRC_ROOT}utils/InitModules/InitOOUnderscore.js`);
  const nielsenPluginFactory = require(`${SRC_ROOT}plugins/Nielsen.js`);

  const { Analytics } = OO;
  const { Utils } = OO.Analytics;
  const { _ } = OO;
  let framework;

  const playerName = 'Ooyala V4';

  const GGPM_STOP_EVENT = 7;// "stop";
  const GGPM_END_EVENT = 57;// "end";
  const GGPM_INITIAL_LOAD_METADATA_EVENT = 3;
  const GGPM_LOAD_METADATA_EVENT = 15;// "loadMetadata";
  const GGPM_SET_PLAYHEAD_POSITION_EVENT = 49;// "setPlayheadPosition";
  const GGPM_METADATA_TYPE_CONTENT = 'content';

  // setup for individual tests
  const testSetup = function () {
    framework = new Analytics.Framework();

    // mock Nielsen SDK
    window.NOLCMB = {
      getInstance() {
        return {
          ggInitialize() {
          },
          ggPM() {
          },
        };
      },
    };

    // mute the logging because there will be lots of error messages
    OO.log = function () {};
  };

  // cleanup for individual tests
  const testCleanup = function () {
    window.NOLCMB = null;
    window._nolggGlobalParams = null;
    OO.Analytics.PluginFactoryList = [];
    OO.Analytics.FrameworkInstanceList = [];
    // return log back to normal
    //    OO.log = console.log;
  };

  const createPlugin = function (framework) {
    const plugin = new nielsenPluginFactory(framework);
    plugin.testMode = true;
    plugin.init();
    plugin.setMetadata({
      program: 'myProgram',
      isfullepisode: 'N',
      // TODO: Unit test for page level titles
      // "title":"My Title",
      crossId1: 'EP018S9S290015',
      crossId2: 'ABC',
      airdate: '20150420 21:00:00',
      segB: 'Comedy',
      segC: 'Drama',
    });
    return plugin;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  it('Test Nielsen Plugin Validity', () => {
    expect(nielsenPluginFactory).not.toBeNull();
    const plugin = new nielsenPluginFactory();
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
  it('Test Nielsen Plugin Validity', () => {
    const pluginID = framework.registerPlugin(nielsenPluginFactory);
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
    let metadataReceived;
    let eventProcessed;
    let paramsReceived;
    const newFactoryWithFunctionTracing = function () {
      const factory = new nielsenPluginFactory();
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
      Nielsen:
      {
        data: 'mydata',
      },
    };
    framework.setPluginMetadata(metadata);
    expect(metadataReceived).toEqual(metadata.Nielsen);
    framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PAUSED, [metadata]);
    expect(eventProcessed).toEqual(OO.Analytics.EVENTS.VIDEO_PAUSED);
    expect(paramsReceived).toEqual([metadata]);
  });

  it('Test Framework Destroy With Template', () => {
    OO.Analytics.RegisterPluginFactory(nielsenPluginFactory);
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
  //
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
    const plugin = new nielsenPluginFactory(framework);
    let errorOccured = false;
    try {
      for (const key in plugin) {
        if (OO._.isFunction(plugin[key])) {
          plugin[key].apply(plugin);
        }
      }
    } catch (e) {
      errorOccured = true;
    }

    expect(errorOccured).toBe(false);
  });

  // new
  // Unit Tests created from guidelines for testing at:
  // https://engineeringforum.nielsen.com/sdk/developers/bsdk-testing-app-implement.php
  it('Nielsen plugin can initialize Nielsen SDK on init', () => {
    let initializeCalled = 0;
    window.NOLCMB = {
      getInstance() {
        return {
          ggInitialize() {
            initializeCalled++;
          },
          ggPM() {
          },
        };
      },
    };

    const plugin = createPlugin(framework);
    // TODO: The require calls init
    expect(initializeCalled).toBe(1);
  });

  it('Nielsen plugin can track loadMetadata event upon receiving metadata', () => {
    let loadMetadataCalled = 0;
    let metadata = null;
    let initParams = null;
    window.NOLCMB = {
      getInstance() {
        return {
          ggInitialize(params) {
            initParams = params;
          },
          ggPM(event, param) {
            if (event === GGPM_INITIAL_LOAD_METADATA_EVENT) {
              loadMetadataCalled++;
              metadata = param;
            }
          },
        };
      },
    };
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    expect(loadMetadataCalled).toBe(1);
    expect(metadata.title).toBe('testTitle');
    expect(metadata.assetName).toBe('testTitle');
    expect(metadata.length).toBe(60);
    // adloadtype should be 2 per Nielsen's suggestion
    expect(metadata.adloadtype).toBe(2);
    // nsdkv should be 511 per Nielsen's suggestion
    expect(initParams.nsdkv).toBe('511');
  });

  it('Nielsen plugin can track stop event upon pausing main content', () => {
    let initialLoadMetadataCalled = 0;
    let loadMetadataForContentCalled = 0;
    let contentMetadata = null;
    let loadMetadataForAdCalled = 0;
    let adMetadata = null;
    let stopCalled = 0;
    let stopTime = -1;
    let setPlayheadPositionCalled = 0;
    let playhead = -1;
    window.NOLCMB = {
      getInstance() {
        return {
          ggInitialize() {
          },
          ggPM(event, param) {
            switch (event) {
              case GGPM_STOP_EVENT:
                stopCalled++;
                stopTime = param;
                break;
              case GGPM_INITIAL_LOAD_METADATA_EVENT:
                initialLoadMetadataCalled++;
                contentMetadata = param;
                break;
              case GGPM_LOAD_METADATA_EVENT:
                if (param) {
                  if (param.type === GGPM_METADATA_TYPE_CONTENT) {
                    loadMetadataForContentCalled++;
                    contentMetadata = param;
                  } else {
                    loadMetadataForAdCalled++;
                    adMetadata = param;
                  }
                }
                break;
              case GGPM_SET_PLAYHEAD_POSITION_EVENT:
                setPlayheadPositionCalled++;
                playhead = param;
                break;
            }
          },
        };
      },
    };
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const clearCounts = function () {
      initialLoadMetadataCalled = 0;
      loadMetadataForContentCalled = 0;
      loadMetadataForAdCalled = 0;
      stopCalled = 0;
      setPlayheadPositionCalled = 0;
    };
    simulator.addPreSimulateCallback(clearCounts);

    // received metadata
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });

    expect(initialLoadMetadataCalled).toBe(1);
    expect(contentMetadata.title).toBe('testTitle');
    expect(contentMetadata.assetName).toBe('testTitle');
    expect(contentMetadata.length).toBe(60);

    // play content
    simulator.simulateContentPlayback();

    // we do not publish another loadMetadata here as there was no preroll
    expect(loadMetadataForContentCalled).toBe(0);

    simulator.simulateVideoProgress({
      playheads: [1, 2, 3, 4, 5, 7.5, 10],
    });

    expect(setPlayheadPositionCalled).toBe(7);
    expect(playhead).toBe(10);

    // pause content
    simulator.simulateVideoPause();
    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(10);

    // resume content
    simulator.simulateContentPlayback();
    // we do not expect another loadMetadata as we are resuming from a pause
    expect(loadMetadataForContentCalled).toBe(0);

    // test to see if setPlayheadPosition works after since Nielsen uses this as their resume notification
    simulator.simulateVideoProgress({
      playheads: [11],
    });
    expect(setPlayheadPositionCalled).toBe(1);
    expect(playhead).toBe(11);
  });

  it('Nielsen plugin can track stop event upon pausing an ad', () => {
    let initialLoadMetadataCalled = 0;
    let loadMetadataForContentCalled = 0;
    let contentMetadata = null;
    let loadMetadataForAdCalled = 0;
    let adMetadata = null;
    let stopCalled = 0;
    let stopTime = -1;
    let setPlayheadPositionCalled = 0;
    let playhead = -1;
    window.NOLCMB = {
      getInstance() {
        return {
          ggInitialize() {
          },
          ggPM(event, param) {
            switch (event) {
              case GGPM_STOP_EVENT:
                stopCalled++;
                stopTime = param;
                break;
              case GGPM_INITIAL_LOAD_METADATA_EVENT:
                initialLoadMetadataCalled++;
                contentMetadata = param;
                break;
              case GGPM_LOAD_METADATA_EVENT:
                if (param) {
                  if (param.type === GGPM_METADATA_TYPE_CONTENT) {
                    loadMetadataForContentCalled++;
                    contentMetadata = param;
                  } else {
                    loadMetadataForAdCalled++;
                    adMetadata = param;
                  }
                }
                break;
              case GGPM_SET_PLAYHEAD_POSITION_EVENT:
                setPlayheadPositionCalled++;
                playhead = param;
                break;
            }
          },
        };
      },
    };
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const clearCounts = function () {
      initialLoadMetadataCalled = 0;
      loadMetadataForContentCalled = 0;
      loadMetadataForAdCalled = 0;
      stopCalled = 0;
      setPlayheadPositionCalled = 0;
    };
    simulator.addPreSimulateCallback(clearCounts);

    // received metadata
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });

    expect(initialLoadMetadataCalled).toBe(1);
    expect(contentMetadata.title).toBe('testTitle');
    expect(contentMetadata.assetName).toBe('testTitle');
    expect(contentMetadata.length).toBe(60);

    // play preroll
    simulator.simulateAdBreakStarted();
    expect(stopCalled).toBe(0);

    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'testPrerollId',
        adDuration: 15.2,
      },
    });
    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe('preroll');
    expect(adMetadata.length).toBe(15.2);
    expect(adMetadata.assetid).toBe('testPrerollId');

    simulator.simulateVideoProgress({
      playheads: [1, 5, 7],
      videoId: OO.VIDEO.ADS,
    });

    expect(setPlayheadPositionCalled).toBe(3);
    expect(playhead).toBe(7);

    // pause ad
    simulator.simulateVideoPause();
    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(7);

    simulator.simulateVideoProgress({
      playheads: [15.2],
      videoId: OO.VIDEO.ADS,
    });

    expect(setPlayheadPositionCalled).toBe(1);
    // test that playhead is floored
    expect(playhead).toBe(15);

    // preroll ends
    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'testPrerollId',
    });

    // test to see that ad complete event triggers a playhead position update
    expect(setPlayheadPositionCalled).toBe(1);
    // test that playhead is floored
    expect(playhead).toBe(15);
    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(15);

    simulator.simulateAdBreakEnded();

    // test to see if setPlayheadPosition works after since Nielsen uses this as their resume notification
    simulator.simulateVideoProgress({
      playheads: [11],
    });
    expect(setPlayheadPositionCalled).toBe(1);
    expect(playhead).toBe(11);
  });

  it('Nielsen plugin can track loadMetadata event upon playing a preroll ad', () => {
    let initialLoadMetadataCalled = 0;
    let loadMetadataForContentCalled = 0;
    let contentMetadata = null;
    let loadMetadataForAdCalled = 0;
    let adMetadata = null;
    let stopCalled = 0;
    let stopTime = -1;
    let setPlayheadPositionCalled = 0;
    let playhead = -1;
    window.NOLCMB = {
      getInstance() {
        return {
          ggInitialize() {
          },
          ggPM(event, param) {
            switch (event) {
              case GGPM_STOP_EVENT:
                stopCalled++;
                stopTime = param;
                break;
              case GGPM_INITIAL_LOAD_METADATA_EVENT:
                initialLoadMetadataCalled++;
                contentMetadata = param;
                break;
              case GGPM_LOAD_METADATA_EVENT:
                if (param) {
                  if (param.type === GGPM_METADATA_TYPE_CONTENT) {
                    loadMetadataForContentCalled++;
                    contentMetadata = param;
                  } else {
                    loadMetadataForAdCalled++;
                    adMetadata = param;
                  }
                }
                break;
              case GGPM_SET_PLAYHEAD_POSITION_EVENT:
                setPlayheadPositionCalled++;
                playhead = param;
                break;
            }
          },
        };
      },
    };
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const clearCounts = function () {
      initialLoadMetadataCalled = 0;
      loadMetadataForContentCalled = 0;
      loadMetadataForAdCalled = 0;
      stopCalled = 0;
      setPlayheadPositionCalled = 0;
    };
    simulator.addPreSimulateCallback(clearCounts);

    // received metadata
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });

    expect(initialLoadMetadataCalled).toBe(1);
    expect(contentMetadata.title).toBe('testTitle');
    expect(contentMetadata.assetName).toBe('testTitle');
    expect(contentMetadata.length).toBe(60);

    // play preroll
    simulator.simulateAdBreakStarted();
    expect(stopCalled).toBe(0);

    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'testPrerollId',
        adDuration: 15.2,
      },
    });
    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe('preroll');
    expect(adMetadata.length).toBe(15.2);
    expect(adMetadata.assetid).toBe('testPrerollId');

    simulator.simulateVideoProgress({
      playheads: [1, 5, 15.2],
      videoId: OO.VIDEO.ADS,
    });

    expect(setPlayheadPositionCalled).toBe(3);
    // test that playhead is floored
    expect(playhead).toBe(15);

    // preroll ends
    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'testPrerollId',
    });

    // test to see that ad complete event triggers a playhead position update
    expect(setPlayheadPositionCalled).toBe(1);
    // test that playhead is floored
    expect(playhead).toBe(15);
    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(15);

    simulator.simulateAdBreakEnded();

    // content resumes
    simulator.simulateContentPlayback();

    expect(loadMetadataForContentCalled).toBe(1);
    expect(contentMetadata.title).toBe('testTitle');
    expect(contentMetadata.assetName).toBe('testTitle');
    expect(contentMetadata.length).toBe(60);
  });

  it('Nielsen plugin can track stop and loadMetadata events upon playing a midroll ad', () => {
    let initialLoadMetadataCalled = 0;
    let loadMetadataForContentCalled = 0;
    let contentMetadata = null;
    let loadMetadataForAdCalled = 0;
    let adMetadata = null;
    let stopCalled = 0;
    let stopTime = -1;
    let setPlayheadPositionCalled = 0;
    let playhead = -1;
    window.NOLCMB = {
      getInstance() {
        return {
          ggInitialize() {
          },
          ggPM(event, param) {
            switch (event) {
              case GGPM_STOP_EVENT:
                stopCalled++;
                stopTime = param;
                break;
              case GGPM_INITIAL_LOAD_METADATA_EVENT:
                initialLoadMetadataCalled++;
                contentMetadata = param;
                break;
              case GGPM_LOAD_METADATA_EVENT:
                if (param) {
                  if (param.type === GGPM_METADATA_TYPE_CONTENT) {
                    loadMetadataForContentCalled++;
                    contentMetadata = param;
                  } else {
                    loadMetadataForAdCalled++;
                    adMetadata = param;
                  }
                }
                break;
              case GGPM_SET_PLAYHEAD_POSITION_EVENT:
                setPlayheadPositionCalled++;
                playhead = param;
                break;
            }
          },
        };
      },
    };
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const clearCounts = function () {
      initialLoadMetadataCalled = 0;
      loadMetadataForContentCalled = 0;
      loadMetadataForAdCalled = 0;
      stopCalled = 0;
      setPlayheadPositionCalled = 0;
    };
    simulator.addPreSimulateCallback(clearCounts);

    // received metadata
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    expect(initialLoadMetadataCalled).toBe(1);
    expect(contentMetadata.title).toBe('testTitle');
    expect(contentMetadata.assetName).toBe('testTitle');
    expect(contentMetadata.length).toBe(60);

    // play content
    simulator.simulateContentPlayback();

    // we do not publish another loadMetadata here as there was no preroll
    expect(loadMetadataForContentCalled).toBe(0);

    simulator.simulateVideoProgress({
      playheads: [1, 2, 3, 4, 5, 7.5, 10],
    });

    expect(setPlayheadPositionCalled).toBe(7);
    expect(playhead).toBe(10);

    // play midroll
    simulator.simulateAdBreakStarted();

    // The ad break will send a setPlayheadPosition event to account
    // for the second the ad break starts on
    expect(setPlayheadPositionCalled).toBe(1);
    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(10);

    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'testMidrollId',
        adDuration: 5.8,
      },
    });

    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe('midroll');
    expect(adMetadata.length).toBe(5.8);
    expect(adMetadata.assetid).toBe('testMidrollId');

    simulator.simulateVideoProgress({
      playheads: [1, 5],
      videoId: OO.VIDEO.ADS,
    });

    expect(setPlayheadPositionCalled).toBe(2);
    // test that playhead is floored
    expect(playhead).toBe(5);

    // midroll ends
    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'testMidrollId',
    });

    // test to see that ad complete event triggers a playhead position update
    expect(setPlayheadPositionCalled).toBe(1);
    // test that playhead is floored
    expect(playhead).toBe(5);
    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(5);

    simulator.simulateAdBreakEnded();

    // content resumes
    simulator.simulateContentPlayback();

    expect(loadMetadataForContentCalled).toBe(1);
    expect(contentMetadata.title).toBe('testTitle');
    expect(contentMetadata.assetName).toBe('testTitle');
    expect(contentMetadata.length).toBe(60);
  });

  it('Nielsen plugin can track setPlayheadPosition event', () => {
    let setPlayheadPositionCalled = 0;
    let playhead = -1;
    window.NOLCMB = {
      getInstance() {
        return {
          ggInitialize() {
          },
          ggPM(event, param) {
            if (event === GGPM_SET_PLAYHEAD_POSITION_EVENT) {
              setPlayheadPositionCalled++;
              playhead = param;
            }
          },
        };
      },
    };
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const clearCounts = function () {
      setPlayheadPositionCalled = 0;
    };
    simulator.addPreSimulateCallback(clearCounts);

    // received metadata
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    // play content
    simulator.simulateContentPlayback(plugin);
    simulator.simulateVideoProgress({
      playheads: [1],
    });
    expect(setPlayheadPositionCalled).toBe(1);
    expect(playhead).toBe(1);
    // Removing playhead interval testing as it is now based on current time
    // from Date object rather than playheads
    simulator.simulateVideoProgress({
      playheads: [2, 3, 4, 5, 7.5, 10],
    });
    expect(setPlayheadPositionCalled).toBe(6);
    expect(playhead).toBe(10);

    // test seek backwards
    simulator.simulateVideoProgress({
      playheads: [3],
    });

    expect(setPlayheadPositionCalled).toBe(1);
    expect(playhead).toBe(3);

    // test seek forwards
    simulator.simulateVideoProgress({
      playheads: [30],
    });

    expect(setPlayheadPositionCalled).toBe(1);
    expect(playhead).toBe(30);
  });

  it('Nielsen plugin can track end event', () => {
    let setPlayheadPositionCalled = 0;
    let playhead = -1;
    let endCalled = 0;
    let endTime = -1;
    window.NOLCMB = {
      getInstance() {
        return {
          ggInitialize() {
          },
          ggPM(event, param) {
            if (event === GGPM_END_EVENT) {
              endCalled++;
              endTime = param;
            }
            if (event === GGPM_SET_PLAYHEAD_POSITION_EVENT) {
              setPlayheadPositionCalled++;
              playhead = param;
            }
          },
        };
      },
    };
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    simulator.simulateContentComplete({
      streamPosition: 60,
    });
    // There will be two setPlayheadPositions. One from the video
    // stream position update inside the simulateContentComplete function
    // and another with the Nielsen complete event. One is sent in addition
    // to the complete event to account for the second the content ends on
    expect(setPlayheadPositionCalled).toBe(2);
    expect(playhead).toBe(60);
    expect(endCalled).toBe(1);
    expect(endTime).toBe(60);
  });

  it('Nielsen plugin can track end and loadMetadata events upon playing a postroll ad', () => {
    let loadMetadataCalled = 0;
    let adMetadata = null;
    let endCalled = 0;
    let endTime = -1;
    window.NOLCMB = {
      getInstance() {
        return {
          ggInitialize() {
          },
          ggPM(event, param) {
            switch (event) {
              case GGPM_END_EVENT:
                endCalled++;
                endTime = param;
                break;
              case GGPM_LOAD_METADATA_EVENT:
                if (param && param.type !== GGPM_METADATA_TYPE_CONTENT) {
                  loadMetadataCalled++;
                  adMetadata = param;
                }
                break;
            }
          },
        };
      },
    };
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);

    // received metadata
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    // play content
    simulator.simulateContentPlayback(plugin);
    simulator.simulateVideoProgress({
      playheads: [1, 2, 3, 4, 5, 7.5, 10],
    });
    // content ends
    simulator.simulateContentComplete({
      streamPosition: 60,
    });

    expect(endCalled).toBe(1);
    expect(endTime).toBe(60);

    // play postroll
    simulator.simulateAdBreakStarted(plugin);
    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'testPostrollId',
        adDuration: 20,
      },
    });
    expect(loadMetadataCalled).toBe(1);
    expect(adMetadata.type).toBe('postroll');
    expect(adMetadata.length).toBe(20);
    expect(adMetadata.assetid).toBe('testPostrollId');
  });

  it('Nielsen Video Plugin can track all events in a typical playback', () => {
    let initialLoadMetadataCalled = 0;

    let loadMetadataForAdCalled = 0;
    let adMetadata = null;

    let loadMetadataForContentCalled = 0;
    let contentMetadata = null;

    let setPlayheadPositionCalled = 0;
    let playhead = -1;

    let endCalled = 0;
    let endTime = -1;

    let stopCalled = 0;
    let stopTime = -1;

    window.NOLCMB = {
      getInstance() {
        return {
          ggInitialize() {
          },
          ggPM(event, param) {
            switch (event) {
              case GGPM_STOP_EVENT:
                stopCalled++;
                stopTime = param;
                break;
              case GGPM_END_EVENT:
                endCalled++;
                endTime = param;
                break;
              case GGPM_INITIAL_LOAD_METADATA_EVENT:
                initialLoadMetadataCalled++;
                contentMetadata = param;
                break;
              case GGPM_LOAD_METADATA_EVENT:
                if (param) {
                  if (param.type === GGPM_METADATA_TYPE_CONTENT) {
                    loadMetadataForContentCalled++;
                    contentMetadata = param;
                  } else {
                    loadMetadataForAdCalled++;
                    adMetadata = param;
                  }
                }
                break;
              case GGPM_SET_PLAYHEAD_POSITION_EVENT:
                setPlayheadPositionCalled++;
                playhead = param;
                break;
            }
          },
        };
      },
    };
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    const clearCounts = function () {
      initialLoadMetadataCalled = 0;
      loadMetadataForContentCalled = 0;
      loadMetadataForAdCalled = 0;
      stopCalled = 0;
      setPlayheadPositionCalled = 0;
    };
    simulator.addPreSimulateCallback(clearCounts);

    // received metadata
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });

    expect(initialLoadMetadataCalled).toBe(1);
    expect(contentMetadata.title).toBe('testTitle');
    expect(contentMetadata.assetName).toBe('testTitle');
    expect(contentMetadata.length).toBe(60);
    expect(contentMetadata.assetid).toBe('testEmbedCode');

    // play preroll
    simulator.simulateAdBreakStarted(plugin);
    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'testPrerollId',
        adDuration: 15,
      },
    });

    expect(stopCalled).toBe(0);

    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe('preroll');
    expect(adMetadata.length).toBe(15);
    expect(adMetadata.assetid).toBe('testPrerollId');

    simulator.simulateVideoProgress({
      playheads: [1, 5, 10, 15],
      videoId: OO.VIDEO.ADS,
    });

    expect(setPlayheadPositionCalled).toBe(4);
    expect(playhead).toBe(15);

    // preroll ends
    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'testPrerollId',
    });

    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(15);

    simulator.simulateAdBreakEnded(plugin);

    // play content
    simulator.simulateContentPlayback(plugin);

    expect(loadMetadataForContentCalled).toBe(1);
    expect(contentMetadata.title).toBe('testTitle');
    expect(contentMetadata.assetName).toBe('testTitle');
    expect(contentMetadata.length).toBe(60);

    simulator.simulateVideoProgress({
      playheads: [1, 2, 3, 4, 5, 7.5, 10],
    });

    expect(setPlayheadPositionCalled).toBe(7);
    expect(playhead).toBe(10);

    // play midroll
    simulator.simulateAdBreakStarted(plugin);
    // The ad break will send a setPlayheadPosition event to account
    // for the second the ad break starts on
    expect(setPlayheadPositionCalled).toBe(1);
    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(10);

    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'testMidrollId',
        adDuration: 5,
      },
    });

    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe('midroll');
    expect(adMetadata.length).toBe(5);
    expect(adMetadata.assetid).toBe('testMidrollId');

    simulator.simulateVideoProgress({
      playheads: [1, 5],
      videoId: OO.VIDEO.ADS,
    });

    expect(setPlayheadPositionCalled).toBe(2);
    expect(playhead).toBe(5);

    // midroll ends
    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'testMidrollId',
    });

    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(5);

    simulator.simulateAdBreakEnded(plugin);

    // content resumes
    simulator.simulateContentPlayback(plugin);

    expect(loadMetadataForContentCalled).toBe(1);
    expect(contentMetadata.title).toBe('testTitle');
    expect(contentMetadata.assetName).toBe('testTitle');
    expect(contentMetadata.length).toBe(60);

    simulator.simulateVideoProgress({
      playheads: [11, 15, 30, 45],
    });

    expect(setPlayheadPositionCalled).toBe(4);
    expect(playhead).toBe(45);

    // content ends
    simulator.simulateContentComplete({
      streamPosition: 60,
    });

    // There will be two setPlayheadPositions. One from the video
    // stream position update inside the simulateContentComplete function
    // and another with the Nielsen complete event. One is sent in addition
    // to the complete event to account for the second the content ends on
    expect(setPlayheadPositionCalled).toBe(2);
    expect(playhead).toBe(60);

    expect(endCalled).toBe(1);
    expect(endTime).toBe(60);

    // play postroll
    simulator.simulateAdBreakStarted(plugin);
    simulator.simulateAdPlayback({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adMetadata: {
        adId: 'testPostrollId',
        adDuration: 20,
      },
    });
    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe('postroll');
    expect(adMetadata.length).toBe(20);
    expect(adMetadata.assetid).toBe('testPostrollId');

    simulator.simulateVideoProgress({
      playheads: [1, 5, 10, 15, 20],
      videoId: OO.VIDEO.ADS,
    });

    expect(setPlayheadPositionCalled).toBe(5);
    expect(playhead).toBe(20);

    // postroll ends
    simulator.simulateAdComplete({
      adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
      adId: 'testPostrollId',
    });

    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(20);

    simulator.simulateAdBreakEnded(plugin);
  });
});

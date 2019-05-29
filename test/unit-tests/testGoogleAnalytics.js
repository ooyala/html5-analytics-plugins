/* eslint-disable global-require,require-jsdoc,import/no-dynamic-require */
describe('Analytics Framework GA Plugin Unit Tests', () => {
  jest.autoMockOff();
  require('../unit-test-helpers/mock_ga.js');
  require(`${SRC_ROOT}framework/AnalyticsFramework.js`);
  //  require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  require(`${TEST_ROOT}unit-test-helpers/AnalyticsFrameworkTestUtils.js`);
  require(`${COMMON_SRC_ROOT}utils/InitModules/InitOOUnderscore.js`);
  const GaPluginFactory = require(`${SRC_ROOT}plugins/googleAnalytics.js`);

  const { Analytics } = OO;
  const { Utils } = OO.Analytics;
  let framework;

  const COMMAND = {
    SEND: 'send',
  };

  const HIT_TYPE = {
    EVENT: 'event',
  };

  // custom values defined by us in the plugin
  const EVENT_CATEGORY = {
    OOYALA: 'Ooyala',
  };

  const eventHitTypeOrder = ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'];

  const EVENT_ACTION = {
    PLAYBACK_STARTED: 'playbackStarted',
    PLAYBACK_PAUSED: 'playbackPaused',
    CONTENT_READY: 'contentReady',
    PLAY_PROGRESS_STARTED: 'playProgressStarted',
    PLAY_PROGRESS_QUARTER: 'playProgressQuarter',
    PLAY_PROGRESS_HALF: 'playProgressHalf',
    PLAY_PROGRESS_THREE_QUARTERS: 'playProgressThreeQuarters',
    PLAY_PROGRESS_END: 'playProgressEnd',
    AD_PLAYBACK_STARTED: 'adPlaybackStarted',
    AD_PLAYBACK_FINISHED: 'adPlaybackFinished',
  };

  /**
   * Setup for individual tests.
   */
  const testSetup = function () {
    framework = new Analytics.Framework();
    // mute the logging becuase there will be lots of error messages
    OO.log = function () {
    };
  };

  /**
   * Cleanup for individual tests.
   */
  const testCleanup = function () {
    OO.Analytics.PluginFactoryList = [];
    OO.Analytics.FrameworkInstanceList = [];
    resetMockGa();
    // return log back to normal
    // OO.log = console.log;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  // helpers
  // eslint-disable-next-line no-shadow
  const createPlugin = function (framework, metadata) {
    const plugin = new GaPluginFactory(framework);
    plugin.init();
    const metadataNew = metadata || {};
    plugin.setMetadata(metadataNew);
    return plugin;
  };

  const checkGaArgumentsForEventWithTrackerName = function (trackerName, eventAction, eventLabel) {
    // command, hit type
    const command = trackerName ? `${trackerName}.${COMMAND.SEND}` : COMMAND.SEND;
    expect(MockGa.gaCommand).toBe(command);
    const eventFields = MockGa.gaEventFields;
    expect(MockGa.gaHitType).toBe(HIT_TYPE.EVENT);
    // eventCategory, eventAction, eventLabel, eventValue
    const testFields = {};
    testFields.eventCategory = EVENT_CATEGORY.OOYALA;
    testFields.eventAction = eventAction;
    testFields.eventLabel = eventLabel;
    Object
      .entries(eventHitTypeOrder)
      .forEach(([, key]) => {
        if (eventFields[key]) {
          expect(eventFields[key]).toBe(testFields[key]);
        }
      });
  };

  const checkGaArgumentsForEvent = function (eventAction, eventLabel) {
    checkGaArgumentsForEventWithTrackerName(null, eventAction, eventLabel);
  };

  it('GA sends contentReady event when player is loaded', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    checkGaArgumentsForEvent(EVENT_ACTION.CONTENT_READY, 'testTitle');
  });

  it('GA sends playbackStarted event when content starts', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();

    checkGaArgumentsForEvent(EVENT_ACTION.PLAYBACK_STARTED, 'testTitle');
  });

  it('GA sends playbackPaused event when content is paused after starting', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0, 1],
      totalStreamDuration: 60,
    });

    simulator.simulateVideoPause();

    checkGaArgumentsForEvent(EVENT_ACTION.PLAYBACK_PAUSED, 'testTitle');
  });

  it('GA sends playbackPaused event when video is paused without a pause request', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0, 1],
      totalStreamDuration: 60,
    });

    plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSED);

    checkGaArgumentsForEvent(EVENT_ACTION.PLAYBACK_PAUSED, 'testTitle');
  });

  // Works around a limitation where a pause event is fired when content starts
  it('GA does not send playbackPaused event when content is paused before starting', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();

    resetMockGa();

    simulator.simulateVideoPause();

    expect(MockGa.gaCommand).toBe(null);
  });

  // Works around a limitation where a pause event is fired when content finishes
  it('GA does not send playbackPaused event when content is paused after finishing', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();

    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16, 60],
      totalStreamDuration: 60,
    });

    simulator.simulatePlaybackComplete();

    resetMockGa();

    simulator.simulateVideoPause();

    expect(MockGa.gaCommand).toBe(null);
  });

  it('GA sends playback milestone for playProgressStarted', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0, 1],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEvent(EVENT_ACTION.PLAY_PROGRESS_STARTED, 'testTitle');
  });

  it('GA sends playback milestone for playProgressStarted at 0% through the content', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 6000000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0],
      totalStreamDuration: 6000,
    });

    checkGaArgumentsForEvent(EVENT_ACTION.PLAY_PROGRESS_STARTED, 'testTitle');

    resetMockGa();

    simulator.simulateVideoProgress({
      playheads: [1],
      totalStreamDuration: 6000,
    });

    // check we don't send playProgressStarted again
    expect(MockGa.gaCommand).toBe(null);
  });

  it('GA sends playback milestone for playProgressQuarter', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEvent(EVENT_ACTION.PLAY_PROGRESS_QUARTER, 'testTitle');
  });

  it(`GA will not send playback milestone for playProgressQuarter
   again if meeting the same milestone again in the same playback`, () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEvent(EVENT_ACTION.PLAY_PROGRESS_QUARTER, 'testTitle');

    resetMockGa();

    expect(MockGa.gaCommand).toBe(null);

    simulator.simulateVideoProgress({
      playheads: [20],
      totalStreamDuration: 60,
    });

    expect(MockGa.gaCommand).toBe(null);

    simulator.simulateVideoSeek();

    simulator.simulateVideoProgress({
      playheads: [5, 10, 15, 16],
      totalStreamDuration: 60,
    });

    expect(MockGa.gaCommand).toBe(null);
  });

  it('GA sends playback milestone for playProgressHalf', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16, 20, 25, 30, 31],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEvent(EVENT_ACTION.PLAY_PROGRESS_HALF, 'testTitle');
  });

  it(`GA will not send playback milestone for playProgressHalf 
  again if meeting the same milestone again in the same playback`, () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16, 20, 25, 30, 31],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEvent(EVENT_ACTION.PLAY_PROGRESS_HALF, 'testTitle');

    resetMockGa();

    expect(MockGa.gaCommand).toBe(null);

    simulator.simulateVideoProgress({
      playheads: [35],
      totalStreamDuration: 60,
    });

    expect(MockGa.gaCommand).toBe(null);

    simulator.simulateVideoSeek();

    simulator.simulateVideoProgress({
      playheads: [5, 10, 15, 16, 20, 30, 31],
      totalStreamDuration: 60,
    });

    expect(MockGa.gaCommand).toBe(null);
  });

  it('GA sends playback milestone for playProgressThreeQuarters', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16, 20, 25, 30, 31, 39, 45, 46],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEvent(EVENT_ACTION.PLAY_PROGRESS_THREE_QUARTERS, 'testTitle');
  });

  it(`GA will not send playback milestone for playProgressThreeQuarters 
  again if meeting the same milestone again in the same playback`, () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16, 20, 25, 30, 31, 39, 45, 46],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEvent(EVENT_ACTION.PLAY_PROGRESS_THREE_QUARTERS, 'testTitle');

    resetMockGa();

    expect(MockGa.gaCommand).toBe(null);

    simulator.simulateVideoProgress({
      playheads: [35],
      totalStreamDuration: 60,
    });

    expect(MockGa.gaCommand).toBe(null);

    simulator.simulateVideoSeek();

    simulator.simulateVideoProgress({
      playheads: [5, 10, 15, 16, 20, 30, 31, 40, 45, 46],
      totalStreamDuration: 60,
    });

    expect(MockGa.gaCommand).toBe(null);
  });

  it('GA sends playback milestone for playProgressEnd', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16, 20, 25, 30, 31, 39, 45, 46, 59, 60],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEvent(EVENT_ACTION.PLAY_PROGRESS_END, 'testTitle');
  });

  it('GA sends playback milestone for playProgressEnd at 100% through the content', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 6000000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();

    resetMockGa();
    simulator.simulateVideoProgress({
      playheads: [0, 5999],
      totalStreamDuration: 6000,
    });

    checkGaArgumentsForEvent(EVENT_ACTION.PLAY_PROGRESS_THREE_QUARTERS, 'testTitle');

    simulator.simulateVideoProgress({
      playheads: [0, 6000],
      totalStreamDuration: 6000,
    });

    checkGaArgumentsForEvent(EVENT_ACTION.PLAY_PROGRESS_END, 'testTitle');
  });

  // ADS
  it('GA sends adPlaybackStarted when an ad starts', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0, 1, 15],
      totalStreamDuration: 60,
    });

    simulator.simulateAdBreakStarted();

    checkGaArgumentsForEvent(EVENT_ACTION.AD_PLAYBACK_STARTED, 'testTitle');
  });

  it('GA sends adPlaybackFinished when an ad ends', () => {
    const plugin = createPlugin(framework);
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });
    simulator.simulateStreamMetadataUpdated();
    simulator.simulateContentPlayback();
    simulator.simulateVideoProgress({
      playheads: [0, 1, 15],
      totalStreamDuration: 60,
    });

    simulator.simulateAdBreakStarted();
    simulator.simulateAdBreakEnded();

    checkGaArgumentsForEvent(EVENT_ACTION.AD_PLAYBACK_FINISHED, 'testTitle');
  });

  // replay
  it('GA can replay and publish tracking events', () => {
    const plugin = createPlugin(framework, {
      trackerName: 'testTrackerName',
    });
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });

    // sample playback
    simulator.simulateStreamMetadataUpdated();
    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.CONTENT_READY, 'testTitle');

    simulator.simulateContentPlayback();
    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.PLAYBACK_STARTED, 'testTitle');

    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16, 20, 25, 30, 31, 39, 45, 46, 59, 60],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.PLAY_PROGRESS_END, 'testTitle');

    simulator.simulateReplay();

    // sample playback

    simulator.simulateContentPlayback();
    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.PLAYBACK_STARTED, 'testTitle');

    simulator.simulateVideoProgress({
      playheads: [0],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEventWithTrackerName(
      'testTrackerName',
      EVENT_ACTION.PLAY_PROGRESS_STARTED,
      'testTitle',
    );

    simulator.simulateVideoProgress({
      playheads: [1, 15, 16, 20, 25, 30, 31, 39, 45, 46, 59, 60],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.PLAY_PROGRESS_END, 'testTitle');
  });

  // tracker name and embed code changes
  it('GA can track using provided tracker name', () => {
    const plugin = createPlugin(framework, {
      trackerName: 'testTrackerName',
    });
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });

    // sample playback
    simulator.simulateStreamMetadataUpdated();
    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.CONTENT_READY, 'testTitle');

    simulator.simulateContentPlayback();
    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.PLAYBACK_STARTED, 'testTitle');

    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16, 20, 25, 30, 31, 39, 45, 46, 59, 60],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.PLAY_PROGRESS_END, 'testTitle');
  });

  it('GA can change provided tracker name and embed code', () => {
    const plugin = createPlugin(framework, {
      trackerName: 'testTrackerName',
    });
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });

    // sample playback
    simulator.simulateStreamMetadataUpdated();
    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.CONTENT_READY, 'testTitle');

    simulator.simulateContentPlayback();
    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.PLAYBACK_STARTED, 'testTitle');

    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16, 20, 25, 30, 31, 39, 45, 46, 59, 60],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.PLAY_PROGRESS_END, 'testTitle');

    plugin.setMetadata({
      trackerName: 'otherTrackerName',
    });
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode2',
      title: 'testTitle2',
      duration: 60000,
    });

    // sample playback
    simulator.simulateStreamMetadataUpdated();
    checkGaArgumentsForEventWithTrackerName('otherTrackerName', EVENT_ACTION.CONTENT_READY, 'testTitle2');

    simulator.simulateContentPlayback();
    checkGaArgumentsForEventWithTrackerName('otherTrackerName', EVENT_ACTION.PLAYBACK_STARTED, 'testTitle2');

    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16, 20, 25, 30, 31, 39, 45, 46, 59, 60],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEventWithTrackerName('otherTrackerName', EVENT_ACTION.PLAY_PROGRESS_END, 'testTitle2');
  });

  it('GA can remove provided tracker name', () => {
    const plugin = createPlugin(framework, {
      trackerName: 'testTrackerName',
    });
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });

    // sample playback
    simulator.simulateStreamMetadataUpdated();
    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.CONTENT_READY, 'testTitle');

    simulator.simulateContentPlayback();
    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.PLAYBACK_STARTED, 'testTitle');

    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16, 20, 25, 30, 31, 39, 45, 46, 59, 60],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEventWithTrackerName('testTrackerName', EVENT_ACTION.PLAY_PROGRESS_END, 'testTitle');

    plugin.setMetadata({});
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode2',
      title: 'testTitle2',
      duration: 60000,
    });

    // sample playback
    simulator.simulateStreamMetadataUpdated();
    checkGaArgumentsForEvent(EVENT_ACTION.CONTENT_READY, 'testTitle2');

    simulator.simulateContentPlayback();
    checkGaArgumentsForEvent(EVENT_ACTION.PLAYBACK_STARTED, 'testTitle2');

    simulator.simulateVideoProgress({
      playheads: [0, 1, 15, 16, 20, 25, 30, 31, 39, 45, 46, 59, 60],
      totalStreamDuration: 60,
    });

    checkGaArgumentsForEvent(EVENT_ACTION.PLAY_PROGRESS_END, 'testTitle2');
  });


  it('GA will ignore empty string tracker names', () => {
    const plugin = createPlugin(framework, {
      trackerName: '',
    });
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });

    simulator.simulateStreamMetadataUpdated();

    expect(MockGa.gaCommand).toBe(COMMAND.SEND);
    checkGaArgumentsForEvent(EVENT_ACTION.CONTENT_READY, 'testTitle');
  });

  it('GA will ignore null tracker names', () => {
    const plugin = createPlugin(framework, {
      trackerName: null,
    });
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });

    simulator.simulateStreamMetadataUpdated();

    expect(MockGa.gaCommand).toBe(COMMAND.SEND);
    checkGaArgumentsForEvent(EVENT_ACTION.CONTENT_READY, 'testTitle');
  });

  it('GA will ignore undefined tracker names', () => {
    const plugin = createPlugin(framework, {});
    const simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: 'testEmbedCode',
      title: 'testTitle',
      duration: 60000,
    });

    simulator.simulateStreamMetadataUpdated();

    expect(MockGa.gaCommand).toBe(COMMAND.SEND);
    checkGaArgumentsForEvent(EVENT_ACTION.CONTENT_READY, 'testTitle');
  });
});

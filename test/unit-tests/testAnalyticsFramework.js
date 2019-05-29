/* eslint-disable global-require,require-jsdoc,import/no-dynamic-require */
describe('Analytics Framework Unit Tests', () => {
  jest.autoMockOff();
  require(`${SRC_ROOT}framework/AnalyticsFramework.js`);
  require(`${TEST_ROOT}unit-test-helpers/AnalyticsFrameworkTestUtils.js`);
  require(`${COMMON_SRC_ROOT}utils/InitModules/InitOOUnderscore.js`);
  const templatePluginFactory = require(`${SRC_ROOT}plugins/AnalyticsPluginTemplate.js`);

  const { Analytics } = OO;
  const { EVENTS } = OO.Analytics;
  const { Utils } = OO.Analytics;
  const { _ } = OO;
  let framework;
  OO.DEBUG = true;
  // setup for individual tests
  const testSetup = function () {
    // mute the logging because there will be lots of error messages that are appearing for valid reasons.
    OO.log = function () {
    };
    framework = new Analytics.Framework();
  };

  // cleanup for individual tests
  const testCleanup = function () {
    OO.Analytics.PluginFactoryList = [];
    OO.Analytics.FrameworkInstanceList = [];
    OO.Analytics.Framework.TEST = undefined;
    // return log back to normal
    OO.log = console.log;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  describe('Test Factory Registration and Unregistration', () => {
    it('Test Unregistering Bad Framework', () => {
      let errorOccured = false;
      try {
        OO.Analytics.UnregisterFrameworkInstance(undefined);
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
        OO.Analytics.UnregisterFrameworkInstance(null);
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
        OO.Analytics.UnregisterFrameworkInstance('');
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
        OO.Analytics.UnregisterFrameworkInstance({});
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
        OO.Analytics.UnregisterFrameworkInstance([]);
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
      } catch (e) {
        errorOccured = true;
      }

      expect(errorOccured).toBe(false);
    });

    it('Test Unregistering Valid Framework', () => {
      const framework2 = new Analytics.Framework();
      expect(OO.Analytics.FrameworkInstanceList.length).toEqual(2);
      OO.Analytics.UnregisterFrameworkInstance(framework);
      expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
      OO.Analytics.UnregisterFrameworkInstance(framework2);
      expect(OO.Analytics.FrameworkInstanceList.length).toEqual(0);
    });
  });

  describe('Test Plugin Validator', () => {
    it('Test Undefined Plugin', () => {
      let badPlugin;
      expect(framework.validatePlugin(badPlugin)).toBe(false);
    });

    it('Test Null Plugin', () => {
      const nullPlugin = null;
      expect(framework.validatePlugin(nullPlugin)).toBe(false);
    });

    it('Test Empty Plugin', () => {
      const emptyObjectPlugin = {};
      expect(framework.validatePlugin(emptyObjectPlugin)).toBe(false);
    });

    it('Test String As Plugin', () => {
      const stringPlugin = 'test';
      expect(framework.validatePlugin(stringPlugin)).toBe(false);
    });

    it('Test Factory Returns Plugin With Missing Required Function', () => {
      let i;
      for (i = 0; i < Analytics.REQUIRED_PLUGIN_FUNCTIONS.length; i++) {
        const MissingFunctionFactory = Utils.createMissingFunctionFactory(
          Analytics.REQUIRED_PLUGIN_FUNCTIONS[i],
        );
        const plugin = new MissingFunctionFactory();
        expect(framework.validatePlugin(plugin)).toBe(false);
      }
    });

    it('Test Valid Factory', () => {
      const GoodPluginFactory = Utils.createValidPluginFactory();
      const plugin = new GoodPluginFactory();
      expect(framework.validatePlugin(plugin)).toBe(true);
    });

    it('Test Factory Returns Plugin With More Than Just Required Function', () => {
      const ExtraFunctionFactory = Utils.createExtraFunctionFactory('something');
      const plugin = new ExtraFunctionFactory();
      expect(framework.validatePlugin(plugin)).toBe(true);

      const ExtraFunctionFactory2 = Utils.createExtraFunctionFactory('somethingMore');
      const plugin2 = new ExtraFunctionFactory2();
      expect(framework.validatePlugin(plugin2)).toBe(true);

      // add a second extra function to the first plugin, as a sanity check.
      plugin.anotherExtraFunction = function () {
      };
      expect(framework.validatePlugin(plugin)).toBe(true);
    });

    it('Test Bad Return Value Types For getName()', () => {
      const WrongReturnPluginFactory = Utils.createWrongNameReturnTypeFactory();
      const plugin = new WrongReturnPluginFactory();
      expect(framework.validatePlugin(plugin)).toBe(false);
    });

    it('Test Bad Return Value Types For getVersion()', () => {
      const WrongReturnPluginFactory = Utils.createWrongVersionReturnTypeFactory();
      const plugin = new WrongReturnPluginFactory();
      expect(framework.validatePlugin(plugin)).toBe(false);
    });
  });

  // ////////////////////////////////////////////
  // /Registration Testing
  // ////////////////////////////////////////////
  describe('Test Factory Registration', () => {
    it('Test No Plugins Registered', () => {
      const pluginList = framework.getPluginIDList();
      expect(Array.isArray(pluginList)).toBe(true);
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Undefined Factory', () => {
      let badPluginFactory;
      expect(framework.registerPlugin(badPluginFactory)).toBeFalsy();
      const pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Null Factory', () => {
      const nullPluginFactory = null;
      expect(framework.registerPlugin(nullPluginFactory)).toBeFalsy();
      const pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Empty Object as Factory', () => {
      const emptyObjectPluginFactory = {};
      expect(framework.registerPlugin(emptyObjectPluginFactory)).toBeFalsy();
      const pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Factory Returning Empty Object', () => {
      const badEmptyPluginFactory = function () {
      };
      expect(framework.registerPlugin(badEmptyPluginFactory)).toBeFalsy();
      const pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Factory With Missing Required Function', () => {
      let i;
      for (i = 0; i < Analytics.REQUIRED_PLUGIN_FUNCTIONS.length; i++) {
        const missingFunctionFactory = Utils.createMissingFunctionFactory(
          Analytics.REQUIRED_PLUGIN_FUNCTIONS[i],
        );
        expect(framework.registerPlugin(missingFunctionFactory)).toBeFalsy();
      }
      const pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Factory With Bad Return Value Types For getName()', () => {
      const wrongReturnPluginFactory = Utils.createWrongNameReturnTypeFactory();
      expect(framework.registerPlugin(wrongReturnPluginFactory)).toBeFalsy();
      const pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Factory With Bad Return Value Types For getVersion()', () => {
      const wrongReturnPluginFactory = Utils.createWrongVersionReturnTypeFactory();
      expect(framework.registerPlugin(wrongReturnPluginFactory)).toBeFalsy();
      const pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Registering Good Factory', () => {
      const goodFactory = Utils.createValidPluginFactory();
      const pluginID = framework.registerPlugin(goodFactory);
      expect(pluginID).not.toBeFalsy();
      expect(typeof pluginID === 'string').toBe(true);
      const pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(1);
    });

    it('Test Factory Receives Framework Instance as param', () => {
      const goodFactory = Utils.createFactoryToTestConstructorParams();
      // eslint-disable-next-line no-unused-vars
      const pluginID = framework.registerPlugin(goodFactory);
      expect(OO.Analytics.Framework.TEST.frameworkParam).not.toBeNull();
      expect(OO.Analytics.Framework.TEST.frameworkParam.getRecordedEvents()).toEqual([]);
    });

    it('Test Registering Same Good Factory Multiple Times', () => {
      const goodFactory = Utils.createValidPluginFactory();
      const pluginID1 = framework.registerPlugin(goodFactory);
      const pluginID2 = framework.registerPlugin(goodFactory);
      const pluginID3 = framework.registerPlugin(goodFactory);

      expect(pluginID1).not.toBeFalsy();
      expect(_.isString(pluginID1)).toBe(true);

      expect(pluginID2).not.toBeFalsy();
      expect(_.isString(pluginID2)).toBe(true);

      expect(pluginID3).not.toBeFalsy();
      expect(_.isString(pluginID3)).toBe(true);

      expect(_.isEqual(pluginID1, pluginID2)).not.toBe(true);
      expect(_.isEqual(pluginID2, pluginID3)).not.toBe(true);
      expect(_.isEqual(pluginID3, pluginID1)).not.toBe(true);

      const pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(3);

      expect(_.contains(pluginList, pluginID1)).toBe(true);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
      expect(_.contains(pluginList, pluginID3)).toBe(true);
    });

    it('Test Registering Multiple Good Factories With The Same Name', () => {
      const goodFactory1 = Utils.createValidPluginFactory();
      const goodFactory2 = Utils.createValidPluginFactory();

      const pluginID1 = framework.registerPlugin(goodFactory1);
      const pluginID2 = framework.registerPlugin(goodFactory2);

      expect(pluginID1).not.toBeFalsy();
      expect(_.isString(pluginID1)).toBe(true);

      expect(pluginID2).not.toBeFalsy();
      expect(_.isString(pluginID2)).toBe(true);


      expect(_.isEqual(pluginID1, pluginID2)).not.toBe(true);

      const pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(2);

      expect(_.contains(pluginList, pluginID1)).toBe(true);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
    });

    it('Test Registering Multiple Good Factories', () => {
      const goodFactory1 = Utils.createValidPluginFactory('test1');
      const goodFactory2 = Utils.createValidPluginFactory('test2');

      const pluginID1 = framework.registerPlugin(goodFactory1);
      const pluginID2 = framework.registerPlugin(goodFactory2);

      expect(pluginID1).not.toBeFalsy();
      expect(_.isString(pluginID1)).toBe(true);

      expect(pluginID2).not.toBeFalsy();
      expect(_.isString(pluginID2)).toBe(true);


      expect(_.isEqual(pluginID1, pluginID2)).not.toBe(true);

      const pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(2);

      expect(_.contains(pluginList, pluginID1)).toBe(true);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
    });

    it('Test Unregistering Factories', () => {
      const goodFactory1 = Utils.createValidPluginFactory('test1');
      const goodFactory2 = Utils.createValidPluginFactory('test2');

      const pluginID1 = framework.registerPlugin(goodFactory1);
      const pluginID2 = framework.registerPlugin(goodFactory2);
      let pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(2);

      // test removing plugin1
      expect(framework.unregisterPlugin(pluginID1)).toBe(true);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(1);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);

      // test removing plugin2
      expect(framework.unregisterPlugin(pluginID2)).toBe(true);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(false);

      // test removing plugin2 even though list is empty.
      expect(framework.unregisterPlugin(pluginID2)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(false);
    });

    it('Test Unregistering Factory Without Registering First', () => {
      let pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);

      // test removing plugin1
      expect(framework.unregisterPlugin('badID')).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Unregistering Factory Not using string', () => {
      let test;
      expect(framework.unregisterPlugin(test)).toBe(false);
      let pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);

      test = {};
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);

      test = { test: 'testdata' };
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);

      test = [];
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);

      test = [1, 2, 3];
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);

      test = 1;
      expect(framework.unregisterPlugin(test)).toBe(false);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(0);
    });

    it('Test Reregistering An Unregistered Factory', () => {
      const goodFactory1 = Utils.createValidPluginFactory('test1');
      const goodFactory2 = Utils.createValidPluginFactory('test2');
      const pluginID1 = framework.registerPlugin(goodFactory1);
      const pluginID2 = framework.registerPlugin(goodFactory2);

      expect(framework.unregisterPlugin(pluginID1)).toBe(true);

      let pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(1);
      const pluginID3 = framework.registerPlugin(goodFactory1);
      expect(_.isEqual(pluginID1, pluginID3)).not.toBe(true);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(2);
      expect(_.contains(pluginList, pluginID1)).toBe(false);
      expect(_.contains(pluginList, pluginID2)).toBe(true);
      expect(_.contains(pluginList, pluginID3)).toBe(true);
    });


    it('Test Registering and Unregistering Factories Mixed Test Cases', () => {
      let pluginList;

      const goodFactory1 = Utils.createValidPluginFactory('test1');
      const goodFactory2 = Utils.createValidPluginFactory('test2');

      const pluginID1 = framework.registerPlugin(goodFactory1);
      const pluginID2 = framework.registerPlugin(goodFactory2);
      pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(2);

      let badID = 'badID';

      expect(framework.unregisterPlugin(badID)).toBe(false);
      pluginList = framework.getPluginIDList();
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

      const pluginID3 = framework.registerPlugin(goodFactory1);
      const pluginID4 = framework.registerPlugin(goodFactory1);
      const pluginID5 = framework.registerPlugin(goodFactory1);

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

    it('Test Registering Lots Of Plugins', () => {
      // Test that the framework will not crash when registering lots of plugins.
      const upperLimit = 1000;
      const goodFactory1 = Utils.createValidPluginFactory('test1');

      let errorHit = false;
      // make sure it doesn't throw an error.
      try {
        for (let i = 0; i < upperLimit; i++) {
          framework.registerPlugin(goodFactory1);
        }
      } catch (e) {
        errorHit = true;
      }

      expect(errorHit).toBe(false);
      const pluginList = framework.getPluginIDList();
      expect(pluginList.length).toEqual(1000);
    });
  });

  describe('Test Message Recording', () => {
    it('Test Recorded Messages On Start', () => {
      const recordedEvents = framework.getRecordedEvents();
      expect(_.isArray(recordedEvents)).toBe(true);
      expect(recordedEvents.length).toEqual(0);
    });

    // helper function for testing bad messages
    // eslint-disable-next-line
    const testBadMessages = function (framework) {
      let test;
      let errorOccured = false;
      try {
        expect(framework.publishEvent(test)).toBe(false);
        expect(framework.publishEvent({})).toBe(false);
        expect(framework.publishEvent([])).toBe(false);
        expect(framework.publishEvent('')).toBe(false);
        expect(framework.publishEvent(null)).toBe(false);
        expect(framework.publishEvent(5)).toBe(false);
        expect(framework.publishEvent('unitTestBadMessage')).toBe(false);
      } catch (e) {
        errorOccured = true;
      }

      expect(errorOccured).toBe(false);
      const recordedEvents = framework.getRecordedEvents();
      expect(recordedEvents.length).toEqual(0);
    };

    // eslint-disable-next-line no-shadow
    const testGoodMessages = function (framework) {
      let recordedEvents = framework.getRecordedEvents();
      expect(recordedEvents.length).toEqual(0);

      let numMsgSent = 0;
      let msgName;
      const events = framework.flattenEvents(OO.Analytics.EVENTS);
      for (let i = 0; i < events.length; i++) {
        msgName = events[i];
        expect(framework.publishEvent(msgName)).toBe(true);
        numMsgSent += 1;
        recordedEvents = framework.getRecordedEvents();
        expect(_.isArray(recordedEvents)).toBe(true);
        const { length } = recordedEvents;
        expect(length).toEqual(numMsgSent);
        const lastMsg = recordedEvents[length - 1];
        expect(lastMsg.eventName).toEqual(msgName);
      }
    };

    // eslint-disable-next-line no-shadow
    const badParamsHelper = function (framework, params, msgSentObj) {
      let msgName;
      const events = framework.flattenEvents(OO.Analytics.EVENTS);
      let recordedEvents;
      for (let i = 0; i < events.length; i++) {
        msgName = events[i];
        expect(framework.publishEvent(msgName)).toBe(true);
        msgSentObj.count += 1;
        recordedEvents = framework.getRecordedEvents();
        expect(_.isArray(recordedEvents)).toBe(true);
        const { length } = recordedEvents;
        expect(length).toEqual(msgSentObj.count);
        const lastMsg = recordedEvents[length - 1];
        expect(lastMsg.eventName).toEqual(msgName);
      }
    };

    // eslint-disable-next-line no-shadow
    const testGoodMessagesBadParams = function (framework) {
      let recordedEvents = framework.getRecordedEvents();
      expect(recordedEvents.length).toEqual(0);

      const msgSentObj = { count: 0 };
      let params;
      badParamsHelper(framework, params, msgSentObj);
      params = {};
      badParamsHelper(framework, params, msgSentObj);
      params = 5;
      badParamsHelper(framework, params, msgSentObj);
      params = 'notAnArray';
      badParamsHelper(framework, params, msgSentObj);

      recordedEvents = framework.getRecordedEvents();
      expect(recordedEvents.length).toEqual(msgSentObj.count);
    };

    describe('Test Framework Initialization', () => {
      it('Test Flatten Events Function', () => {
        let object = {};
        expect(framework.flattenEvents(object).length).toBe(0);

        object = {
          a: 'a_val',
          b: 'b_val',
          c: 'c_val',
        };

        // Should return the correct number of values
        let flattenResult = framework.flattenEvents(object);
        expect(flattenResult.length).toBe(3);

        // Should return the correct values
        let expectedVals = ['a_val', 'b_val', 'c_val'];
        _.each(expectedVals, (expectedVal) => {
          expect(_.contains(flattenResult, expectedVal)).toBe(true);
        });

        object = {
          a: {
            aa1: 'aa1_val',
            aa2: 'aa2_val',
            aa3: 'aa3_val',
          },
          b: {
            bb: 'bb_val',
          },
        };
        flattenResult = framework.flattenEvents(object);
        expect(flattenResult.length).toBe(4);
        expectedVals = ['aa1_val', 'aa2_val', 'aa3_val', 'bb_val'];
        _.each(expectedVals, (expectedVal) => {
          expect(_.contains(flattenResult, expectedVal)).toBe(true);
        });

        object = {
          a: {
            aa1: 'aa1_val',
            aa2: 'aa2_val',
          },
          b: {},
          c: 'c_val',
          d: 'd_val',
          e: 'e_val',
        };
        flattenResult = framework.flattenEvents(object);
        expect(flattenResult.length).toBe(5);
        expectedVals = ['aa1_val', 'aa2_val', 'c_val', 'd_val', 'e_val'];
        _.each(expectedVals, (expectedVal) => {
          expect(_.contains(flattenResult, expectedVal)).toBe(true);
        });

        object = {
          a: {
            aa1: 'aa1_val',
            aa2: {
              aaa1: 'aaa1_val',
            },
          },
          b: {
            b1: {
              bb1: {
                bbb1: 'bbb1_val',
              },
            },
          },
        };
        flattenResult = framework.flattenEvents(object);
        expect(flattenResult.length).toBe(3);
        expectedVals = ['aa1_val', 'aaa1_val', 'bbb1_val'];
        _.each(expectedVals, (expectedVal) => {
          expect(_.contains(flattenResult, expectedVal)).toBe(true);
        });
      });
    });

    describe('Test Recording With No Plugins Registered', () => {
      it('Test Sending Invalid Messages', () => {
        testBadMessages(framework);
      });

      it('Test Sending Valid Messages', () => {
        testGoodMessages(framework);
      });

      it('Test Sending Valid Messages With Bad Params', () => {
        testGoodMessagesBadParams(framework);
      });
    });

    describe('Test Recording With Plugin Registered', () => {
      // setup for individual tests
      const testIndividualSetup = function () {
        const plugin = Utils.createValidPluginFactory();
        framework.registerPlugin(plugin);
      };

      beforeEach(testIndividualSetup);

      it('Test Sending Invalid Messages', () => {
        expect(framework.getPluginIDList().length).toEqual(1);
        testBadMessages(framework);
      });

      it('Test Sending Valid Messages', () => {
        expect(framework.getPluginIDList().length).toEqual(1);
        testGoodMessages(framework);
      });

      it('Test Sending Valid Messages With Bad Params', () => {
        expect(framework.getPluginIDList().length).toEqual(1);
        testGoodMessagesBadParams(framework);
      });
    });

    it('Test Max Messages Recorded', () => {
      for (let i = 0; i < 550; i++) {
        framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED);
      }

      const recordedEvents = framework.getRecordedEvents();
      expect(recordedEvents.length).toBeLessThan(550);
    });
  });

  describe('Test Plugin Initialization', () => {
    // setup for individual tests
    const testIndividualSetup = function () {

    };

    // cleanup for individual tests
    const testIndividualCleanup = function () {
      // Test factories
      if (OO.Analytics.Framework.TEST) {
        OO.Analytics.Framework.TEST = null;
      }
    };

    beforeEach(testIndividualSetup);
    afterEach(testIndividualCleanup);

    const testSinglePluginWithMetadata = function (metadata, isGoodMetadata) {
      const factory = Utils.createFactoryWithGlobalAccessToPluginInstance();
      expect(framework.setPluginMetadata(metadata)).toBe(isGoodMetadata);
      const pluginID = framework.registerPlugin(factory);

      expect(OO.Analytics.Framework.TEST.length).toEqual(1);
      const plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.getPluginID()).toEqual(pluginID);
    };

    it('Test Plugin Init with Undefined Metadata', () => {
      let metadata;
      testSinglePluginWithMetadata(metadata, false);

      const plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it('Test Plugin Init with Null Metadata', () => {
      const metadata = null;
      testSinglePluginWithMetadata(metadata, false);

      const plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it('Test Plugin Init with Empty String Metadata', () => {
      const metadata = '';
      testSinglePluginWithMetadata(metadata, false);

      const plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it('Test Plugin Init with String Metadata', () => {
      const metadata = 'badMetadata';
      testSinglePluginWithMetadata(metadata, false);

      const plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it('Test Plugin Init with Empty Metadata', () => {
      const metadata = {};
      testSinglePluginWithMetadata(metadata, true);

      const plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it('Test Plugin Init with Array As Metadata', () => {
      const metadata = [];
      testSinglePluginWithMetadata(metadata, true);

      const plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it('Test Plugin Init with Metadata For Other Plugins', () => {
      const metadata = {};
      metadata.otherPlugin = { test1: 1, test2: 2 };
      testSinglePluginWithMetadata(metadata, true);

      const plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeUndefined();
    });

    it('Test Setting Framework Metadata Just For This Plugin', () => {
      const metadata = {};
      metadata.testName = { test1: 1, test2: 2 };
      testSinglePluginWithMetadata(metadata, true);

      const plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeDefined();
      expect(plugin.metadata).toEqual(metadata.testName);
    });

    it('Test Setting Framework Metadata With Data For Multiple Plugins', () => {
      const metadata = {};
      metadata.testName = { test1: 1, test2: 2 };
      metadata.otherTest = { test3: 3, test4: 4 };
      testSinglePluginWithMetadata(metadata, true);

      const plugin = OO.Analytics.Framework.TEST[0];
      expect(plugin.initWasCalled).toBe(true);
      expect(plugin.metadata).toBeDefined();
      expect(plugin.metadata).toEqual(metadata.testName);
    });
  });

  describe('Test Plugin Message Receiving', () => {
    // setup for individual tests
    const testIndividualSetup = function () {

    };

    // cleanup for individual tests
    const testIndividualCleanup = function () {
      // Test factories
      if (OO.Analytics.Framework.TEST) {
        OO.Analytics.Framework.TEST = null;
      }
    };

    beforeEach(testIndividualSetup);
    afterEach(testIndividualCleanup);

    it('Test Plugin Receives Messages When Active', () => {
      const factory = Utils.createFactoryWithGlobalAccessToPluginInstance();
      // eslint-disable-next-line no-unused-vars
      const pluginID = framework.registerPlugin(factory);
      const plugin = OO.Analytics.Framework.TEST[0];
      const msg1 = EVENTS.INITIAL_PLAYBACK_REQUESTED;
      const msg2 = EVENTS.VIDEO_PLAY_REQUESTED;

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

    it('Test Plugin Doesn\'t Receive Messages When Inactive', () => {
      const factory = Utils.createFactoryWithGlobalAccessToPluginInstance();
      const pluginID = framework.registerPlugin(factory);
      const plugin = OO.Analytics.Framework.TEST[0];
      const msg1 = EVENTS.INITIAL_PLAYBACK_REQUESTED;
      const msg2 = EVENTS.VIDEO_PLAY_REQUESTED;

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

    it('Test Multiple Plugins Mixed Active and Inactive', () => {
      const factory = Utils.createFactoryWithGlobalAccessToPluginInstance();
      const pluginID1 = framework.registerPlugin(factory);
      // eslint-disable-next-line no-unused-vars
      const pluginID2 = framework.registerPlugin(factory);
      const plugin1 = OO.Analytics.Framework.TEST[0];
      const plugin2 = OO.Analytics.Framework.TEST[1];

      const msg1 = EVENTS.INITIAL_PLAYBACK_REQUESTED;
      const msg2 = EVENTS.VIDEO_PLAY_REQUESTED;

      // send first message successfully
      expect(framework.publishEvent(msg1)).toBe(true);
      expect(plugin1.msgReceivedList.length).toEqual(1);
      expect(plugin1.msgReceivedList[0]).toEqual(msg1);
      expect(plugin2.msgReceivedList.length).toEqual(1);
      expect(plugin2.msgReceivedList[0]).toEqual(msg1);

      // send second message successfully
      expect(framework.publishEvent(msg2)).toBe(true);
      expect(plugin1.msgReceivedList.length).toEqual(2);
      expect(plugin1.msgReceivedList[1]).toEqual(msg2);
      expect(plugin2.msgReceivedList.length).toEqual(2);
      expect(plugin2.msgReceivedList[1]).toEqual(msg2);

      // disable plugin1 and send message successfully
      framework.makePluginInactive(pluginID1);
      expect(framework.publishEvent(msg2)).toBe(true);
      expect(plugin1.msgReceivedList.length).toEqual(2);
      expect(plugin1.msgReceivedList[1]).toEqual(msg2);
      expect(plugin2.msgReceivedList.length).toEqual(3);
      expect(plugin2.msgReceivedList[2]).toEqual(msg2);

      // reenable plugin1 and send message again.
      framework.makePluginActive(pluginID1);
      expect(framework.publishEvent(msg2)).toBe(true);
      expect(plugin1.msgReceivedList.length).toEqual(3);
      expect(plugin1.msgReceivedList[2]).toEqual(msg2);
      expect(plugin2.msgReceivedList.length).toEqual(4);
      expect(plugin2.msgReceivedList[3]).toEqual(msg2);
    });

    it('Test Framework Handles Plugin That Throws Error On getName', () => {
      const factory = Utils.createFactoryThatThrowsErrorOn('getName');
      let errorOccured = false;
      let pluginID;
      try {
        pluginID = framework.registerPlugin(factory);
      } catch (e) {
        OO.log(e);
        errorOccured = true;
      }
      expect(errorOccured).toBe(false);
      expect(pluginID).toBeFalsy();
      expect(framework.getPluginIDList().length).toEqual(0);
    });

    it('Test Framework Handles Plugin That Throws Error On getVersion', () => {
      const factory = Utils.createFactoryThatThrowsErrorOn('getVersion');
      let errorOccured = false;
      let pluginID;
      try {
        pluginID = framework.registerPlugin(factory);
      } catch (e) {
        OO.log(e);
        errorOccured = true;
      }
      expect(errorOccured).toBe(false);
      expect(pluginID).toBeFalsy();
      expect(framework.getPluginIDList().length).toEqual(0);
    });

    it('Test Framework Handles Plugin That Throws Error On init', () => {
      const factory = Utils.createFactoryThatThrowsErrorOn('init');
      let errorOccured = false;
      // eslint-disable-next-line no-unused-vars
      let pluginID;
      try {
        pluginID = framework.registerPlugin(factory);
      } catch (e) {
        OO.log(e);
        errorOccured = true;
      }
      expect(errorOccured).toBe(false);
    });

    it('Test Framework Handles Plugin That Throws Error On setMetadata', () => {
      const factory = Utils.createFactoryThatThrowsErrorOn('setMetadata');
      let errorOccured = false;
      // eslint-disable-next-line no-unused-vars
      let pluginID;
      try {
        pluginID = framework.registerPlugin(factory);
        expect(framework.setPluginMetadata({}));
      } catch (e) {
        OO.log(e);
        errorOccured = true;
      }
      expect(errorOccured).toBe(false);
    });

    it('Test Framework Handles Plugin That Throws Error On setPluginID', () => {
      const factory = Utils.createFactoryThatThrowsErrorOn('setPluginID');
      // eslint-disable-next-line no-unused-vars
      let errorOccured = false;
      // eslint-disable-next-line no-unused-vars
      let pluginID;
      try {
        pluginID = framework.registerPlugin(factory);
      } catch (e) {
        OO.log(e);
        errorOccured = true;
      }
      // plugin should still be registered even if the function failed.
      expect(errorOccured).toBe(false);
      expect(framework.getPluginIDList().length).toEqual(1);
    });


    it('Test Framework Handles Plugin That Throws Error On processEvent', () => {
      const factory = Utils.createFactoryThatThrowsErrorOn('processEvent');
      const otherFactory = Utils.createFactoryWithGlobalAccessToPluginInstance();
      let errorOccured = false;
      // eslint-disable-next-line no-unused-vars
      const pluginID1 = framework.registerPlugin(factory);
      expect(framework.getPluginIDList().length).toEqual(1);
      // eslint-disable-next-line no-unused-vars
      const pluginID2 = framework.registerPlugin(otherFactory);
      expect(framework.getPluginIDList().length).toEqual(2);
      try {
        expect(framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED)).toBe(true);
        expect(framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED)).toBe(true);
      } catch (e) {
        if (e) {
          OO.log(e);
        }
        errorOccured = true;
      }
      expect(framework.getRecordedEvents().length).toEqual(2);
      expect(OO.Analytics.Framework.TEST[0].msgReceivedList.length).toEqual(2);
      expect(errorOccured).toBe(false);
    });

    it('Test Framework Handles Plugin That Throws Error On destroy', () => {
      const factory = Utils.createFactoryThatThrowsErrorOn('destroy');
      let errorOccured = false;
      let pluginID;
      try {
        pluginID = framework.registerPlugin(factory);
        framework.unregisterPlugin(pluginID);
      } catch (e) {
        OO.log(e);
        errorOccured = true;
      }
      expect(errorOccured).toBe(false);
      expect(framework.getPluginIDList().length).toEqual(0);
    });

    it('Test publishing events can be turned off and on', () => {
      const factory = Utils.createFactoryWithGlobalAccessToPluginInstance();
      // eslint-disable-next-line no-unused-vars
      const pluginID = framework.registerPlugin(factory);
      const plugin = OO.Analytics.Framework.TEST[0];
      const msg1 = EVENTS.INITIAL_PLAYBACK_REQUESTED;
      const msg2 = EVENTS.VIDEO_PLAY_REQUESTED;

      framework.stopPublishingEvents();
      expect(framework.publishEvent(msg1)).toBe(false);
      expect(plugin.msgReceivedList.length).toEqual(0);

      expect(framework.publishEvent(msg1)).toBe(false);
      expect(plugin.msgReceivedList.length).toEqual(0);

      expect(framework.publishEvent(msg2)).toBe(false);
      expect(plugin.msgReceivedList.length).toEqual(0);
      // double check that we aren't recording the messages either.
      expect(framework.getRecordedEvents().length).toEqual(0);

      framework.resumePublishingEvents();
      expect(framework.publishEvent(msg1)).toBe(true);
      expect(plugin.msgReceivedList.length).toEqual(1);
      expect(plugin.msgReceivedList[0]).toEqual(msg1);

      expect(framework.publishEvent(msg1)).toBe(true);
      expect(plugin.msgReceivedList.length).toEqual(2);
      expect(plugin.msgReceivedList[1]).toEqual(msg1);

      expect(framework.publishEvent(msg2)).toBe(true);
      expect(plugin.msgReceivedList.length).toEqual(3);
      expect(plugin.msgReceivedList[2]).toEqual(msg2);
      // make sure we resume recording events.
      expect(framework.getRecordedEvents().length).toEqual(3);
    });
  });

  it('Test Framework Destroy', () => {
    OO.Analytics.RegisterPluginFactory(templatePluginFactory);
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

  it('Test Framework Destroy With Multi Frameworks', () => {
    OO.Analytics.RegisterPluginFactory(templatePluginFactory);
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

  describe('Test Creation Of Message Data Objects', () => {
    it('Test VideoSourceData', () => {
      const metadata = {
        embedCode: 'test1',
        metadata: { foo: 'test2' },
      };

      const embedCode = 'embedCodeTest';
      let data = new OO.Analytics.EVENT_DATA.VideoSourceData(embedCode, metadata);
      expect(data).toEqual({ embedCode, metadata });

      data = new OO.Analytics.EVENT_DATA.VideoSourceData(2, 'test');
      expect(data).not.toEqual({ embedCode: 2, metadata: 'test' });
      expect(data.embedCode).toEqual(undefined);
      expect(data.metadata).toEqual(undefined);
    });

    it('Test VideoContentMetadata', () => {
      const metadata = {
        title: 'titleTest',
        description: 'descTest',
        duration: 2.3,
        closedCaptions: { foo: 'test' },
        contentType: 'contentTest',
        hostedAtURL: 'urlTest',
      };

      let data = new OO.Analytics.EVENT_DATA.VideoContentMetadata(metadata.title,
        metadata.description,
        metadata.duration,
        metadata.closedCaptions,
        metadata.contentType,
        metadata.hostedAtURL);
      expect(data).toEqual(metadata);

      // check and see if numbers get parsed correctly.
      const temp = OO._.clone(metadata);
      temp.duration = '2.3';
      data = new OO.Analytics.EVENT_DATA.VideoContentMetadata(temp.title,
        temp.description,
        temp.duration,
        temp.closedCaptions,
        temp.contentType,
        temp.hostedAtURL);
      expect(data).toEqual(metadata);

      temp.duration = '2';
      data = new OO.Analytics.EVENT_DATA.VideoContentMetadata(temp.title,
        temp.description,
        temp.duration,
        temp.closedCaptions,
        temp.contentType,
        temp.hostedAtURL);
      expect(data.duration).toEqual(2);

      temp.duration = 'asdf';
      data = new OO.Analytics.EVENT_DATA.VideoContentMetadata(temp.title,
        temp.description,
        temp.duration,
        temp.closedCaptions,
        temp.contentType,
        temp.hostedAtURL);
      expect(data.duration).toBeUndefined();
    });

    it('Test VideoDownloadingMetadata', () => {
      const metadata = {
        currentTime: 1,
        totalStreamDuration: 2,
        streamBufferedUntilTime: 2.3,
        seekableRangeStart: 4.4,
        seekableRangeEnd: 5.5,
      };

      let data = new OO.Analytics.EVENT_DATA.VideoDownloadingMetadata(1, 2, 2.3, '4.4', '5.5');
      expect(data).toEqual(metadata);

      data = new OO.Analytics.EVENT_DATA.VideoDownloadingMetadata();
      expect(data).not.toEqual(metadata);
      expect(data.currentTime).toBeUndefined();
      expect(data.totalStreamDuration).toBeUndefined();
      expect(data.streamBufferedUntilTime).toBeUndefined();
      expect(data.seekableRangeStart).toBeUndefined();
      expect(data.seekableRangeEnd).toBeUndefined();
    });

    it('Test VideoBufferingStartedData', () => {
      const metadata = {
        streamUrl: 'testUrl.com',
      };

      const data = new OO.Analytics.EVENT_DATA.VideoBufferingStartedData(metadata.streamUrl);
      expect(data).toEqual(metadata);
    });

    it('Test VideoBufferingEndedData', () => {
      const metadata = {
        streamUrl: 'testUrl.com',
      };

      const data = new OO.Analytics.EVENT_DATA.VideoBufferingEndedData(metadata.streamUrl);
      expect(data).toEqual(metadata);
    });

    it('Test VideoBitrateProfileData', () => {
      const metadata = {
        bitrate: 1000,
        height: 2000,
        width: 3000.3,
        id: 'testProfile',
      };

      const metadata2 = {
        bitrate: '1000',
        height: '2000',
        width: '3000.3',
        id: 'testProfile',
      };

      const metadata3 = {
        bitrate: 'low',
        height: 2000,
        width: 3000.3,
        id: 'testProfile',
      };

      let data = new OO.Analytics.EVENT_DATA.VideoBitrateProfileData(metadata);
      expect(data).toEqual(metadata);

      data = new OO.Analytics.EVENT_DATA.VideoBitrateProfileData(metadata2);
      // make sure it converts the string to numbers.
      expect(data).toEqual(metadata);

      data = new OO.Analytics.EVENT_DATA.VideoBitrateProfileData(metadata3);
      expect(data).toEqual(metadata3);

      // double check bad data
      const badMetadata = {
        bitrate: {},
        //        height:"2000",
        width: [],
        id: {},
      };

      const badMetadataResult = {};

      data = new OO.Analytics.EVENT_DATA.VideoBufferingEndedData(badMetadata);
      expect(data).toEqual(badMetadataResult);
    });

    it('Test VideoBitrateProfileLookupData', () => {
      const metadata1 = {
        bitrate: 1000,
        height: 2000,
        width: 3000.3,
        id: 'testProfile1',
      };

      const metadata2 = {
        bitrate: 4000,
        height: 5000,
        width: 6000.3,
        id: 'testProfile2',
      };

      const metadata3 = {
        bitrate: 7000,
        height: 8000,
        width: 9000.3,
        id: 'testProfile3',
      };

      let data = new OO.Analytics.EVENT_DATA.VideoBitrateProfileLookupData([metadata1, metadata2, metadata3]);
      expect(data).toBeDefined();
      expect(data.profiles.testProfile1).toEqual(metadata1);
      expect(data.profiles.testProfile2).toEqual(metadata2);
      expect(data.profiles.testProfile3).toEqual(metadata3);

      data = new OO.Analytics.EVENT_DATA.VideoBitrateProfileLookupData('bad data');
      expect(data.profiles).toEqual({});
    });

    it('Test VideoTargetBitrateData', () => {
      const metadata = {
        targetProfile: 'testProfile',
      };

      let data = new OO.Analytics.EVENT_DATA.VideoTargetBitrateData(metadata.targetProfile);
      expect(data).toEqual(metadata);

      const badMetadata = {
        targetProfile: {},
      };

      const badMetadataResult = {};

      data = new OO.Analytics.EVENT_DATA.VideoTargetBitrateData(badMetadata.targetProfile);
      expect(data).toEqual(badMetadataResult);
    });

    it('Test VideoSeekRequestedData', () => {
      const metadata = {
        seekingToTime: 5.05,
      };

      const data = new OO.Analytics.EVENT_DATA.VideoSeekRequestedData(metadata.seekingToTime);
      expect(data).toEqual(metadata);
    });

    it('Test VideoSeekCompletedData', () => {
      const metadata = {
        timeSeekedTo: 5109293.9949,
      };

      const data = new OO.Analytics.EVENT_DATA.VideoSeekCompletedData(metadata.timeSeekedTo);
      expect(data).toEqual(metadata);
    });

    it('Test VideoStreamPositionChangedData', () => {
      const metadata = {
        streamPosition: 500,
        totalStreamDuration: 1000,
      };

      const data = new OO.Analytics.EVENT_DATA.VideoStreamPositionChangedData(metadata.streamPosition,
        metadata.totalStreamDuration);
      expect(data).toEqual(metadata);
    });

    it('Test VideoStreamPositionChangedData with String Inputs', () => {
      const metadataIn = {
        streamPosition: '500',
        totalStreamDuration: '1000',
      };

      const metadataOut = {
        streamPosition: 500,
        totalStreamDuration: 1000,
      };

      const data = new OO.Analytics.EVENT_DATA.VideoStreamPositionChangedData(metadataIn.streamPosition,
        metadataIn.totalStreamDuration);
      expect(data).toEqual(metadataOut);
    });

    it('Test AdPodStartedData', () => {
      const metadataIn = {
        numberOfAds: 3,
      };

      const metadataOut = {
        numberOfAds: 3,
      };

      let data = new OO.Analytics.EVENT_DATA.AdPodStartedData(metadataIn.numberOfAds);
      expect(data).toEqual(metadataOut);

      metadataIn.numberOfAds = '3';
      data = new OO.Analytics.EVENT_DATA.AdPodStartedData(metadataIn.numberOfAds);
      expect(data).toEqual(metadataOut);

      metadataIn.numberOfAds = 0;
      metadataOut.numberOfAds = 0;
      data = new OO.Analytics.EVENT_DATA.AdPodStartedData(metadataIn.numberOfAds);
      expect(data).toEqual(metadataOut);

      metadataIn.numberOfAds = '2';
      metadataOut.numberOfAds = 2;
      data = new OO.Analytics.EVENT_DATA.AdPodStartedData(metadataIn.numberOfAds);
      expect(data).toEqual(metadataOut);

      metadataIn.numberOfAds = 'asdf';
      data = new OO.Analytics.EVENT_DATA.AdPodStartedData(metadataIn.numberOfAds);
      expect(data.numberOfAds).toEqual(undefined);

      metadataIn.numberOfAds = true;
      data = new OO.Analytics.EVENT_DATA.AdPodStartedData(metadataIn.numberOfAds);
      expect(data.numberOfAds).toEqual(undefined);
    });

    it('Test AdPodEndedData', () => {
      let metadata = {
        adId: 'adId',
      };

      let data = new OO.Analytics.EVENT_DATA.AdPodEndedData(metadata.adId);
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

    it('Test FullscreenChangedData', () => {
      const metadataIn = {
        changingToFullscreen: true,
      };
      const metadataOut = {
        changingToFullscreen: true,
      };

      let data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataIn);

      metadataIn.changingToFullscreen = false;
      metadataOut.changingToFullscreen = false;
      data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataOut);

      metadataIn.changingToFullscreen = 'true';
      metadataOut.changingToFullscreen = true;
      data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataOut);

      metadataIn.changingToFullscreen = 'false';
      metadataOut.changingToFullscreen = false;
      data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataOut);

      metadataIn.changingToFullscreen = 'banana';
      metadataOut.changingToFullscreen = undefined;
      data = new OO.Analytics.EVENT_DATA.FullscreenChangedData(metadataIn.changingToFullscreen);
      expect(data).toEqual(metadataOut);

      metadataIn.changingToFullscreen = '';
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

    it('Test VolumeChangedData', () => {
      const metadataIn = {
        currentVolume: 100,
      };

      const metadataOut = {
        currentVolume: 100,
      };

      let data = new OO.Analytics.EVENT_DATA.VolumeChangedData(metadataIn.currentVolume);
      expect(data).toEqual(metadataOut);

      metadataIn.currentVolume = 0;
      metadataOut.currentVolume = 0;
      data = new OO.Analytics.EVENT_DATA.VolumeChangedData(metadataIn.currentVolume);
      expect(data).toEqual(metadataOut);

      metadataIn.currentVolume = '100';
      metadataOut.currentVolume = 100;
      data = new OO.Analytics.EVENT_DATA.VolumeChangedData(metadataIn.currentVolume);
      expect(data).toEqual(metadataOut);

      metadataIn.currentVolume = '0';
      metadataOut.currentVolume = 0;
      data = new OO.Analytics.EVENT_DATA.VolumeChangedData(metadataIn.currentVolume);
      expect(data).toEqual(metadataOut);

      metadataIn.currentVolume = true;
      metadataOut.currentVolume = undefined;
      data = new OO.Analytics.EVENT_DATA.VolumeChangedData(metadataIn.currentVolume);
      expect(data).toEqual(metadataOut);
    });

    // indirectly tests LinearVideoData and NonLinearVideoData
    it('Test AdStartedData', () => {
      // test LINEAR_VIDEO adtype
      let metadataIn = {
        adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
        adMetadata: {
          name: 'testname',
          duration: 10,
          indexInPod: 1,
        },
      };
      let metadataOut = {
        adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
        adMetadata: {
          adId: 'testname',
          adDuration: 10,
          adPodPosition: 1,
        },
      };

      let data = new OO.Analytics.EVENT_DATA.AdStartedData(metadataIn.adType, metadataIn.adMetadata);
      expect(data).toEqual(metadataOut);

      // test string numbers
      metadataIn.duration = '10';
      metadataIn.indexInPod = '1';
      data = new OO.Analytics.EVENT_DATA.AdStartedData(metadataIn.adType, metadataIn.adMetadata);
      expect(data).toEqual(metadataOut);

      // test bad inputs for every ad property
      metadataIn.adMetadata.name = 0;
      metadataIn.adMetadata.duration = false;
      metadataIn.adMetadata.indexInPod = 'NaN';
      metadataOut.adMetadata.adId = undefined;
      metadataOut.adMetadata.adDuration = undefined;
      metadataOut.adMetadata.adPodPosition = undefined;
      data = new OO.Analytics.EVENT_DATA.AdStartedData(metadataIn.adType, metadataIn.adMetadata);
      expect(data).toEqual(metadataOut);

      // test NONLINEAR_OVERLAY adtype
      metadataIn = {
        adType: OO.Analytics.AD_TYPE.NONLINEAR_OVERLAY,
        adMetadata: {
          id: 'testname',
        },
      };
      metadataOut = {
        adType: OO.Analytics.AD_TYPE.NONLINEAR_OVERLAY,
        adMetadata: {
          adId: 'testname',
        },
      };

      data = new OO.Analytics.EVENT_DATA.AdStartedData(metadataIn.adType, metadataIn.adMetadata);
      expect(data).toEqual(metadataOut);

      // test number as (bad) input
      metadataIn.adMetadata.id = 1;
      metadataOut.adMetadata.adId = undefined;
      data = new OO.Analytics.EVENT_DATA.AdStartedData(metadataIn.adType, metadataIn.adMetadata);
      expect(data).toEqual(metadataOut);

      // test unrecognized ad type
      metadataIn.adType = 'bad ad type';
      metadataOut.adType = 'bad ad type';
      metadataOut.adMetadata = undefined;
      data = new OO.Analytics.EVENT_DATA.AdStartedData(metadataIn.adType, metadataIn.adMetadata);
      expect(data).toEqual(metadataOut);
    });

    it('Test AdEndedData', () => {
      const metadataIn = {
        adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
        adId: 'testname',
      };
      const metadataOut = {
        adType: OO.Analytics.AD_TYPE.LINEAR_VIDEO,
        adId: 'testname',
      };

      let data = new OO.Analytics.EVENT_DATA.AdEndedData(metadataIn.adType, metadataIn.adId);
      expect(data).toEqual(metadataOut);

      // test number as (bad) input
      metadataIn.adId = 0;
      metadataOut.adId = undefined;
      data = new OO.Analytics.EVENT_DATA.AdEndedData(metadataIn.adType, metadataIn.adId);
      expect(data).toEqual(metadataOut);

      metadataIn.adType = OO.Analytics.AD_TYPE.NONLINEAR_OVERLAY;
      metadataOut.adType = OO.Analytics.AD_TYPE.NONLINEAR_OVERLAY;
      data = new OO.Analytics.EVENT_DATA.AdEndedData(metadataIn.adType, metadataIn.adId);
      expect(data).toEqual(metadataOut);

      // test bad string input
      metadataIn.adType = 1;
      metadataOut.adType = undefined;
      data = new OO.Analytics.EVENT_DATA.AdEndedData(metadataIn.adType, metadataIn.adId);
      expect(data).toEqual(metadataOut);
    });

    it('Test VideoElementData', () => {
      const metadataIn = {
        streamUrl: 'http://blahblah',
      };

      const metadataOut = {
        streamUrl: 'http://blahblah',
      };

      const data = new OO.Analytics.EVENT_DATA.VideoElementData(metadataIn.streamUrl);
      expect(data).toEqual(metadataOut);
    });

    it('Test AdErrorData', () => {
      // testing if input is expected to be string
      let metadataIn = 'errorString';
      let metadataOut = {
        error: 'errorString',
      };

      let data = new OO.Analytics.EVENT_DATA.AdErrorData(metadataIn);
      expect(data).toEqual(metadataOut);

      // testing if input is expected to be object
      metadataIn = {
        errorObject: 'errorObject',
      };
      metadataOut = {
        error: {
          errorObject: 'errorObject',
        },
      };
      data = new OO.Analytics.EVENT_DATA.AdErrorData(metadataIn);
      expect(data).toEqual(metadataOut);

      // testing bad input
      metadataIn = 1;
      metadataOut = {
        error: undefined,
      };
      data = new OO.Analytics.EVENT_DATA.AdErrorData(metadataIn);
      expect(data).toEqual(metadataOut);

      metadataIn = '';
      metadataOut = {
        error: '',
      };
      data = new OO.Analytics.EVENT_DATA.AdErrorData(metadataIn);
      expect(data).toEqual(metadataOut);

      metadataIn = false;
      metadataOut = {
        error: undefined,
      };
      data = new OO.Analytics.EVENT_DATA.AdErrorData(metadataIn);
      expect(data).toEqual(metadataOut);
    });

    it('Test StreamTypeData', () => {
      let metadataIn = {
        streamType: OO.Analytics.STREAM_TYPE.VOD,
      };

      let metadataOut = {
        streamType: OO.Analytics.STREAM_TYPE.VOD,
      };

      let data = new OO.Analytics.EVENT_DATA.StreamTypeMetadata(metadataIn.streamType);
      expect(data).toEqual(metadataOut);

      metadataIn = {
        streamType: OO.Analytics.STREAM_TYPE.LIVE_STREAM,
      };

      metadataOut = {
        streamType: OO.Analytics.STREAM_TYPE.LIVE_STREAM,
      };

      data = new OO.Analytics.EVENT_DATA.StreamTypeMetadata(metadataIn.streamType);
      expect(data).toEqual(metadataOut);
    });

    it('Test GeoMetadata', () => {
      let metadataIn = {
        country: 'testCountry',
        region: 'testRegion',
        state: 'testState',
        city: 'testCity',
        latitude: 5.0,
        longitude: -10.3,
        dma: 'testDma',
      };

      let metadataOut = {
        country: 'testCountry',
        region: 'testRegion',
        state: 'testState',
        city: 'testCity',
        latitude: 5.0,
        longitude: -10.3,
        dma: 'testDma',
      };

      let data = new OO.Analytics.EVENT_DATA.GeoMetadata(metadataIn);
      expect(data).toEqual(metadataOut);

      // test that numbers can come in as strings but get converted.
      metadataIn = {
        country: 'testCountry',
        region: 'testRegion',
        state: 'testState',
        city: 'testCity',
        latitude: '5.0',
        longitude: '-10.3',
        dma: 'testDma',
      };

      metadataOut = {
        country: 'testCountry',
        region: 'testRegion',
        state: 'testState',
        city: 'testCity',
        latitude: 5.0,
        longitude: -10.3,
        dma: 'testDma',
      };

      data = new OO.Analytics.EVENT_DATA.GeoMetadata(metadataIn);
      expect(data).toEqual(metadataOut);

      // test that all params are optional
      metadataIn = {};

      metadataOut = {};

      data = new OO.Analytics.EVENT_DATA.GeoMetadata(metadataIn);
      expect(data).toEqual(metadataOut);
      expect(data.hasOwnProperty('country')).toEqual(false);
      expect(data.hasOwnProperty('region')).toEqual(false);
      expect(data.hasOwnProperty('state')).toEqual(false);
      expect(data.hasOwnProperty('city')).toEqual(false);
      expect(data.hasOwnProperty('latitude')).toEqual(false);
      expect(data.hasOwnProperty('longitude')).toEqual(false);
      expect(data.hasOwnProperty('dma')).toEqual(false);
    });

    // [DEPRECATED]
    it('Test VideoErrorData', () => {
      let metadataIn = {
        errorCode: '100',
      };

      let metadataOut = {
        errorCode: '100',
        errorMessage: 'General Error',
      };

      let data = new OO.Analytics.EVENT_DATA.VideoErrorData(metadataIn.errorCode);
      expect(data).toEqual(metadataOut);

      // test unknown error code
      metadataIn = {
        errorCode: '101',
      };

      metadataOut = {
        errorCode: '101',
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.VideoErrorData(metadataIn.errorCode, metadataIn.errorMessage);
      expect(data).toEqual(metadataOut);

      // will not accept numbers (at least for now, because VC_PLAY_FAILED's "code" arg is string only)
      metadataIn = {
        errorCode: 0,
      };

      metadataOut = {
        errorCode: undefined,
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.VideoErrorData(metadataIn.errorCode, metadataIn.errorMessage);
      expect(data).toEqual(metadataOut);

      // test bad inputs
      metadataIn = {
        errorCode: null,
      };

      metadataOut = {
        errorCode: undefined,
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.VideoErrorData(metadataIn.errorCode, metadataIn.errorMessage);
      expect(data).toEqual(metadataOut);

      metadataIn = {
        errorCode: undefined,
      };

      metadataOut = {
        errorCode: undefined,
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.VideoErrorData(metadataIn.errorCode, metadataIn.errorMessage);
      expect(data).toEqual(metadataOut);
    });

    it('Test VideoPlaybackErrorData', () => {
      let metadataIn = {
        errorCode: 'error code',
        errorMessage: 'error message',
      };

      let metadataOut = {
        errorCode: 'error code',
        errorMessage: 'error message',
      };

      let data = new OO.Analytics.EVENT_DATA.VideoPlaybackErrorData(
        metadataIn.errorCode,
        metadataIn.errorMessage,
      );
      expect(data).toEqual(metadataIn);

      metadataIn = {
        errorCode: 123,
        errorMessage: 456,
      };

      metadataOut = {
        errorCode: undefined,
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.VideoPlaybackErrorData(
        metadataIn.errorCode,
        metadataIn.errorMessage,
      );
      expect(data).toEqual(metadataOut);

      metadataIn = {
        errorCode: '',
        errorMessage: false,
      };

      metadataOut = {
        errorCode: '',
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.VideoPlaybackErrorData(
        metadataIn.errorCode,
        metadataIn.errorMessage,
      );
      expect(data).toEqual(metadataOut);
    });

    it('Test AuthorizationErrorData', () => {
      let metadataIn = {
        errorCode: 'error code',
        errorMessage: 'error message',
      };

      let data = new OO.Analytics.EVENT_DATA.AuthorizationErrorData(
        metadataIn.errorCode,
        metadataIn.errorMessage,
      );
      expect(data).toEqual(metadataIn);

      metadataIn = {
        errorCode: 123,
        errorMessage: 456,
      };

      let metadataOut = {
        errorCode: undefined,
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.AuthorizationErrorData(
        metadataIn.errorCode,
        metadataIn.errorMessage,
      );
      expect(data).toEqual(metadataOut);

      metadataIn = {
        errorCode: '',
        errorMessage: false,
      };

      metadataOut = {
        errorCode: '',
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.AuthorizationErrorData(
        metadataIn.errorCode,
        metadataIn.errorMessage,
      );
      expect(data).toEqual(metadataOut);
    });

    it('Test GeneralErrorData', () => {
      let metadataIn = {
        errorCode: 'error code',
        errorMessage: 'error message',
      };

      let data = new OO.Analytics.EVENT_DATA.GeneralErrorData(metadataIn.errorCode, metadataIn.errorMessage);
      expect(data).toEqual(metadataIn);

      metadataIn = {
        errorCode: 123,
        errorMessage: 456,
      };

      let metadataOut = {
        errorCode: undefined,
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.GeneralErrorData(metadataIn.errorCode, metadataIn.errorMessage);
      expect(data).toEqual(metadataOut);

      metadataIn = {
        errorCode: '',
        errorMessage: false,
      };

      metadataOut = {
        errorCode: '',
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.GeneralErrorData(
        metadataIn.errorCode,
        metadataIn.errorMessage,
      );
      expect(data).toEqual(metadataOut);
    });

    it('Test MetadataLoadingErrorData', () => {
      let metadataIn = {
        errorCode: 'error code',
        errorMessage: 'error message',
      };

      let data = new OO.Analytics.EVENT_DATA.MetadataLoadingErrorData(
        metadataIn.errorCode,
        metadataIn.errorMessage,
      );
      expect(data).toEqual(metadataIn);

      metadataIn = {
        errorCode: 123,
        errorMessage: 456,
      };

      let metadataOut = {
        errorCode: undefined,
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.MetadataLoadingErrorData(
        metadataIn.errorCode,
        metadataIn.errorMessage,
      );
      expect(data).toEqual(metadataOut);

      metadataIn = {
        errorCode: '',
        errorMessage: false,
      };

      metadataOut = {
        errorCode: '',
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.MetadataLoadingErrorData(
        metadataIn.errorCode,
        metadataIn.errorMessage,
      );
      expect(data).toEqual(metadataOut);
    });

    it('Test SdkAdEventData', () => {
      let metadataIn = {
        adPluginName: 'testAdPlugin',
        adEventName: 'testAdEvent',
        adEventData: {},
      };

      let data = new OO.Analytics.EVENT_DATA.SdkAdEventData(
        metadataIn.adPluginName,
        metadataIn.adEventName,
        metadataIn.adEventData,
      );
      expect(data).toEqual(metadataIn);

      metadataIn = {
        adPluginName: {},
        adEventName: 'blah',
      };

      const metadataOut = {
        errorCode: undefined,
        errorMessage: undefined,
      };

      data = new OO.Analytics.EVENT_DATA.SdkAdEventData(metadataIn.adPluginName, metadataIn.sdkAdEvent);
      expect(data).toEqual(metadataOut);
    });
  });
});

/* eslint-disable global-require,require-jsdoc */
describe('Analytics Framework Template Unit Tests', () => {
  jest.autoMockOff();
  require(`${SRC_ROOT}framework/AnalyticsFramework.js`);
  //  require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
  require(`${TEST_ROOT}unit-test-helpers/AnalyticsFrameworkTestUtils.js`);
  require(`${COMMON_SRC_ROOT}utils/InitModules/InitOOUnderscore.js`);
  const TemplatePluginFactory = require(`${SRC_ROOT}plugins/AnalyticsPluginTemplate.js`);

  const { Analytics } = OO;
  const { _ } = OO;
  let framework;

  /**
   * setup for individual tests.
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
    // return log back to normal
    //    OO.log = console.log;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  it('Test Analytics Template Validity', () => {
    expect(TemplatePluginFactory).not.toBeNull();
    const plugin = new TemplatePluginFactory();
    expect(framework.validatePlugin(plugin)).toBe(true);
  });

  it('Test Auto Registering Template', () => {
    OO.Analytics.RegisterPluginFactory(TemplatePluginFactory);
    const pluginList = framework.getPluginIDList();
    expect(pluginList.length).toBe(1);

    const pluginID = pluginList[0];
    expect(pluginID).not.toBeFalsy();
    expect(pluginID && _.isString(pluginID)).toBe(true);
    expect(framework.isPluginActive(pluginID)).toBe(true);

    // test registering it again
    const pluginID2 = framework.registerPlugin(TemplatePluginFactory);
    expect(pluginID2).not.toBeFalsy();
    expect(pluginID2 && _.isString(pluginID2)).toBe(true);
    expect(framework.isPluginActive(pluginID2)).toBe(true);
    expect(pluginID).not.toEqual(pluginID2);

    expect(framework.unregisterPlugin(pluginID)).toBe(true);
    expect(_.contains(framework.getPluginIDList(), pluginID)).toBe(false);
  });

  it('Test Analytics Template Validity', () => {
    const pluginID = framework.registerPlugin(TemplatePluginFactory);
    expect(pluginID).toBeDefined();
    const pluginList = framework.getPluginIDList();
    expect(_.contains(pluginList, pluginID));
    expect(framework.makePluginInactive(pluginID)).toBe(true);
    expect(framework.makePluginActive(pluginID)).toBe(true);
  });


  it('Test Template Mixed Loading Templates and Frameworks Delayed', () => {
    const framework2 = new Analytics.Framework();
    expect(OO.Analytics.FrameworkInstanceList).toBeDefined();
    expect(OO.Analytics.FrameworkInstanceList.length).toEqual(2);
    OO.Analytics.RegisterPluginFactory(TemplatePluginFactory);
    expect(OO.Analytics.PluginFactoryList).toBeDefined();
    expect(_.contains(OO.Analytics.PluginFactoryList, TemplatePluginFactory)).toBe(true);

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
  // it('Test Template Created Before Framework', function()
  // {
  //  //erase the global references for the plugins and frameworks.
  //  OO.Analytics.PluginFactoryList = null;
  //  OO.Analytics.FrameworkInstanceList = null;
  //  OO.Analytics.RegisterPluginFactory(TemplatePluginFactory);
  //  expect(OO.Analytics.PluginFactoryList).toBeTruthy();
  //  expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
  //  expect(OO.Analytics.FrameworkInstanceList).toBeTruthy();
  //  expect(OO.Analytics.FrameworkInstanceList.length).toEqual(0);
  // });

  it('Test Setting Metadata and Processing An Event', () => {
    let metadataReceived;
    let eventProcessed;
    let paramsReceived;
    const newFactoryWithFunctionTracing = function () {
      const factory = new TemplatePluginFactory();
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
      template:
      {
        data: 'mydata',
      },
    };
    framework.setPluginMetadata(metadata);
    expect(metadataReceived).toEqual(metadata.template);
    framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PAUSED, [metadata]);
    expect(eventProcessed).toEqual(OO.Analytics.EVENTS.VIDEO_PAUSED);
    expect(paramsReceived).toEqual([metadata]);
  });

  it('Test Framework Destroy With Template', () => {
    OO.Analytics.RegisterPluginFactory(TemplatePluginFactory);
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

  it('Test Framework Destroy With Template And Multi Frameworks', () => {
    OO.Analytics.RegisterPluginFactory(TemplatePluginFactory);
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
    const plugin = new TemplatePluginFactory(framework);
    let errorOccured = false;
    try {
      Object
        .entries(plugin)
        .forEach(([, key]) => {
          if (OO._.isFunction(plugin[key])) {
            plugin[key].apply(plugin);
          }
        });
    } catch (e) {
      errorOccured = true;
    }

    expect(errorOccured).toBe(false);
  });
});

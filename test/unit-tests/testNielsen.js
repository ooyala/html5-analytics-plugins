describe('Analytics Framework Nielsen Plugin Unit Tests', function()
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

  var playerName = "Ooyala V4";

  var GGPM_STOP_EVENT = 7;//"stop";
  var GGPM_END_EVENT = 57;//"end";
  var GGPM_INITIAL_LOAD_METADATA_EVENT = 3;
  var GGPM_LOAD_METADATA_EVENT = 15;//"loadMetadata";
  var GGPM_SET_PLAYHEAD_POSITION_EVENT = 49;//"setPlayheadPosition";
  var GGPM_METADATA_TYPE_CONTENT = "content";

  //setup for individual tests
  var testSetup = function()
  {
    framework = new Analytics.Framework();

    //mock Nielsen SDK
    window.NOLCMB = {
      getInstance : function(){
        return {
          ggInitialize: function() {
          },
          ggPM: function() {
          }
        }
      }
    };

    //mute the logging becuase there will be lots of error messages
    OO.log = function(){};
  };

  //cleanup for individual tests
  var testCleanup = function()
  {
    window.NOLCMB = null;
    window._nolggGlobalParams = null;
    OO.Analytics.PluginFactoryList = [];
    OO.Analytics.FrameworkInstanceList = [];
    //return log back to normal
//    OO.log = console.log;
  };

  var createPlugin = function(framework)
  {
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
    var plugin = new nielsenPluginFactory(framework);
    plugin.init();
    plugin.setMetadata({
      "program":"myProgram",
      "isfullepisode":"N",
      //TODO: Unit test for page level titles
      // "title":"My Title",
      "crossId1":"EP018S9S290015",
      "crossId2":"ABC",
      "airdate":"20150420 21:00:00",
      "segB":"Comedy",
      "segC":"Drama"
    });
    return plugin;
  };

  beforeEach(testSetup);
  afterEach(testCleanup);

  it('Test Nielsen Plugin Validity', function()
  {
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
    expect(nielsenPluginFactory).not.toBeNull();
    var plugin = new nielsenPluginFactory();
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
  it('Test Nielsen Plugin Validity', function()
  {
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
    var pluginID = framework.registerPlugin(nielsenPluginFactory);
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
    var metadataRecieved;
    var eventProcessed;
    var paramsReceived;
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
    var newFactoryWithFunctionTracing = function()
    {
      var factory = new nielsenPluginFactory();
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
      "Nielsen":
      {
        "data": "mydata"
      }
    };
    framework.setPluginMetadata(metadata);
    expect(metadataReceived).toEqual(metadata["Nielsen"]);
    framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PAUSED, [metadata]);
    expect(eventProcessed).toEqual(OO.Analytics.EVENTS.VIDEO_PAUSED);
    expect(paramsReceived).toEqual([metadata]);
  });

  it('Test Framework Destroy With Template', function()
  {
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
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
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
    var plugin = new nielsenPluginFactory(framework);
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
  //Unit Tests created from guidelines for testing at:
  //https://engineeringforum.nielsen.com/sdk/developers/bsdk-testing-app-implement.php
  it('Nielsen plugin can initialize Nielsen SDK on init', function()
  {
    var initializeCalled = 0;
    window.NOLCMB = {
      getInstance : function(){
        return {
          ggInitialize: function() {
            initializeCalled++;
          },
          ggPM: function() {
          }
        }
      }
    };

    var plugin = createPlugin(framework);
    //TODO: The require calls init
    expect(initializeCalled).toBe(1);
  });

  it('Nielsen plugin can track loadMetadata event upon receiving metadata', function()
  {
    var loadMetadataCalled = 0;
    var metadata = null;
    window.NOLCMB = {
      getInstance : function(){
        return {
          ggInitialize: function() {
          },
          ggPM: function(event, param) {
            if (event === GGPM_INITIAL_LOAD_METADATA_EVENT)
            {
              loadMetadataCalled++;
              metadata = param;
            }
          }
        }
      }
    };
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    expect(loadMetadataCalled).toBe(1);
    expect(metadata.title).toBe("testTitle");
    expect(metadata.assetName).toBe("testTitle");
    expect(metadata.length).toBe(60);
  });

  it('Nielsen plugin can track loadMetadata event upon playing a preroll ad', function()
  {
    var initialLoadMetadataCalled = 0;
    var loadMetadataForContentCalled = 0;
    var contentMetadata = null;
    var loadMetadataForAdCalled = 0;
    var adMetadata = null;
    var stopCalled = 0;
    var stopTime = -1;
    var setPlayheadPositionCalled = 0;
    var playhead = -1;
    window.NOLCMB = {
      getInstance : function(){
        return {
          ggInitialize: function() {
          },
          ggPM: function(event, param) {
            switch(event)
            {
              case GGPM_STOP_EVENT:
                stopCalled++;
                stopTime = param;
                break;
              case GGPM_INITIAL_LOAD_METADATA_EVENT:
                initialLoadMetadataCalled++;
                contentMetadata = param;
                break;
              case GGPM_LOAD_METADATA_EVENT:
                if (param)
                {
                  if (param.type === GGPM_METADATA_TYPE_CONTENT)
                  {
                    loadMetadataForContentCalled++;
                    contentMetadata = param;
                  }
                  else
                  {
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
          }
        }
      }
    };
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var clearCounts = function()
    {
      initialLoadMetadataCalled = 0;
      loadMetadataForContentCalled = 0;
      loadMetadataForAdCalled = 0;
      stopCalled = 0;
      setPlayheadPositionCalled = 0;
    };
    simulator.addPreSimulateCallback(clearCounts);

    //received metadata
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });

    expect(initialLoadMetadataCalled).toBe(1);
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);

    //play preroll
    simulator.simulateAdBreakStarted();
    expect(stopCalled).toBe(0);

    simulator.simulateAdPlayback({
      adId: "testPrerollId",
      adDuration: 15
    });
    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe("preroll");
    expect(adMetadata.length).toBe(15);
    expect(adMetadata.assetid).toBe("testPrerollId");

    simulator.simulateVideoProgress({
      playheads : [1, 5, 15]
    });

    expect(setPlayheadPositionCalled).toBe(3);
    expect(playhead).toBe(15);

    //preroll ends
    simulator.simulateAdComplete();

    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(15);

    simulator.simulateAdBreakEnded();

    //content resumes
    simulator.simulateContentPlayback();

    expect(loadMetadataForContentCalled).toBe(1);
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);
  });

  it('Nielsen plugin can track stop and loadMetadata events upon playing a midroll ad', function()
  {
    var initialLoadMetadataCalled = 0;
    var loadMetadataForContentCalled = 0;
    var contentMetadata = null;
    var loadMetadataForAdCalled = 0;
    var adMetadata = null;
    var stopCalled = 0;
    var stopTime = -1;
    var setPlayheadPositionCalled = 0;
    var playhead = -1;
    window.NOLCMB = {
      getInstance : function(){
        return {
          ggInitialize: function() {
          },
          ggPM: function(event, param) {
            switch(event)
            {
              case GGPM_STOP_EVENT:
                stopCalled++;
                stopTime = param;
                break;
              case GGPM_INITIAL_LOAD_METADATA_EVENT:
                initialLoadMetadataCalled++;
                contentMetadata = param;
                break;
              case GGPM_LOAD_METADATA_EVENT:
                if (param)
                {
                  if (param.type === GGPM_METADATA_TYPE_CONTENT)
                  {
                    loadMetadataForContentCalled++;
                    contentMetadata = param;
                  }
                  else
                  {
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
          }
        }
      }
    };
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var clearCounts = function()
    {
      initialLoadMetadataCalled = 0;
      loadMetadataForContentCalled = 0;
      loadMetadataForAdCalled = 0;
      stopCalled = 0;
      setPlayheadPositionCalled = 0;
    };
    simulator.addPreSimulateCallback(clearCounts);

    //received metadata
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    expect(initialLoadMetadataCalled).toBe(1);
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);

    //play content
    simulator.simulateContentPlayback();

    //we do not publish another loadMetadata here as there was no preroll
    expect(loadMetadataForContentCalled).toBe(0);

    simulator.simulateVideoProgress({
      playheads : [1, 2, 3, 4, 5, 7.5, 10]
    });

    expect(setPlayheadPositionCalled).toBe(7);
    expect(playhead).toBe(10);

    //play midroll
    simulator.simulateAdBreakStarted();

    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(10);

    simulator.simulateAdPlayback({
      adId: "testMidrollId",
      adDuration: 5
    });

    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe("midroll");
    expect(adMetadata.length).toBe(5);
    expect(adMetadata.assetid).toBe("testMidrollId");

    simulator.simulateVideoProgress({
      playheads : [1, 5]
    });

    expect(setPlayheadPositionCalled).toBe(2);
    expect(playhead).toBe(5);

    //midroll ends
    simulator.simulateAdComplete();

    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(5);

    simulator.simulateAdBreakEnded();

    //content resumes
    simulator.simulateContentPlayback();

    expect(loadMetadataForContentCalled).toBe(1);
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);
  });

  it('Nielsen plugin can track setPlayheadPosition event', function()
  {
    var setPlayheadPositionCalled = 0;
    var playhead = -1;
    window.NOLCMB = {
      getInstance : function(){
        return {
          ggInitialize: function() {
          },
          ggPM: function(event, param) {
            if (event === GGPM_SET_PLAYHEAD_POSITION_EVENT)
            {
              setPlayheadPositionCalled++;
              playhead = param;
            }
          }
        }
      }
    };
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var clearCounts = function()
    {
      loadMetadataForContentCalled = 0;
      loadMetadataForAdCalled = 0;
      stopCalled = 0;
      setPlayheadPositionCalled = 0;
    };
    simulator.addPreSimulateCallback(clearCounts);

    //received metadata
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    //play content
    simulator.simulateContentPlayback(plugin);
    simulator.simulateVideoProgress({
      playheads : [1]
    });
    expect(setPlayheadPositionCalled).toBe(1);
    expect(playhead).toBe(1);
    simulator.simulateVideoProgress({
      playheads : [1.5]
    });
    //playheads are sent in 1 second intervals, so we do not want to
    //send another playhead here (1.5s - 1s < the one second interval)
    expect(setPlayheadPositionCalled).toBe(0);
    expect(playhead).toBe(1);
    simulator.simulateVideoProgress({
      playheads : [2, 3, 4, 5, 7.5, 10]
    });
    expect(setPlayheadPositionCalled).toBe(6);
    expect(playhead).toBe(10);
  });

  it('Nielsen plugin can track end event', function()
  {
    var endCalled = 0;
    var endTime = -1;
    window.NOLCMB = {
      getInstance : function(){
        return {
          ggInitialize: function() {
          },
          ggPM: function(event, param) {
            if (event === GGPM_END_EVENT)
            {
              endCalled++;
              endTime = param;
            }
          }
        }
      }
    };
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var clearCounts = function()
    {
      loadMetadataForContentCalled = 0;
      loadMetadataForAdCalled = 0;
      stopCalled = 0;
      setPlayheadPositionCalled = 0;
    };
    simulator.addPreSimulateCallback(clearCounts);

    simulator.simulateContentComplete({
      streamPosition : 60
    });
    expect(endCalled).toBe(1);
    expect(endTime).toBe(60);
  });

  it('Nielsen plugin can track end and loadMetadata events upon playing a postroll ad', function()
  {
    var loadMetadataCalled = 0;
    var adMetadata = null;
    var endCalled = 0;
    var endTime = -1;
    window.NOLCMB = {
      getInstance : function(){
        return {
          ggInitialize: function() {
          },
          ggPM: function(event, param) {
            switch(event)
            {
              case GGPM_END_EVENT:
                endCalled++;
                endTime = param;
                break;
              case GGPM_LOAD_METADATA_EVENT:
                if (param && param.type !== GGPM_METADATA_TYPE_CONTENT)
                {
                  loadMetadataCalled++;
                  adMetadata = param;
                }
                break;
            }
          }
        }
      }
    };
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var clearCounts = function()
    {
      loadMetadataForContentCalled = 0;
      loadMetadataForAdCalled = 0;
      stopCalled = 0;
      setPlayheadPositionCalled = 0;
    };
    simulator.addPreSimulateCallback(clearCounts);

    //received metadata
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });
    //play content
    simulator.simulateContentPlayback(plugin);
    simulator.simulateVideoProgress({
      playheads : [1, 2, 3, 4, 5, 7.5, 10]
    });
    //content ends
    simulator.simulateContentComplete({
      streamPosition : 60
    });

    expect(endCalled).toBe(1);
    expect(endTime).toBe(60);

    //play postroll
    simulator.simulateAdBreakStarted(plugin);
    simulator.simulateAdPlayback({
      adId: "testPostrollId",
      adDuration: 20
    });
    expect(loadMetadataCalled).toBe(1);
    expect(adMetadata.type).toBe("postroll");
    expect(adMetadata.length).toBe(20);
    expect(adMetadata.assetid).toBe("testPostrollId");
  });

  it('Nielsen Video Plugin can track all events in a typical playback', function()
  {
    var initialLoadMetadataCalled = 0;

    var loadMetadataForAdCalled = 0;
    var adMetadata = null;
    
    var loadMetadataForContentCalled = 0;
    var contentMetadata = null;

    var setPlayheadPositionCalled = 0;
    var playhead = -1;
    
    var endCalled = 0;
    var endTime = -1;

    var stopCalled = 0;
    var stopTime = -1;

    window.NOLCMB = {
      getInstance : function(){
        return {
          ggInitialize: function() {
          },
          ggPM: function(event, param) {
            switch(event)
            {
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
                if (param)
                {
                  if (param.type === GGPM_METADATA_TYPE_CONTENT)
                  {
                    loadMetadataForContentCalled++;
                    contentMetadata = param;
                  }
                  else
                  {
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
          }
        }
      }
    };
    var plugin = createPlugin(framework);
    var simulator = Utils.createPlaybackSimulator(plugin);
    var clearCounts = function()
    {
      initialLoadMetadataCalled = 0;
      loadMetadataForContentCalled = 0;
      loadMetadataForAdCalled = 0;
      stopCalled = 0;
      setPlayheadPositionCalled = 0;
    };
    simulator.addPreSimulateCallback(clearCounts);

    //received metadata
    simulator.simulatePlayerLoad({
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60000
    });

    expect(initialLoadMetadataCalled).toBe(1);
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);

    //play preroll
    simulator.simulateAdBreakStarted(plugin);
    simulator.simulateAdPlayback({
      adId: "testPrerollId",
      adDuration: 15
    });

    expect(stopCalled).toBe(0);

    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe("preroll");
    expect(adMetadata.length).toBe(15);
    expect(adMetadata.assetid).toBe("testPrerollId");

    simulator.simulateVideoProgress({
      playheads : [1, 5, 10, 15]
    });

    expect(setPlayheadPositionCalled).toBe(4);
    expect(playhead).toBe(15);

    //preroll ends
    simulator.simulateAdComplete(plugin);

    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(15);

    simulator.simulateAdBreakEnded(plugin);

    //play content
    simulator.simulateContentPlayback(plugin);

    expect(loadMetadataForContentCalled).toBe(1);
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);

    simulator.simulateVideoProgress({
      playheads : [1, 2, 3, 4, 5, 7.5, 10]
    });

    expect(setPlayheadPositionCalled).toBe(7);
    expect(playhead).toBe(10);

    //play midroll
    simulator.simulateAdBreakStarted(plugin);
    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(10);

    simulator.simulateAdPlayback({
      adId: "testMidrollId",
      adDuration: 5
    });

    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe("midroll");
    expect(adMetadata.length).toBe(5);
    expect(adMetadata.assetid).toBe("testMidrollId");

    simulator.simulateVideoProgress({
      playheads : [1, 5]
    });

    expect(setPlayheadPositionCalled).toBe(2);
    expect(playhead).toBe(5);

    //midroll ends
    simulator.simulateAdComplete(plugin);

    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(5);

    simulator.simulateAdBreakEnded(plugin);

    //content resumes
    simulator.simulateContentPlayback(plugin);

    expect(loadMetadataForContentCalled).toBe(1);
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);

    simulator.simulateVideoProgress({
      playheads : [11, 15, 30, 45]
    });

    expect(setPlayheadPositionCalled).toBe(4);
    expect(playhead).toBe(45);

    //content ends
    simulator.simulateContentComplete({
      streamPosition : 60
    });

    expect(setPlayheadPositionCalled).toBe(1);
    expect(playhead).toBe(60);

    expect(endCalled).toBe(1);
    expect(endTime).toBe(60);

    //play postroll
    simulator.simulateAdBreakStarted(plugin);
    simulator.simulateAdPlayback({
      adId: "testPostrollId",
      adDuration: 20
    });
    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe("postroll");
    expect(adMetadata.length).toBe(20);
    expect(adMetadata.assetid).toBe("testPostrollId");

    simulator.simulateVideoProgress({
      playheads : [1, 5, 10, 15, 20]
    });

    expect(setPlayheadPositionCalled).toBe(5);
    expect(playhead).toBe(20);

    //postroll ends
    simulator.simulateAdComplete(plugin);

    expect(stopCalled).toBe(1);
    expect(stopTime).toBe(20);

    simulator.simulateAdBreakEnded(plugin);
  });
});

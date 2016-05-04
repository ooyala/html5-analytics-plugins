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

  var GGPM_STOP_EVENT = "stop";
  var GGPM_END_EVENT = "end";
  var GGPM_LOAD_METADATA_EVENT = "loadMetadata";
  var GGPM_SET_PLAYHEAD_POSITION_EVENT = "setPlayheadPosition";
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

    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
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
            if (event === GGPM_LOAD_METADATA_EVENT)
            {
              loadMetadataCalled++;
              metadata = param;
            }
          }
        }
      }
    };
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
    var plugin = new nielsenPluginFactory(framework);
    //TODO: Calling init again because the require is calling init as well
    plugin.init();
    Utils.simulatePlayerLoad(plugin, {
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60
    });
    expect(loadMetadataCalled).toBe(1);
    expect(metadata.title).toBe("testTitle");
    expect(metadata.assetName).toBe("testTitle");
    expect(metadata.length).toBe(60);
  });

  it('Nielsen plugin can track loadMetadata event upon playing a preroll ad', function()
  {
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
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
    var plugin = new nielsenPluginFactory(framework);
    //TODO: Calling init again because the require is calling init as well
    plugin.init();
    //received metadata
    Utils.simulatePlayerLoad(plugin, {
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60
    });

    expect(loadMetadataForContentCalled).toBe(1);
    loadMetadataForContentCalled = 0;
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);

    //play preroll
    Utils.simulateAdBreakStarted(plugin);
    expect(stopCalled).toBe(1);
    stopCalled = 0;
    expect(stopTime).toBe(0);

    Utils.simulateAdPlayback(plugin, {
      adId: "testPrerollId",
      adDuration: 15
    });
    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe("preroll");
    expect(adMetadata.length).toBe(15);
    expect(adMetadata.assetid).toBe("testPrerollId");

    Utils.simulateVideoProgress(plugin, {
      playheads : [1, 5, 15]
    });

    expect(setPlayheadPositionCalled).toBe(3);
    setPlayheadPositionCalled = 0;
    expect(playhead).toBe(15);

    //preroll ends
    Utils.simulateAdComplete(plugin);

    expect(stopCalled).toBe(1);
    stopCalled = 0;
    expect(stopTime).toBe(15);

    Utils.simulateAdBreakEnded(plugin);

    //content resumes
    Utils.simulateContentPlayback(plugin);

    expect(loadMetadataForContentCalled).toBe(1);
    loadMetadataForContentCalled = 0;
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);
  });

  it('Nielsen plugin can track stop and loadMetadata events upon playing a midroll ad', function()
  {
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
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
    var plugin = new nielsenPluginFactory(framework);
    //TODO: Calling init again because the require is calling init as well
    plugin.init();
    //received metadata
    Utils.simulatePlayerLoad(plugin, {
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60
    });
    expect(loadMetadataForContentCalled).toBe(1);
    loadMetadataForContentCalled = 0;
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);

    //play content
    Utils.simulateContentPlayback(plugin);

    //we do not publish another loadMetadata here as there was no preroll
    expect(loadMetadataForContentCalled).toBe(0);

    Utils.simulateVideoProgress(plugin, {
      playheads : [1, 2, 3, 4, 5, 7.5, 10]
    });

    expect(setPlayheadPositionCalled).toBe(7);
    setPlayheadPositionCalled = 0;
    expect(playhead).toBe(10);

    //play midroll
    Utils.simulateAdBreakStarted(plugin);

    expect(stopCalled).toBe(1);
    stopCalled = 0;
    expect(stopTime).toBe(10);

    Utils.simulateAdPlayback(plugin, {
      adId: "testMidrollId",
      adDuration: 5
    });

    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe("midroll");
    expect(adMetadata.length).toBe(5);
    expect(adMetadata.assetid).toBe("testMidrollId");

    Utils.simulateVideoProgress(plugin, {
      playheads : [1, 5]
    });

    expect(setPlayheadPositionCalled).toBe(2);
    setPlayheadPositionCalled = 0;
    expect(playhead).toBe(5);

    //midroll ends
    Utils.simulateAdComplete(plugin);

    expect(stopCalled).toBe(1);
    stopCalled = 0;
    expect(stopTime).toBe(5);

    Utils.simulateAdBreakEnded(plugin);

    //content resumes
    Utils.simulateContentPlayback(plugin);

    expect(loadMetadataForContentCalled).toBe(1);
    loadMetadataForContentCalled = 0;
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
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
    var plugin = new nielsenPluginFactory(framework);
    //TODO: Calling init again because the require is calling init as well
    plugin.init();
    //received metadata
    Utils.simulatePlayerLoad(plugin, {
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60
    });
    //play content
    Utils.simulateContentPlayback(plugin);
    Utils.simulateVideoProgress(plugin, {
      playheads : [1]
    });
    expect(setPlayheadPositionCalled).toBe(1);
    expect(playhead).toBe(1);
    Utils.simulateVideoProgress(plugin, {
      playheads : [1.5]
    });
    //playheads are sent in 1 second intervals, so we do not want to
    //send another playhead here (1.5s - 1s < the one second interval)
    expect(setPlayheadPositionCalled).toBe(1);
    expect(playhead).toBe(1);
    Utils.simulateVideoProgress(plugin, {
      playheads : [2, 3, 4, 5, 7.5, 10]
    });
    expect(setPlayheadPositionCalled).toBe(7);
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
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
    var plugin = new nielsenPluginFactory(framework);
    //TODO: Calling init again because the require is calling init as well
    plugin.init();
    Utils.simulateContentComplete(plugin, {
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
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
    var plugin = new nielsenPluginFactory(framework);
    //TODO: Calling init again because the require is calling init as well
    plugin.init();
    //received metadata
    Utils.simulatePlayerLoad(plugin, {
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60
    });
    //play content
    Utils.simulateContentPlayback(plugin);
    Utils.simulateVideoProgress(plugin, {
      playheads : [1, 2, 3, 4, 5, 7.5, 10]
    });
    //content ends
    Utils.simulateContentComplete(plugin, {
      streamPosition : 60
    });

    expect(endCalled).toBe(1);
    expect(endTime).toBe(60);

    //play postroll
    Utils.simulateAdBreakStarted(plugin);
    Utils.simulateAdPlayback(plugin, {
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
    var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
    var plugin = new nielsenPluginFactory(framework);
    //TODO: Calling init again because the require is calling init as well
    plugin.init();
    //received metadata
    Utils.simulatePlayerLoad(plugin, {
      embedCode: "testEmbedCode",
      title: "testTitle",
      duration: 60
    });

    expect(loadMetadataForContentCalled).toBe(1);
    loadMetadataForContentCalled = 0;
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);

    //play preroll
    Utils.simulateAdBreakStarted(plugin);
    Utils.simulateAdPlayback(plugin, {
      adId: "testPrerollId",
      adDuration: 15
    });

    expect(stopCalled).toBe(1);
    stopCalled = 0;
    expect(stopTime).toBe(0);

    expect(loadMetadataForAdCalled).toBe(1);
    loadMetadataForAdCalled = 0;
    expect(adMetadata.type).toBe("preroll");
    expect(adMetadata.length).toBe(15);
    expect(adMetadata.assetid).toBe("testPrerollId");

    Utils.simulateVideoProgress(plugin, {
      playheads : [1, 5, 10, 15]
    });

    expect(setPlayheadPositionCalled).toBe(4);
    setPlayheadPositionCalled = 0;
    expect(playhead).toBe(15);

    //preroll ends
    Utils.simulateAdComplete(plugin);

    expect(stopCalled).toBe(1);
    stopCalled = 0;
    expect(stopTime).toBe(15);

    Utils.simulateAdBreakEnded(plugin);

    //play content
    Utils.simulateContentPlayback(plugin);

    expect(loadMetadataForContentCalled).toBe(1);
    loadMetadataForContentCalled = 0;
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);

    Utils.simulateVideoProgress(plugin, {
      playheads : [1, 2, 3, 4, 5, 7.5, 10]
    });

    expect(setPlayheadPositionCalled).toBe(7);
    setPlayheadPositionCalled = 0;
    expect(playhead).toBe(10);

    //play midroll
    Utils.simulateAdBreakStarted(plugin);
    Utils.simulateAdPlayback(plugin, {
      adId: "testMidrollId",
      adDuration: 5
    });
    expect(stopCalled).toBe(1);
    stopCalled = 0;
    expect(stopTime).toBe(10);

    expect(loadMetadataForAdCalled).toBe(1);
    loadMetadataForAdCalled = 0;
    expect(adMetadata.type).toBe("midroll");
    expect(adMetadata.length).toBe(5);
    expect(adMetadata.assetid).toBe("testMidrollId");

    Utils.simulateVideoProgress(plugin, {
      playheads : [1, 5]
    });

    expect(setPlayheadPositionCalled).toBe(2);
    setPlayheadPositionCalled = 0;
    expect(playhead).toBe(5);

    //midroll ends
    Utils.simulateAdComplete(plugin);

    expect(stopCalled).toBe(1);
    stopCalled = 0;
    expect(stopTime).toBe(5);

    Utils.simulateAdBreakEnded(plugin);

    //content resumes
    Utils.simulateContentPlayback(plugin);

    expect(loadMetadataForContentCalled).toBe(1);
    loadMetadataForContentCalled = 0;
    expect(contentMetadata.title).toBe("testTitle");
    expect(contentMetadata.assetName).toBe("testTitle");
    expect(contentMetadata.length).toBe(60);

    Utils.simulateVideoProgress(plugin, {
      playheads : [11, 15, 30, 45]
    });

    expect(setPlayheadPositionCalled).toBe(4);
    setPlayheadPositionCalled = 0;
    expect(playhead).toBe(45);

    //content ends
    Utils.simulateContentComplete(plugin, {
      streamPosition : 60
    });

    expect(setPlayheadPositionCalled).toBe(1);
    setPlayheadPositionCalled = 0;
    expect(playhead).toBe(60);

    expect(endCalled).toBe(1);
    expect(endTime).toBe(60);

    setPlayheadPositionCalled = 0;

    //play postroll
    Utils.simulateAdBreakStarted(plugin);
    Utils.simulateAdPlayback(plugin, {
      adId: "testPostrollId",
      adDuration: 20
    });
    expect(loadMetadataForAdCalled).toBe(1);
    expect(adMetadata.type).toBe("postroll");
    expect(adMetadata.length).toBe(20);
    expect(adMetadata.assetid).toBe("testPostrollId");

    Utils.simulateVideoProgress(plugin, {
      playheads : [1, 5, 10, 15, 20]
    });

    expect(setPlayheadPositionCalled).toBe(5);
    setPlayheadPositionCalled = 0;
    expect(playhead).toBe(20);

    //postroll ends
    Utils.simulateAdComplete(plugin);

    expect(stopCalled).toBe(1);
    stopCalled = 0;
    expect(stopTime).toBe(20);

    Utils.simulateAdBreakEnded(plugin);
  });

  //it('Delegate can provide valid Video Info', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
  //    embedCode : "abcde"
  //  }]);
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED, [{
  //    title : "testTitle",
  //    duration : 20
  //  }]);
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
  //    streamPosition : 10
  //  }]);
  //  var delegate = plugin.getPlayerDelegate();
  //  var videoInfo = delegate.getVideoInfo();
  //  expect(videoInfo.id).toBe("abcde");
  //  expect(videoInfo.name).toBe("testTitle");
  //  expect(videoInfo.length).toBe(20);
  //  expect(videoInfo.playerName).toBe(playerName);
  //  expect(videoInfo.playhead).toBe(10);
  //});
  //
  //it('Delegate can provide valid Ad Break Info', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
  //    streamPosition : 10
  //  }]);
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
  //  var delegate = plugin.getPlayerDelegate();
  //  var adBreakInfo = delegate.getAdBreakInfo();
  //  expect(adBreakInfo.playerName).toBe(playerName);
  //  expect(adBreakInfo.position).toBe(1);
  //  expect(adBreakInfo.startTime).toBe(10);
  //});
  //
  //it('Delegate can provide valid Ad Info', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
  //    adId : "zyxw",
  //    adDuration : 15,
  //    adPodPosition : 1
  //  }]);
  //  var delegate = plugin.getPlayerDelegate();
  //  var adInfo = delegate.getAdInfo();
  //  expect(adInfo.id).toBe("zyxw");
  //  expect(adInfo.length).toBe(15);
  //  expect(adInfo.position).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin can trackSessionStart', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackSessionStart = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED);
  //  expect(called).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin can trackPlay', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackPlay = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
  //  expect(called).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin can trackVideoLoad', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackVideoLoad = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
  //  expect(called).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin does not trackVideoLoad if we are resuming playback from a pause', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var videoLoadCalled = 0;
  //  var playCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackVideoLoad = function()
  //  {
  //    videoLoadCalled++;
  //  };
  //  plugin.nielsenVideoPlayerPlugin.trackPlay = function()
  //  {
  //    playCalled++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSED);
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
  //  expect(videoLoadCalled).toBe(1);
  //  expect(playCalled).toBe(2);
  //});
  //
  //it('Nielsen Video Plugin can trackPause', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackPause = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSED);
  //  expect(called).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin can trackSeekStart', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackSeekStart = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED);
  //  expect(called).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin can trackSeekStart', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackSeekStart = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED);
  //  expect(called).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin can trackSeekComplete', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackSeekComplete = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
  //    streamPosition : 10
  //  }]);
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED);
  //  expect(called).toBe(1);
  //  var delegate = plugin.getPlayerDelegate();
  //  var videoInfo = delegate.getVideoInfo();
  //  expect(videoInfo.playhead).toBe(10);
  //});
  //
  //it('Nielsen Video Plugin can trackComplete', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackComplete = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_COMPLETED);
  //  expect(called).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin can trackVideoUnload', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackVideoUnload = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_COMPLETED);
  //  expect(called).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin can trackBufferStart', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackBufferStart = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED);
  //  expect(called).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin can trackBufferComplete', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackBufferComplete = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED);
  //  expect(called).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin can trackAdStart', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackAdStart = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
  //    adId : "zyxw",
  //    adDuration : 15,
  //    adPodPosition : 1
  //  }]);
  //  expect(called).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin can trackAdComplete', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var called = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackAdComplete = function()
  //  {
  //    called++;
  //  };
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
  //  expect(called).toBe(1);
  //});
  //
  //it('Nielsen Video Plugin can track all events in a typical playback', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var delegate = plugin.getPlayerDelegate();
  //
  //  var adStartCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackAdStart = function()
  //  {
  //    adStartCalled++;
  //  };
  //
  //  var adCompleteCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackAdComplete = function()
  //  {
  //    adCompleteCalled++;
  //  };
  //
  //  var sessionStartCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackSessionStart = function()
  //  {
  //    sessionStartCalled++;
  //  };
  //
  //  var videoLoadCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackVideoLoad = function()
  //  {
  //    videoLoadCalled++;
  //  };
  //
  //  var bufferStartCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackBufferStart = function()
  //  {
  //    bufferStartCalled++;
  //  };
  //
  //  var bufferCompleteCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackBufferComplete = function()
  //  {
  //    bufferCompleteCalled++;
  //  };
  //
  //  var playCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackPlay = function()
  //  {
  //    playCalled++;
  //  };
  //
  //  var pauseCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackPause = function()
  //  {
  //    pauseCalled++;
  //  };
  //
  //  var seekStartCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackSeekStart = function()
  //  {
  //    seekStartCalled++;
  //  };
  //
  //  var seekCompleteCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackSeekComplete = function()
  //  {
  //    seekCompleteCalled++;
  //  };
  //
  //  var completeCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackComplete = function()
  //  {
  //    completeCalled++;
  //  };
  //
  //  var videoUnloadCalled = 0;
  //  plugin.nielsenVideoPlayerPlugin.trackVideoUnload = function()
  //  {
  //    videoUnloadCalled++;
  //  };
  //
  //  var videoInfo, adBreakInfo, adInfo;
  //
  //  //initialization
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED, [{
  //    title : "testTitle",
  //    duration : 20
  //  }]);
  //  videoInfo = delegate.getVideoInfo();
  //  expect(videoInfo.name).toBe("testTitle");
  //  expect(videoInfo.length).toBe(20);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
  //    embedCode : "abcde"
  //  }]);
  //  videoInfo = delegate.getVideoInfo();
  //  expect(videoInfo.id).toBe("abcde");
  //
  //  //user clicks play
  //  plugin.processEvent(OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED);
  //  expect(sessionStartCalled).toBe(1);
  //
  //  //preroll
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
  //  adBreakInfo = delegate.getAdBreakInfo();
  //  expect(adBreakInfo.playerName).toBe(playerName);
  //  expect(adBreakInfo.position).toBe(1);
  //  expect(adBreakInfo.startTime).toBe(0);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
  //    adId : "preroll",
  //    adDuration : 15,
  //    adPodPosition : 1
  //  }]);
  //  adInfo = delegate.getAdInfo();
  //  expect(adInfo.id).toBe("preroll");
  //  expect(adInfo.length).toBe(15);
  //  expect(adInfo.position).toBe(1);
  //  expect(adStartCalled).toBe(1);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
  //  expect(adCompleteCalled).toBe(1);
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);
  //
  //  //main content
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED);
  //  expect(bufferStartCalled).toBe(1);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED);
  //  expect(bufferCompleteCalled).toBe(1);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
  //  expect(videoLoadCalled).toBe(1);
  //  expect(playCalled).toBe(1);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSED);
  //  expect(pauseCalled).toBe(1);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
  //  expect(videoLoadCalled).toBe(1);
  //  expect(playCalled).toBe(2);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED);
  //  expect(seekStartCalled).toBe(1);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
  //    streamPosition : 9
  //  }]);
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED);
  //  expect(seekCompleteCalled).toBe(1);
  //  videoInfo = delegate.getVideoInfo();
  //  expect(videoInfo.playhead).toBe(9);
  //
  //  //midroll - podded of 2
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
  //    streamPosition : 10
  //  }]);
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
  //  adBreakInfo = delegate.getAdBreakInfo();
  //  expect(adBreakInfo.playerName).toBe(playerName);
  //  expect(adBreakInfo.position).toBe(1);
  //  expect(adBreakInfo.startTime).toBe(10);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
  //    adId : "midroll",
  //    adDuration : 15,
  //    adPodPosition : 1
  //  }]);
  //  adInfo = delegate.getAdInfo();
  //  expect(adInfo.id).toBe("midroll");
  //  expect(adInfo.length).toBe(15);
  //  expect(adInfo.position).toBe(1);
  //  expect(adStartCalled).toBe(2);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
  //  expect(adCompleteCalled).toBe(2);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
  //    adId : "midroll2",
  //    adDuration : 5,
  //    adPodPosition : 2
  //  }]);
  //  adInfo = delegate.getAdInfo();
  //  expect(adInfo.id).toBe("midroll2");
  //  expect(adInfo.length).toBe(5);
  //  expect(adInfo.position).toBe(2);
  //  expect(adStartCalled).toBe(3);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
  //  expect(adCompleteCalled).toBe(3);
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);
  //
  //  //main content resumes
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
  //  expect(videoLoadCalled).toBe(1);
  //  expect(playCalled).toBe(3);
  //
  //  //TODO: Should completed message go before postroll?
  //  //postroll
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
  //    streamPosition : 60
  //  }]);
  //  videoInfo = delegate.getVideoInfo();
  //  expect(videoInfo.playhead).toBe(60);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
  //  adBreakInfo = delegate.getAdBreakInfo();
  //  expect(adBreakInfo.playerName).toBe(playerName);
  //  expect(adBreakInfo.position).toBe(1);
  //  expect(adBreakInfo.startTime).toBe(60);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
  //    adId : "postroll",
  //    adDuration : 30,
  //    adPodPosition : 1
  //  }]);
  //  adInfo = delegate.getAdInfo();
  //  expect(adInfo.id).toBe("postroll");
  //  expect(adInfo.length).toBe(30);
  //  expect(adInfo.position).toBe(1);
  //  expect(adStartCalled).toBe(4);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
  //  expect(adCompleteCalled).toBe(4);
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);
  //
  //  //main video ends
  //  plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_COMPLETED);
  //  expect(completeCalled).toBe(1);
  //  expect(videoUnloadCalled).toBe(1);
  //
  //  //replay
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED);
  //  videoInfo = delegate.getVideoInfo();
  //  expect(videoInfo.playhead).toBe(0);
  //});
  //
  ////TODO: This only tests for function coverage of the Fake Video Plugin
  //it('Nielsen Video Plugin can track all events in a typical playback without mocks', function()
  //{
  //  var nielsenPluginFactory = require(SRC_ROOT + "plugins/Nielsen.js");
  //  var plugin = new nielsenPluginFactory(framework);
  //  var delegate = plugin.getPlayerDelegate();
  //
  //  var videoInfo, adBreakInfo, adInfo;
  //
  //  //initialization
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED, [{
  //    title : "testTitle",
  //    duration : 20
  //  }]);
  //  videoInfo = delegate.getVideoInfo();
  //  expect(videoInfo.name).toBe("testTitle");
  //  expect(videoInfo.length).toBe(20);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
  //    embedCode : "abcde"
  //  }]);
  //  videoInfo = delegate.getVideoInfo();
  //  expect(videoInfo.id).toBe("abcde");
  //
  //  //user clicks play
  //  plugin.processEvent(OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED);
  //
  //  //preroll
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
  //  adBreakInfo = delegate.getAdBreakInfo();
  //  expect(adBreakInfo.playerName).toBe(playerName);
  //  expect(adBreakInfo.position).toBe(1);
  //  expect(adBreakInfo.startTime).toBe(0);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
  //    adId : "preroll",
  //    adDuration : 15,
  //    adPodPosition : 1
  //  }]);
  //  adInfo = delegate.getAdInfo();
  //  expect(adInfo.id).toBe("preroll");
  //  expect(adInfo.length).toBe(15);
  //  expect(adInfo.position).toBe(1);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);
  //
  //  //main content
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSED);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
  //    streamPosition : 9
  //  }]);
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED);
  //  videoInfo = delegate.getVideoInfo();
  //  expect(videoInfo.playhead).toBe(9);
  //
  //  //midroll - podded of 2
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
  //    streamPosition : 10
  //  }]);
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
  //  adBreakInfo = delegate.getAdBreakInfo();
  //  expect(adBreakInfo.playerName).toBe(playerName);
  //  expect(adBreakInfo.position).toBe(1);
  //  expect(adBreakInfo.startTime).toBe(10);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
  //    adId : "midroll",
  //    adDuration : 15,
  //    adPodPosition : 1
  //  }]);
  //  adInfo = delegate.getAdInfo();
  //  expect(adInfo.id).toBe("midroll");
  //  expect(adInfo.length).toBe(15);
  //  expect(adInfo.position).toBe(1);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
  //    adId : "midroll2",
  //    adDuration : 5,
  //    adPodPosition : 2
  //  }]);
  //  adInfo = delegate.getAdInfo();
  //  expect(adInfo.id).toBe("midroll2");
  //  expect(adInfo.length).toBe(5);
  //  expect(adInfo.position).toBe(2);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);
  //
  //  //main content resumes
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
  //
  //  //TODO: Should completed message go before postroll?
  //  //postroll
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
  //    streamPosition : 60
  //  }]);
  //  videoInfo = delegate.getVideoInfo();
  //  expect(videoInfo.playhead).toBe(60);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
  //  adBreakInfo = delegate.getAdBreakInfo();
  //  expect(adBreakInfo.playerName).toBe(playerName);
  //  expect(adBreakInfo.position).toBe(1);
  //  expect(adBreakInfo.startTime).toBe(60);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
  //    adId : "postroll",
  //    adDuration : 30,
  //    adPodPosition : 1
  //  }]);
  //  adInfo = delegate.getAdInfo();
  //  expect(adInfo.id).toBe("postroll");
  //  expect(adInfo.length).toBe(30);
  //  expect(adInfo.position).toBe(1);
  //
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
  //  plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);
  //
  //  //main video ends
  //  plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_COMPLETED);
  //
  //  //replay
  //  plugin.processEvent(OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED);
  //  videoInfo = delegate.getVideoInfo();
  //  expect(videoInfo.playhead).toBe(0);
  //});
});

require(SRC_ROOT + "framework/InitAnalyticsNamespace.js");
require(SRC_ROOT + "framework/AnalyticsConstants.js");
require(COMMON_SRC_ROOT + "utils/constants.js");


if (!OO.Analytics.Utils)
{
  OO.Analytics.Utils = {};

  var Utils = OO.Analytics.Utils;

  Utils.createValidPluginFactory = function(name)
  {
    return function ()
    {
      var myPlugin = {};
      var pluginID;
      for (i = 0; i < OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS.length; i++)
      {
        myPlugin[OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS[i]] = function() {};
      }

      //get name and version need to return a truthy string
      myPlugin.getName = function()
      {
        if (!name)
        {
          return "testName";
        }

        return name;
      };

      myPlugin.getVersion = function()
      {
        return "testVersion";
      };

      myPlugin.setPluginID = function(id)
      {
        pluginID = id;
      };

      myPlugin.getPluginID = function()
      {
        return pluginID;
      };

      return myPlugin;
    }
  };

  Utils.createMissingFunctionFactory = function(functionToRemove)
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var badPlugin = new validFactory();
      delete badPlugin[functionToRemove];
      return badPlugin;
    },this);
  };

  Utils.createExtraFunctionFactory = function(functionToAdd)
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var extraFuncFactory = new validFactory();
      extraFuncFactory[functionToAdd] = function() {};
      return extraFuncFactory;
    },this);
  };

  Utils.createWrongNameReturnTypeFactory = function()
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var wrongReturnFactory = new validFactory();
      wrongReturnFactory['getName'] = function()
      {
        return 5
      };
      return wrongReturnFactory;
    },this);
  };

  Utils.createWrongVersionReturnTypeFactory = function()
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var wrongReturnFactory = new validFactory();
      wrongReturnFactory['getVersion'] = function()
      {
        return 5;
      };
      return wrongReturnFactory;
    },this);
  };

  Utils.createRecordedEventsFactory = function()
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var eventFactory = new validFactory();
      eventFactory.processRecordedEvents = function(events)
      {
        this.recordedEvents = events;
      }
      return eventFactory;
    },this);
  };

  Utils.createFactoryWithGlobalAccessToPluginInstance = function()
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var plugin = new validFactory();
      plugin.msgReceivedList = [];
      plugin.active = true;

      plugin.init = function()
      {
        this.initWasCalled = true;
      }

      plugin.setMetadata = function(metadata)
      {
        this.metadata = metadata;
      }

      plugin.processEvent = function(msgName, params)
      {
        this.msgReceivedList.push(msgName);
      };

      if (!OO.Analytics.Framework.TEST)
      {
        OO.Analytics.Framework.TEST = [];
      }
      OO.Analytics.Framework.TEST.push(plugin);
      return plugin;
    },this);
  };

  Utils.createFactoryThatThrowsErrorOn = function(funcName)
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var badPlugin = new validFactory();
      badPlugin[funcName] = function()
      {
        throw "Error";
      };
      return badPlugin;
    },this);
  };

  Utils.createFactoryToTestConstructorParams = function()
  {
    return OO._.bind(function(framework)
    {
      var validFactory = Utils.createValidPluginFactory();
      var validPlugin = new validFactory();
      if (!OO.Analytics.Framework.TEST)
      {
        OO.Analytics.Framework.TEST = {};
        OO.Analytics.Framework.TEST.frameworkParam = framework;
      }
      return validPlugin;
    },this);
  };

  var PlaybackSimulator = function(plugin)
  {
    var preSimulateCallback;

    this.addPreSimulateCallback = function(cb)
    {
      preSimulateCallback = cb;
    };

    this.clearPreSimulateCallback = function()
    {
      preSimulateCallback = null;
    };

    var preSimulate = function()
    {
      if (typeof preSimulateCallback === "function")
      {
        preSimulateCallback();
      }
    };

    this.simulatePlayerLoad = function(metadata)
    {
      preSimulate();
      //TODO: Validate metadata
      if (metadata)
      {
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED);
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
          embedCode: metadata.embedCode
        }]);
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED, [{
          title: metadata.title,
          duration: metadata.duration
        }]);
        var streamType = metadata.streamType ? metadata.streamType : OO.Analytics.STREAM_TYPE.VOD;
        plugin.processEvent(OO.Analytics.EVENTS.STREAM_TYPE_UPDATED, [{
          streamType: streamType
        }]);
      }
    };

    this.simulateStreamMetadataUpdated = function(metadata)
    {
      preSimulate();
      metadata = metadata || {};
      if (metadata)
      {
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED, [{
          base: metadata.base || {},
          modules: metadata.modules || {}
        }]);
      }
    };

    this.simulatePlayerStart = function()
    {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED);
    };

    this.simulateContentPlayback = function()
    {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
    };

    this.simulateVideoPause = function()
    {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSE_REQUESTED);
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSED);
    };

    this.simulateVideoBufferingStarted = function()
    {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED);
    };

    this.simulateVideoBufferingEnded = function()
    {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED);
    };

    this.simulateVideoProgress = function(metadata)
    {
      preSimulate();
      //TODO: Validate metadata
      if (metadata)
      {
        var playheads = metadata.playheads;
        var videoId = metadata.videoId ? metadata.videoId : OO.VIDEO.MAIN;
        var totalStreamDuration = metadata.totalStreamDuration ? metadata.totalStreamDuration : 60;
        _.each(playheads, function(playhead) {
          plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
            streamPosition : playhead,
            videoId: videoId,
            totalStreamDuration: totalStreamDuration
          }]);
        });
      }
    };

    this.simulateVideoSeek = function()
    {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED);
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED);
    };

    this.simulateContentComplete = function(metadata)
    {
      preSimulate();
      //TODO: Validate metadata
      if (metadata)
      {
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
          streamPosition : metadata.streamPosition
        }]);
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_CONTENT_COMPLETED);
      }
    };

    this.simulatePlaybackComplete = function()
    {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_COMPLETED);
    };

    this.simulateAdBreakStarted = function()
    {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
    };

    this.simulateAdPlayback = function(metadata)
    {
      preSimulate();
      //TODO: Validate metadata
      if (metadata)
      {
        plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
          adType: metadata.adType,
          adMetadata: {
            adId: metadata.adMetadata.adId,
            adDuration: metadata.adMetadata.adDuration,
            adPodPosition: metadata.adMetadata.adPodPosition
          }
        }]);
      }
    };

    this.simulateAdComplete = function(metadata)
    {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED, [{
        adType: metadata.adType,
        adId: metadata.adId
      }]);
    };

    this.simulateAdBreakEnded = function()
    {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);
    };

    this.simulateReplay = function()
    {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED);
    };

    this.simulateBitrateChange = function(bitrateProfile)
    {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_BITRATE_CHANGED, [{
        bitrate: bitrateProfile.bitrate,
        width: bitrateProfile.width,
        height: bitrateProfile.height,
        id: bitrateProfile.id
      }]);
    };
  };

  Utils.createPlaybackSimulator = function(plugin)
  {
    return new PlaybackSimulator(plugin);
  };
}

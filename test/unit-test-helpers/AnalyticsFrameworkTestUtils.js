require(SRC_ROOT + "framework/InitAnalyticsNamespace.js");
require(SRC_ROOT + "framework/AnalyticsConstants.js");


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
      }

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

  Utils.simulatePlayerLoad = function(plugin, metadata)
  {
    //TODO: Validate metadata
    if (plugin && metadata)
    {
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
        embedCode: metadata.embedCode
      }]);
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED, [{
        title: metadata.title,
        duration: metadata.duration
      }]);
    }
  };

  Utils.simulateContentPlayback = function(plugin)
  {
    if (plugin)
    {
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
    }
  };

  Utils.simulateVideoProgress = function(plugin, metadata)
  {
    //TODO: Validate metadata
    if (plugin && metadata)
    {
      var playheads = metadata.playheads;
      _.each(playheads, function(playhead) {
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
          streamPosition : playhead
        }]);
      });
    }
  };

  Utils.simulateContentComplete = function(plugin, metadata)
  {
    //TODO: Validate metadata
    if (plugin && metadata)
    {
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
        streamPosition : metadata.streamPosition
      }]);
      plugin.processEvent(OO.Analytics.EVENTS.CONTENT_COMPLETED);
    }
  };

  Utils.simulateAdBreakStarted = function(plugin)
  {
    if (plugin)
    {
      plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
    }
  };

  Utils.simulateAdPlayback = function(plugin, metadata)
  {
    //TODO: Validate metadata
    if (plugin && metadata)
    {
      plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
        adId: metadata.adId,
        adDuration: metadata.adDuration
      }]);
    }
  };

  Utils.simulateAdComplete = function(plugin)
  {
    if (plugin)
    {
      plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED);
    }
  };

  Utils.simulateAdBreakEnded = function(plugin)
  {
    if (plugin)
    {
      plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);
    }
  };
}

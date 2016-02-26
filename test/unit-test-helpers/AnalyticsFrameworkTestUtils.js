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

      plugin.isActive = function()
      {
        return plugin.active;
      }

      plugin.makeActive = function()
      {
        plugin.active = true;
      }

      plugin.makeInactive = function()
      {
        plugin.active = false;
      }

      if (!OO.Analytics.Framework.TEST)
      {
        OO.Analytics.Framework.TEST = [];
      }
      OO.Analytics.Framework.TEST.push(plugin);
      return plugin;
    },this);
  };

  Utils.createFactoryThatThrowsErrorOnGetName = function()
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var badPlugin = new validFactory();
      badPlugin.getName = function()
      {
        throw "Error";
      };
      return badPlugin;
    },this);
  };

  Utils.createFactoryThatThrowsErrorOnProcessEvent = function()
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var badPlugin = new validFactory();
      badPlugin.processEvent = function()
      {
        throw "Error";
      };
      return badPlugin;
    },this);
  };
}

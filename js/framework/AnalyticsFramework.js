require("../../html5-common/js/classes/message_bus.js")
var OoyalaAnalyticsFramework = function OoyalaAnalyticsFramework()
{
  var registeredPlugins = {};
  var mb = new OO.MessageBus();
  var recordedMessages = [];

  var uniquePluginId = 0;

  const EVENTS =
  {
    //messages for main video
    //TODO see if we need to distinguish between video and ad messages
    VIDEO_FIRST_PLAY_REQUESTED : 'video_first_play_requested',
    VIDEO_PLAY_REQUESTED : 'video_play_requested',
    VIDEO_PAUSE_REQUESTED : 'video_pause_requested',
    VIDEO_RESUME_REQUESTED : 'video_resume_requested',
    VIDEO_PLAYING : 'video_playing',
    VIDEO_PAUSED : 'video_paused'

  };

  const RequiredPluginFunctions =
  [
    "getName",
    "getVersion",
    "init",
    "makeActive",
    "makeInactive"
  ];

  const MAX_PLUGINS = 20; //this is an arbitrary limit but we shouldn't ever reach this (not even close).

    /**
     * Helper function to make functions private to GoogleIMA variable for consistency
     * and ease of reading.
     */
  var privateMember = _.bind(function(functionVar)
  {
    if (!_.isFunction(functionVar))
    {
      throw (createErrorString("Trying to make private function but " + functionVar + " is not a function."));
      return;
    }
    return _.bind(functionVar, this);
  }, this);


  this.registerPlugin = function(newPlugin)
  {
    var pluginId;
    if (!newPlugin)
    {
      OO.log(createErrorString("Trying to register plugin that has falsy value."));
      return pluginId;
    }

    var errorOccured = false;
    var isValidPlugin = validatePlugin(newPlugin);
    if (isValidPlugin)
    {
      try
      {
        pluginId = createPluginId(newPlugin);
        if (!registeredPlugins[pluginId])
        {
          registeredPlugins[pluginId] = newPlugin;
        }

      }
      catch (error)
      {
        OO.log(error);
        errorOccured = true;
      }
    }
    else
    {
      errorOccured = true;
    }

    if (errorOccured)
    {
      OO.log(createErrorString("\'" + pluginId + "\' is not valid and was not registered."));
    }

    return pluginId;
  };

  this.unregisterPlugin = function(pluginToRemove)
  {
    var removedSuccessfully = false;
    if (pluginToRemove && registeredPlugins && registeredPlugins.hasOwnProperty(pluginToRemove))
    {
      delete registeredPlugins[pluginToRemove];
      removedSuccessfully = true;
    }

    return removedSuccessfully;
  };

  /**
   * [privateMember description]
   * @param  {[type]} function(plugin [description]
   * @return {boolean} True if plugin contains all the correct functions and
   *                        public variables.
   */
  var validatePlugin = privateMember(function(plugin)
  {
    var isValid = false;
    if (plugin)
    {
      isValid = true;
      for (reqFunc in RequiredPluginFunctions)
      {
        if(!plugin.hasOwnProperty(reqFunc) || typeof plugin[reqFunc] !== 'function')
        {
          isValid = false;
          break;
        }
      }

    }
    return isValid;
  });

  /**
   * [function description]
   * @return {[type]} [description]
   */
  this.getPluginList = function()
  {
    for ( property in registeredPlugins )
    {
      //TODO
    }
    return null;
  };

  /**
   * [function description]
   * @return {[type]} [description]
   */
  this.isPluginActive = function(pluginId)
  {
    return false;
  };

  /**
   * [function description]
   * @return {[type]} [description]
   */
  this.makePluginActive = function(pluginId)
  {
    return false;
  };

  /**
   * [function description]
   * @return {[type]} [description]
   */
  this.makePluginInactive = function(pluginId)
  {
    return false;
  };

  this.publishMessage = function(msgName, params)
  {
    mb.publish(msgName, params);
  }

  //In case someone needs to register multiple of the same plugin, this creates unique ids for each.
  var createPluginId = privateMember(function(plugin)
  {
    var id = null;
    if (plugin)
    {
      var name = plugin.getName();
      var version = plugin.getVersion();
      if (name && version)
      {
        if (uniquePluginId < MAX_PLUGINS)
        {
          id = name + "_" + version + "_" + uniquePluginId;
          //we shouldn't have any naming conflicts but just in case, throw an error
          if (registeredPlugins[id])
          {
              throw createErrorString("Failed to create a unique name for plugin " + name + "_" + version);
          }
          uniquePluginId++;
        }
        else
        {
          throw createErrorString("you have tried to create more than " + MAX_PLUGINS + " unique plugin ids. There is probably an infinite loop or some other error.");
        }
      }
    }
    return id;
  });

  var createErrorString = function(orgString)
  {
    return "ERROR Analytics Framework: " + orgString;
  }

  this.registerForMessage = function(msg, callback, pluginName)
  {

  }

  this.unregisterForMessage = function(msg, callback, pluginName)
  {

  }

  return this;
};

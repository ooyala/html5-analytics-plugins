require("../../html5-common/js/classes/message_bus.js")
require("../../html5-common/js/utils/InitModules/InitOOUnderscore.js")

var OoyalaAnalyticsFramework = function()
{
  var _registeredPlugins = {};
  var _mb = new OO.MessageBus();
  var _recordedMessages = [];

  var _ = OO._;

  var _uniquePluginId = 0;
  const MAX_PLUGINS = 20; //this is an arbitrary limit but we shouldn't ever reach this (not even close).

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

  //list of required functions for plugins
  const REQUIRED_FUNCTIONS =
  [
    "getName",
    "getVersion",
    "init",
    "makeActive",
    "makeInactive"
  ];

  this.REQUIRED_FUNCTIONS = REQUIRED_FUNCTIONS;

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
        if (!_registeredPlugins[pluginId])
        {
          _registeredPlugins[pluginId] = newPlugin;
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
    if (pluginToRemove && _registeredPlugins && _registeredPlugins.hasOwnProperty(pluginToRemove))
    {
      delete _registeredPlugins[pluginToRemove];
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
  this.validatePluginFactory = function(factory)
  {
    var isValid = false;
    if (factory && typeof factory === 'function')
    {
      isValid = true;
      //TODO do we need to register factories or plugins?
      var toValidate = new factory();
      if (!toValidate)
      {
        isValid = false;
        OO.log("Plugin factory return falsy value for plugin.");
      }

      if (isValid)
      {
        for ( var i = 0; i < REQUIRED_FUNCTIONS.length; i++)
        {
          var reqFunc = REQUIRED_FUNCTIONS[i];
          if(!toValidate.hasOwnProperty(reqFunc) || typeof toValidate[reqFunc] !== 'function')
          {
            isValid = false;
            if(toValidate.getName && typeof toValidate.getName === 'function')
            {
              OO.log("Plugin \'" + toValidate.getName() + "\' missing function: " + reqFunc);
            }
            else
            {
              OO.log("Plugin missing missing function: " + reqFunc);
            }
            break;
          }
        }
      }

      //if it's still valid check whether the getName returns a non empty string
      if (isValid)
      {
        var name = toValidate.getName();
        if (!name || typeof name !== 'string')
        {
          OO.log("Plugin does not have \'string\' as return type of getName() or is empty string");
          isValid = false;
        }
      }

      if (isValid)
      {
        var version = toValidate.getVersion();
        if (!version || typeof version !== 'string')
        {
          OO.log("Plugin does not have \'string\' as return type of getVersion() or is empty string");
          isValid = false;
        }
      }
    }
    return isValid;
  };

  /**
   * [function description]
   * @return {[type]} [description]
   */
  this.getPluginList = function()
  {
    for ( property in _registeredPlugins )
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
    //TODO only publish messages for active plugins
    _mb.publish(msgName, params);
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
        if (_uniquePluginId < MAX_PLUGINS)
        {
          id = name + "_" + version + "_" + _uniquePluginId;
          //we shouldn't have any naming conflicts but just in case, throw an error
          if (_registeredPlugins[id])
          {
              throw createErrorString("Failed to create a unique name for plugin " + name + "_" + version);
          }
          _uniquePluginId++;
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
};

module.exports = OoyalaAnalyticsFramework;

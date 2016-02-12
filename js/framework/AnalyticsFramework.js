require("../../html5-common/js/classes/message_bus.js")
require("../../html5-common/js/utils/InitModules/InitOOUnderscore.js")
require("./InitAnalyticsNamespace.js");
require("./AnalyticsConstants.js");

OO.Analytics.Framework = function()
{
  var _registeredPlugins = {};
  var _mb = new OO.MessageBus();
  var _recordedEvents = [];

  var _ = OO._;

  var _uniquePluginId = 0;
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


  this.RecordedEvent = function (timeStampIn, eventDataIn)
  {
    this.timeStamp = timeStampIn;
    this.eventData = eventDataIn;
  }

  var recordEvent = function(eventData)
  {
    var timeStamp = new Date().getTime();
    var eventToRecord = new RecordedEvent(timeStamp, eventData);
    recordedEvents.push(eventToRecord);
  }

  var clearRecordedEvents = function()
  {
    _recordedEvents = [];
  }

  var startRecordingEvents = function()
  {

  }

  var stopRecordingEvents = function()
  {

  }

  /**
   * [function description]
   * @param  {[type]} pluginClass [description]
   * @return {[type]}             [description]
   */
  this.registerPlugin = function(pluginClass)
  {
    var pluginID;
    var plugin;
    var errorOccured = false;
    var isValidPlugin

    //sanity check
    if (!pluginClass)
    {
      OO.log(createErrorString("Trying to register plugin class that is a falsy value."));
      errorOccured = true;
    }

    if (!errorOccured)
    {
      try
      {
        plugin = new pluginClass();
      }
      catch (error)
      {
        OO.log(error);
        OO.log(createErrorString("Error was thrown during plugin creation."))
        errorOccured = true;
      }
    }

    if (!errorOccured)
    {
      isValidPlugin = this.validatePlugin(plugin);
      if (!isValidPlugin)
      {
        errorOccured = true;
      }
    }

    if (!errorOccured)
    {
      pluginID = createPluginId(plugin);
      if (!pluginID)
      {
        errorOccured = true;
      }
      else if (!_registeredPlugins[pluginID])
      {
        _registeredPlugins[pluginID] = {factory:pluginClass, instance:plugin};
      }
    }

    if (errorOccured)
    {
      if(pluginID)
      {
        OO.log(createErrorString("\'" + pluginID + "\' is not valid and was not registered."));
      }
      else
      {
        if(plugin && plugin.getName && typeof plugin.getName === 'function' && typeof plugin.getName() === 'string')
        {
          OO.log(createErrorString("\'" + plugin.getName() + "\' is not valid and was not registered."));
        }
        else
        {
          OO.log(createErrorString("Plugin validation failed and was not registered."));
        }
      }
    }

    return pluginID;
  };

  this.unregisterPlugin = function(pluginIDToRemove)
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
  this.validatePlugin = function(plugin)
  {
    var isValid = true;
    if (!plugin)
    {
      isValid = false;
      OO.log("Plugin has falsy value and is not valid. Actual value: ", plugin);
    }

    if (isValid)
    {
      //test if all required functions are in the plugin
      for ( var i = 0; i < OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS.length; i++)
      {
        var reqFunc = OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS[i];
        if(!plugin.hasOwnProperty(reqFunc) || typeof plugin[reqFunc] !== 'function')
        {
          isValid = false;
          if(plugin.getName && typeof plugin.getName === 'function')
          {
            OO.log("Plugin \'" + plugin.getName() + "\' missing function: " + reqFunc);
          }
          else
          {
            OO.log("Plugin missing function: " + reqFunc);
          }
          break;
        }
      }

      //if it's still valid check whether the getName returns a non empty string
      if (isValid)
      {
        var name = plugin.getName();
        if (!name || typeof name !== 'string')
        {
          OO.log("Plugin does not have \'string\' as return type of getName() or is empty string");
          isValid = false;
        }
      }

      //if it's still valid check whether the getVersion returns a non empty string
      if (isValid)
      {
        var version = plugin.getVersion();
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
   * Get a list of currently registered plugins.
   * @return {array} An array of plugin IDs.
   *
   */
  this.getPluginList = function()
  {
    var list = [];
    for (pluginID in _registeredPlugins)
    {
      list.push(pluginID);
    }
    return list;
  };

  /**
   * [function description]
   * @return {boolean} Returns true if plugin is currently active and interpreting messages.
   */
  this.isPluginActive = function(pluginID)
  {
    return false;
  };

  /**
   * [function description]
   * @return {boolean} Returns true if plugin found and was able to be activated.
   */
  this.makePluginActive = function(pluginID)
  {
    return false;
  };

  /**
   * [function description]
   * @return {boolean} Returns true if plugin found and was able to be deactivated.
   */
  this.makePluginInactive = function(pluginID)
  {
    return false;
  };

  /**
   * [function description]
   * @param  {[type]} msgName [description]
   * @param  {[type]} params  [description]
   * @return {[type]}         [description]
   */
  this.publishMessage = function(msgName, params)
  {
    //TODO only publish messages for active plugins
    _mb.publish(msgName, params);
  }

  /**
   * In case someone needs to register multiple of the same plugin, this creates unique ids for each.
   * @param  {[type]} plugin [description]
   * @return {[type]}                 [description]
   */
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
          id = _uniquePluginId + "_" + name + "_" + version;
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

 /**
  * [function description]
  * @param  {[type]} orgString [description]
  * @return {[type]}           [description]
  */
  var createErrorString = function(orgString)
  {
    return "ERROR Analytics Framework: " + orgString;
  };


  /**
   * [function description]
   * @param  {[type]}   msg      [description]
   * @param  {Function} callback [description]
   * @param  {[type]}   pluginID [description]
   * @return {boolean}           True if callback was successfully unregistered for pluginID
   */
  this.registerForMessage = function(msg, callback, pluginID)
  {
    return false;
  };

  /**
   * [function description]
   * @param  {[type]}   msg      [description]
   * @param  {Function} callback [description]
   * @param  {[type]}   pluginID [description]
   * @return {boolean}           True if callback was successfully unregistered for pluginID
   */
  this.unregisterForMessage = function(msg, callback, pluginID)
  {
    return false;
  };

  this.getRegisteredMessageListFor = function(pluginID)
  {
    var list = [];
    return list;
  };

  // Helpers
  // Safely trigger an ad manager function
  var _safeFunctionCall = function(plugin, func, params) {
    if (OO.DEBUG)
    {
      _debugCheckFunctionIsInRequiredList(func);
    }

    try
    {
      if (_.isFunction(plugin[func]))
      {
        return plugin[func].apply(plugin, params);
      }
    }
    catch (err)
    {
      if (plugin && _isFunction(plugin.getName))
      {
        OO.log(this.createErrorString("Error occurred during call to function \'" + func + "\' on plugin \'" + plugin.getName() + "\'\n", err));
      }
      else
      {
        OO.log(this.createErrorString("Error occurred during call to function \'" + func + "\' on plugin\n", err));
      }
    }
    return null;
  };

  var _debugCheckFunctionIsInRequiredList = function(func)
  {
    if(!_.contains(OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS, func))
    {
      throw createErrorString("Calling function \'" + func + "\' in framework code and it's not in the REQUIRED_PLUGIN_FUNCTIONS list.");
    }
  }
};

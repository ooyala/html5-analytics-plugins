require("../../html5-common/js/classes/message_bus.js")
require("../../html5-common/js/utils/InitModules/InitOOUnderscore.js")
require("./InitAnalyticsNamespace.js");
require("./AnalyticsConstants.js");

OO.Analytics.Framework = function()
{
  var _registeredPlugins = {};
  var _recordedEventList = [];
  var _recording = true;
  var _videoMetadata;
  var _ = OO._;

  var _uniquePluginId = 0;
  const MAX_PLUGINS = 20; //this is an arbitrary limit but we shouldn't ever reach this (not even close).

  //TODO add state machine, need states init, ready, waitforpluginsToInit, video ended.
  //init waiting for metadata
  //ready inits

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


  this.RecordedEvent = function (timeStamp, msgName, params)
  {
    this.timeStamp = timeStamp;
    this.msgName = msgName;
    this.params = params;
  }

  var recordEvent = privateMember(function(msgName, params)
  {
    var timeStamp = new Date().getTime();
    var eventToRecord = new RecordedEvent(timeStamp, msgName, params);
    recordedEvents.push(eventToRecord);
  });

  var clearRecordedEvents = privateMember(function()
  {
    _recordedEvents = [];
  });

  var startRecordingEvents = privateMember(function()
  {
    _recording = true;
  });

  var stopRecordingEvents = privateMember(function()
  {
    _recording = false;
  });

  this.getRecordedEvents = function()
  {
    return _.clone(_recordedEventList);
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
      if (!this.validatePlugin(plugin))
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

        var pluginName = _safeFunctionCall(plugin, "getName");
        if (pluginName)
        {
          OO.log(createErrorString("\'" + pluginName + "\' is not valid and was not registered."));
        }
        else
        {
          OO.log(createErrorString("Plugin validation failed and was not registered."));
        }
      }
    }

    return pluginID;
  };

  /**
   * [function description]
   * @param  {[type]} pluginIDToRemove [description]
   * @return {[type]}                  [description]
   */
  this.unregisterPlugin = function(pluginIDToRemove)
  {
    var removedSuccessfully = false;
    if (pluginIDToRemove && _registeredPlugins && _registeredPlugins[pluginIDToRemove])
    {
      delete _registeredPlugins[pluginIDToRemove];
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

    /////////////////////////////////////////////////////////////////////////////////////////////
    ///IMPORTANT: This should be the only function to break the rule of using _safeFunctionCall
    ///           for calling plugin functions, since it's checking if the plugin is valid to
    ///           begin with.
    /////////////////////////////////////////////////////////////////////////////////////////////

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

  var getPluginInstance = privateMember(function(pluginID)
  {
    var toReturn;
    if (_registeredPlugins && _registeredPlugins[pluginID])
    {
      toReturn = _registeredPlugins[pluginID].instance;
    }
    return toReturn;
  });

  /**
   * [function description]
   * @return {boolean} Returns true if plugin is currently active and interpreting messages.
   */
  this.isPluginActive = function(pluginID)
  {
    var plugin = this.getPluginInstance(pluginID);
    if (plugin)
    {
      return _safeFunctionCall(plugin, "isActive");
    }
    return false;
  };

  /**
   * [function description]
   * @return {boolean} Returns true if plugin found and was able to be activated.
   */
  this.makePluginActive = function(pluginID)
  {
    var success = false;
    if (pluginID && _registeredPlugins && _registeredPlugins[pluginID])
    {
      var plugin = _registeredPlugins[pluginID];
      _safeFunctionCall(plugin, "makePluginActive");
      if (_safeFunctionCall(plugin, "isActive"))
      {
        success = true;
      }
      else
      {
          OO.log(createErrorString("Calling 'makePluginActive' on \'" + pluginID + "\' did not make it active."));
      }

    }
    return success;
  };

  /**
   * [function description]
   * @return {boolean} Returns true if plugin found and was able to be deactivated.
   */
  this.makePluginInactive = function(pluginID)
  {
    var success = false;
    if (pluginID && _registeredPlugins && _registeredPlugins[pluginID])
    {
      var plugin = _registeredPlugins[pluginID];
      plugin.makePluginInactive();
      if (!_registeredPlugins.isActive())
      {
        success = true;
      }
      else
      {
        OO.log(createErrorString("Calling 'makePluginInactive' on \'" + pluginID + "\' did not make it inactive."));
      }
    }
    return success;
  };

  /**
   * [function description]
   * @param  {[type]} msgName [description]
   * @param  {[type]} params  [description]
   * @return {[type]}         [description]
   */
  this.publishMessage = function(msgName, params)
  {
    var msgPublished = false;
    if (OO.Analytics.EVENTS[msgName])
    {
      //TODO: check if analytics framework should interpret the message.
    }
    else
    {

    }
    //record the message
    if(_recording)
    {
      recordEvent(msgName, params);
    }

    //propogate the message to all active plugins.
    var pluginID;
    for (pluginID in _registeredPlugins)
    {
      var plugin = _registeredPlugins[pluginID];
      if (_safeFunctionCall(plugin, "isActive"))
      {
        _safeFunctionCall(plugin, "processEvent",[msgName, params]);
      }
    }
    msgPublished = true;

    return msgPublished;
  }

  /**
   * In case someone needs to register multiple of the same plugin, this creates unique ids for each.
   * @param  {[type]} plugin [description]
   * @return {[type]}                 [description]
   */
  var createPluginId = privateMember(function(plugin)
  {
    var id = null;
    var error;
    if (plugin)
    {
      var name = _safeFunctionCall(plugin, "getName");
      var version = _safeFunctionCall(plugin, "getVersion");
      if (name && version)
      {
        if (_uniquePluginId < MAX_PLUGINS)
        {
          id = _uniquePluginId + "_" + name + "_" + version;
          //we shouldn't have any naming conflicts but just in case, throw an error
          if (!_registeredPlugins[id])
          {
            _uniquePluginId++;
          }
          else
          {
            OO.log(createErrorString("Failed to create a unique name for plugin " + name + "_" + version));
            id = null;
          }
        }
        else
        {
          OO.log(createErrorString("you have tried to create more than " + MAX_PLUGINS + " unique plugin ids. There is probably an infinite loop or some other error."));
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

  // Helpers
  // Safely trigger an ad manager function
  var _safeFunctionCall = privateMember(function(plugin, func, params)
  {
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
      if (plugin && _.isFunction(plugin.getName))
      {
        OO.log(createErrorString("Error occurred during call to function \'" + func + "\' on plugin \'" + plugin.getName() + "\'\n", err));
      }
      else
      {
        OO.log(createErrorString("Error occurred during call to function \'" + func + "\' on plugin\n", err));
      }
    }
    return null;
  });

  var _debugCheckFunctionIsInRequiredList = privateMember(function(func)
  {
    if(!_.contains(OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS, func))
    {
      OO.log(createErrorString("Calling function \'" + func + "\' in framework code and it's not in the REQUIRED_PLUGIN_FUNCTIONS list."));
    }
  });

};

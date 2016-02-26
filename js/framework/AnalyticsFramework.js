require("../../html5-common/js/utils/InitModules/InitOOUnderscore.js")
require("./InitAnalyticsNamespace.js");
require("./AnalyticsConstants.js");

 /**
 * @class OO.Analytics.RecordedEvent
 * @classdesc Store the information for a published event, including the time
 * was sent.
 * @param  {int}    timeStamp The time the event was published
 * @param  {string} eventName The event name
 * @param  {Array}  params The parameters passed in with the event
 */
OO.Analytics.RecordedEvent = function(timeStamp, eventName, params)
{
  this.timeStamp = timeStamp;
  this.eventName = eventName;
  this.params = params;
}

/**
 * @class OO.Analytics.Framework
 * @classdesc The Analytics Framework goal is to abstract capturing all the events
 * in code for the purpose of analytics reporting (from any source). When a plugin
 * is registered with the framework, it will be validated, registered and automatically
 * receive all messages that are published to the framework.  The list of events that are
 * currently supported are located in AnalyticsConstants.js.  That file also contains
 * all the methods that need to be implemented by a plugin for it to be considered valid.
 */
OO.Analytics.Framework = function()
{
  var _ = OO._;
  var _registeredPlugins = {};
  var _recordedEventList = [];
  var _recording = true;
  var _pluginMetadata;
  var _eventExistenceLookup = {};
  var _uniquePluginId = 0;
  const MAX_PLUGINS = 20; //this is an arbitrary limit but we shouldn't ever reach this (not even close).

  /**
   * Helper function for readability mainly. Binds private functions to 'this' instance
   * of Framework, to give access to private variables.
   * @private
   * @method OO.Analytics.Framework#privateMember
   * @param  {function} functionVar The function to be bound to this instance of Framework
   * @return {function}             Bound function.
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


  /**
   * Set the metadata for all plugins. Each plugin will only receive the data
   * pluginMetadata["myPluginName"]. This can only be set once per framework instance.
   * @public
   * @method OO.Analytics.Framework#setPluginMetadata
   * @param  {object}  pluginMetadata Object containing metadata for all plugins
   * @return {boolean}                Return true if metadata is valid and has not been set before
   */
  this.setPluginMetadata = function(pluginMetadata)
  {
    var success = false;
    if (!_pluginMetadata)
    {
      if (_.isObject(pluginMetadata))
      {
        //set the metadata and then set it on any plugin that is already registered
        _pluginMetadata = pluginMetadata
        var pluginList = this.getPluginList();
        for (var i = 0; i < pluginList.length; i++)
        {
            var plugin = getPluginInstance(pluginList[i]);
            passMetadataToPlugin(plugin);
        }

        success = true;
      }
      else
      {
        OO.log(createErrorString("Calling setPluginMetadata without valid metadata object. Defaulting to no metadata"));
      }
    }
    else
    {
      OO.log(createErrorString("Trying to run setPluginMetadata more than once. Ignoring new data."));
    }
    return success;
  }

  /**
   * Adds event and params to list of recorded events.  Plugins can later grab
   * this info in case events are published before the plugin is ready to process
   * them.
   * @private
   * @method OO.Analytics.Framework#recordEvent
   * @param  {string} eventName Event name to record
   * @param  {Array}  params    The params sent along with the event.
   */
  var recordEvent = privateMember(function(eventName, params)
  {
    var timeStamp = new Date().getTime();
    var eventToRecord = new OO.Analytics.RecordedEvent(timeStamp, eventName, params);
    _recordedEventList.push(eventToRecord);
  });

  /**
   * Clears the list of recorded events.
   * @private
   * @method OO.Analytics.Framework#clearRecordedEvents
   */
  var clearRecordedEvents = privateMember(function()
  {
    _recordedEventList = [];
  });

  /**
   * Enable recording of events.
   * @private
   * @method OO.Analytics.Framework#startRecordingEvents
   */
  var startRecordingEvents = privateMember(function()
  {
    _recording = true;
  });

  /**
   * Disable recording of events.
   * @private
   * @method OO.Analytics.Framework#stopRecordingEvents
   */
  var stopRecordingEvents = privateMember(function()
  {
    _recording = false;
  });

  /**
   * Returns an array of the currently stored recordedEvents in chronological
   * order.
   * @public
   * @method OO.Analytics.Framework#getRecordedEvents
   * @return {Array} List of recordedEvents in chronological order.
   */
  this.getRecordedEvents = function()
  {
    return _.clone(_recordedEventList);
  }

  /**
   * Register plugin as a factory. It will be validated and an instance of it will
   * be maintained internally.  The plugin will then be able to receive events
   * from the framework. Multiple of the same plugin factory can be registered.
   * Each one will have it's own unique plugin id.
   * @public
   * @method OO.Analytics.Framework#registerPlugin
   * @param  {function} pluginFactory Plugin factory function
   * @return {string}                 Returns a unique plugin id for this plugin factory
   */
  this.registerPlugin = function(pluginFactory)
  {
    var pluginID;
    var plugin;
    var errorOccured = false;

    //sanity check
    if (!pluginFactory)
    {
      OO.log(createErrorString("Trying to register plugin class that is a falsy value."));
      errorOccured = true;
    }

    if (!errorOccured)
    {
      try
      {
        plugin = new pluginFactory();
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
      else
      {
        //initialize the plugin. If we have metadata then give it to the plugin. Otherwise it will be sent in Analytics.Framework.setPluginMetadata;
        safeFunctionCall(plugin, "init");
        if (_pluginMetadata)
        {
          passMetadataToPlugin(plugin);
        }
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
        _registeredPlugins[pluginID] = {factory:pluginFactory, instance:plugin};
        plugin.setPluginID(pluginID);
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
        var pluginName = safeFunctionCall(plugin, "getName");
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
   * Remove plugin from the framework. All instances will stop receiving messages from
   * the framework.
   * @public
   * @method OO.Analytics.Framework#unregisterPlugin
   * @param  {string}  pluginIDToRemove Plugin id to be removed.
   * @return {boolean}                  Return true if plugin was found and removed.
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
   * Validates that a plugin instance has all the correct functions.
   * @public
   * @method OO.Analytics.Framework#validatePlugin
   * @param  {object} plugin Plugin instance to be validated
   * @return {boolean}       Return true if plugin contains all the correct functions.
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
    ///IMPORTANT: This should be the only function to break the rule of using safeFunctionCall
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
        try
        {
          var name = plugin.getName();
          if (!name || !_.isString(name))
          {
            OO.log(createErrorString("Plugin does not have \'string\' as return type of getName() or is empty string"));
            isValid = false;
          }
        }
        catch (e)
        {
          OO.log(createErrorString("Plugin throws error on call to getName"));
          isValid = false;
        }

      }

      //if it's still valid check whether the getVersion returns a non empty string
      if (isValid)
      {
        try
        {
          var version = plugin.getVersion();
          if (!version || !_.isString(version))
          {
            OO.log(createErrorString("Plugin does not have \'string\' as return type of getVersion() or is empty string"));
            isValid = false;
          }
        }
        catch(e)
        {
          OO.log(createErrorString("Plugin throws error on call to getVersion"));
          isValid = false;
        }
      }
    }
    return isValid;
  };

  /**
   * Get a list of plugin ids for the currently registered plugins.
   * @public
   * @method OO.Analytics.Framework#getPluginList
   * @return {Array} An array of plugin IDs.
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
   * Return the instance of the plugin for a given id. This is for convinience
   * since the factory and instance are stored together in an object.
   * @private
   * @method OO.Analytics.Framework#getPluginInstance
   * @param  {string} pluginID The id of the plugin.
   * @return {object}          Returns the plugin instance.
   */
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
   * Return whether a plugin is active and able to receive events.
   * @public
   * @method OO.Analytics.Framework#isPluginActive
   * @param {string}  pluginID Plugin id to check
   * @return {boolean}         Returns true if plugin is active. If plugin isn't registered, it will return false.
   */
  this.isPluginActive = function(pluginID)
  {
    var plugin = getPluginInstance(pluginID);
    if (plugin)
    {
      return safeFunctionCall(plugin, "isActive");
    }
    return false;
  };

  /**
   * Set a plugin to be active and receive messages.
   * @public
   * @method OO.Analytics.Framework#makePluginActive
   * @param {string}   pluginID Plugin id to set to active.
   * @return {boolean}          Returns true if plugin found and was able to be activated.
   */
  this.makePluginActive = function(pluginID)
  {
    var success = false;
    if (pluginID && _registeredPlugins && _registeredPlugins[pluginID])
    {
      var plugin = getPluginInstance(pluginID);
      safeFunctionCall(plugin, "makeActive");
      if (safeFunctionCall(plugin, "isActive"))
      {
        success = true;
      }
      else
      {
        OO.log(createErrorString("Calling 'makeActive' on \'" + pluginID + "\' did not make it active."));
      }

    }
    return success;
  };

  /**
   * Set a plugin to be inactive.
   * @public
   * @method OO.Analytics.Framework#makePluginInactive
   * @param  {string}  pluginID Plugin id to set to inactive
   * @return {boolean}          Returns true if plugin found and was able to be deactivated.
   */
  this.makePluginInactive = function(pluginID)
  {
    var success = false;
    if (pluginID && _registeredPlugins && _registeredPlugins[pluginID])
    {
      var plugin = getPluginInstance(pluginID);
      safeFunctionCall(plugin, "makeInactive");
      if (!safeFunctionCall(plugin, "isActive"))
      {
        success = true;
      }
      else
      {
        OO.log(createErrorString("Calling 'makeInactive' on \'" + pluginID + "\' did not make it inactive."));
      }
    }
    return success;
  };

  //PublishMessage should only publish messages that are in OO.Analytics.EVENTS.
  //To avoid doing an expensive string search through OO.Analyitcs.EVENTS for this checking,
  //here we convert OO.Analytics.EVENTS into another object where we can directly look up if
  //the message exists.
  for(tempEventName in OO.Analytics.EVENTS)
  {
     _eventExistenceLookup[OO.Analytics.EVENTS[tempEventName]] = true;
  }

  /**
   * Publish an event to all registered and active plugins.
   * @public
   * @method OO.Analytics.Framework#publishEvent
   * @param  {string} eventName Name of event to publish
   * @param  {Array}  params    Parameters to pass along with the event.
   * @return {boolean}          Return true if message is in OO.Analytics.EVENTS and was successfully published.
   */
  this.publishEvent = function(eventName, params)
  {
    var eventPublished = false;
    if (_eventExistenceLookup[eventName])
    {
      //if the params don't come in as an Array then create an empty array to pass in for everything.
      if (!_.isArray(params))
      {
        params = [];
      }

      //record the message
      if(_recording)
      {
        recordEvent(eventName, params);
      }

      //propogate the message to all active plugins.
      var pluginID;
      for (pluginID in _registeredPlugins)
      {
        var plugin = _registeredPlugins[pluginID].instance;
        if (safeFunctionCall(plugin, "isActive"))
        {
          safeFunctionCall(plugin, "processEvent",[eventName, params]);
        }
      }
      eventPublished = true;
    }
    else
    {
      OO.log(createErrorString("Event \'" + eventName + "\' being published and it's not in the list of OO.Analytics.EVENTS"));
    }

    return eventPublished;
  }

  /**
   * Create a unique id for a given plugin/factory. In case someone needs to register
   * multiple of the same plugin or two plugins  have the same name, this creates
   * unique ids for each.
   * @private
   * @method OO.Analytics.Framework#createPluginId
   * @param  {object} plugin Instance of plugin to create id for.
   * @return {string}        The plugin id.
   */
  var createPluginId = privateMember(function(plugin)
  {
    var id = null;
    var error;
    if (plugin)
    {
      var name = safeFunctionCall(plugin, "getName");
      var version = safeFunctionCall(plugin, "getVersion");
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
   * Helper function to give a plugin it's correct set of metadata.
   * @private
   * @method OO.Analytics.Framework#passMetadataToPlugin
   * @param  {object} plugin The plugin instance to give the metadata to
   */
  var passMetadataToPlugin = privateMember(function(plugin)
  {
    if (_pluginMetadata)
    {
      var pluginName = safeFunctionCall(plugin, "getName");
      if (!pluginName)
      {
        OO.log(createErrorString("Trying to pass in metadata to plugin that does not have valid name"));
        return;
      }

      var metadataForThisPlugin = _pluginMetadata[pluginName];
      safeFunctionCall(plugin, "setMetadata", [metadataForThisPlugin]);
    }
  });

 /**
  * Helper function to create consistent error messages.
  * @private
  * @method OO.Analytics.Framework#createErrorString
  * @param  {string} errorDetails The error details.
  * @return {string}              The new error message.
  */
  var createErrorString = function(errorDetails)
  {
    return "ERROR Analytics Framework: " + errorDetails;
  };

  /**
   * This function does several things:
   * -Safely call a function on an instance of a plugin.
   * -Elminates checking to see if function exists.
   * -If an error is thrown while calling the function, this will catch it and
   * output a message and the framework can continue running.
   * -If OO.DEBUG is true, safeFunctionCall will check if the function being called
   * is in the list of required functions. If it's not, then it will output a message.
   * Only functions in the required list should be called in the framework code.
   * @private
   * @method OO.Analytics.Framework#safeFunctionCall
   * @param  {object} plugin   Plugin instance to call function on.
   * @param  {string} funcName Name of function to call.
   * @param  {array}  params   The parameters to pass into the function.
   * @return {varies}          Returns the function's return value. If an error occurred, returns null.
   */
  var safeFunctionCall = privateMember(function(plugin, funcName, params)
  {
    if (OO.DEBUG)
    {
      debugCheckFunctionIsInRequiredList(funcName);
    }

    try
    {
      if (_.isFunction(plugin[funcName]))
      {
        return plugin[funcName].apply(plugin, params);
      }
    }
    catch (err)
    {
      try
      {
        if (plugin && _.isFunction(plugin.getName))
        {
          OO.log(createErrorString("Error occurred during call to function \'" + funcName + "\' on plugin \'" + plugin.getName() + "\'\n", err));
        }
      }
      catch(e)
      {
        OO.log(createErrorString("Error occurred during call to function \'" + funcName + "\' on plugin\n", err));
      }
    }

    return null;
  });

  /**
   * Check if function name exists in the list of require functions for plugins.
   * Outputs error message if it doesn't exist.
   * @private
   * @method OO.Analytics.Framework#safeFunctionCall
   * @param  {string} funcName Name of the function to check.
   */
  var debugCheckFunctionIsInRequiredList = privateMember(function(funcName)
  {
    if(!_.contains(OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS, funcName))
    {
      OO.log(createErrorString("Calling function \'" + funcName + "\' in framework code and it's not in the REQUIRED_PLUGIN_FUNCTIONS list."));
    }
  });

  if (!OO.Analytics.FrameworkInstanceList)
  {
    OO.Analytics.FrameworkInstanceList = [];
  }

  var frameworkRegistrationObject = function(framework)
  {
    this.registerPluginFactory = function(pluginFactory)
    {
      framework.registerPlugin(pluginFactory);
    }
  }
  //push this instance into the global list of framework instances.
  var frameworkRegistrationObject = new frameworkRegistrationObject(this);
  OO.Analytics.FrameworkInstanceList.push(frameworkRegistrationObject);

  //check to see if any plugin factories already existed and register them to this plugin.
  if (_.isArray(OO.Analytics.PluginFactoryList) && OO.Analytics.PluginFactoryList.length > 0)
  {
    for (var i = 0; i < OO.Analytics.PluginFactoryList.length; i++)
    {
      this.registerPlugin(OO.Analytics.PluginFactoryList[i]);
    }
  }
};
